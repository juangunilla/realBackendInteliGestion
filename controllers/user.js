const res = require('express/lib/response');
const { default: mongoose, model } = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const user = require('../models/user');
const nodemailer = require("nodemailer");
const jwtService = require("../services/jwt");
const fs = require('fs');
const path = require('path');
const webPush = require('../config/webpush');
const { ALL_ROLES, REGISTRATION_ROLES, SUPERADMIN_ROLE, SUPER_ADMIN_EMAIL } = require('../config/roles');

const normalizeEmail = (value) => {
  if (!value) return '';
  return value.toLowerCase().trim();
};

const sanitizeRole = (value) => {
  if (!value) return undefined;
  return value.toLowerCase().trim();
};

const getItems = async (req, res) => {
  const { body } = req;
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos por enviar o no estas registrado"
    });
  } else {
    const normalizedCorreo = normalizeEmail(correo);
    const data = await user.findOne({ correo: normalizedCorreo });
    if (!data || !data.password) {
      console.log("Correo inválido o no registrado");
      return res.status(404).send({
        status: "error",
        message: "Correo incorrecto o no registrado"
      });
    }
    let pwd = await bcrypt.compareSync(password, data.password);
    if (pwd == false) {
      console.log("Contraseña incorrecta");
      res.status(404).send({ status: "error", message: "contraseña incorrecta" });
    } else {
      const normalizedUserCorreo = normalizeEmail(data.correo);
      let userDocMutated = false;
      if (normalizedUserCorreo !== data.correo) {
        data.correo = normalizedUserCorreo;
        userDocMutated = true;
      }
      if (normalizedUserCorreo === SUPER_ADMIN_EMAIL && data.rol !== SUPERADMIN_ROLE) {
        data.rol = SUPERADMIN_ROLE;
        userDocMutated = true;
      }
      if (data.passwordChanged === false) {
        data.passwordChanged = true;
        userDocMutated = true;
      }
      if (userDocMutated) {
        await data.save();
      }
      const token = jwtService.createTokens(data);
      res.header('X-User-Rol', data.rol);

      const redirect = data.mustCompleteProfile ? 'complete-profile' : null;

      const responsePayload = {
        data: {
          correo: data.correo,
          nombre: data.nombreyapellido,
          id: data._id,
          rol: data.rol,
          image: data.image,
          mustCompleteProfile: data.mustCompleteProfile,
          passwordChanged: data.passwordChanged,
        },
        token,
      };

      if (redirect) {
        responsePayload.redirect = redirect;
      }

      res.status(200).send({
        status: "login",
        message: "Entrando a la base de datos",
        data: responsePayload,
      });
    }
  }
};



const profile = async (req, res) => {
  const { _id } = req.params;
  try {
    const data = await user.findById(_id).select({ password: 0 });
    if (!data) {
      return res.status(404).send({
        status: "error",
        message: "El usuario no existe"
      });
    }
    res.header('X-User-Rol', data.rol);
    return res.status(200).send({
      status: "success",
      data
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Error al obtener el usuario"
    });
  }
};

const filePath = path.resolve(__dirname, 'template/register.html');

const forgotPassword = async (req, res) => {
    const { correo } = req.body;
    if (!correo) {
        return res.status(400).send({ status: "error", message: "El correo es obligatorio." });
    }

    const normalizedCorreo = normalizeEmail(correo);
    const data = await user.findOne({ correo: normalizedCorreo });
    if (!data) {
        return res.status(404).send({ status: "error", message: "Usuario no encontrado." });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expiration = Date.now() + 3600000; // 1 hora

    data.resetPasswordToken = token;
    data.resetPasswordExpires = expiration;

    await data.save();

    const baseUrl = process.env.BASE_URL || 'https://gestionsepa.netlify.app';
    const resetUrl = `${baseUrl}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465, 
      secure: true,
      auth: {
          user: 'gestionsepa@inteli.com.ar',
          pass: 'inteliSepa23!',
      },
      tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false,
      },
      greetingTimeout: 30000, // Aumenta el tiempo de espera a 30 segundos
  });
  

    const mailOptions = {
        from: 'gestionsepa@inteli.com.ar',
        to: correo,
        subject: 'Restablecimiento de contraseña',
        text: `Estás recibiendo esto porque tú (u otra persona) ha solicitado el restablecimiento de la contraseña de tu cuenta.\n\n
               Por favor, haz clic en el siguiente enlace, o pégalo en tu navegador para completar el proceso:\n\n
               ${resetUrl}\n\n
               Si no solicitaste esto, ignora este correo y tu contraseña permanecerá sin cambios.\n`
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error('Error al enviar el correo:', err);
            return res.status(500).send({ status: 'error', message: 'Error al enviar el correo.' });
        }
        res.status(200).send({ status: 'success', message: 'Correo enviado para el restablecimiento de contraseña.' });
    });
};


const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).send({ status: "error", message: "Las contraseñas son obligatorias." });
  }

  if (password !== confirmPassword) {
    return res.status(400).send({ status: "error", message: "Las contraseñas no coinciden." });
  }

  const data = await user.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!data) {
    return res.status(400).send({ status: "error", message: "El token es inválido o ha expirado." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  data.password = hashedPassword;
  data.resetPasswordToken = undefined;
  data.resetPasswordExpires = undefined;

  await data.save();

  res.status(200).send({ status: "success", message: "Contraseña restablecida con éxito." });
};

const postItem = async (req, res) => {
  const { body } = req;
  const { nombreyapellido } = req.body;
  body.correo = normalizeEmail(body.correo);
  if (!body.correo) {
    return res.status(400).send({
      status: 'error',
      message: 'El correo es obligatorio.',
    });
  }

  const requestedRole = sanitizeRole(body.rol);
  if (requestedRole === SUPERADMIN_ROLE) {
    return res.status(403).send({
      status: 'error',
      message: 'El rol superadmin solo puede ser asignado por el superadministrador.',
    });
  }

  body.rol = REGISTRATION_ROLES.includes(requestedRole) ? requestedRole : 'seguidor';

  const existingUser = await user.findOne({ correo: body.correo });
  if (existingUser) {
    return res.status(400).send({
      status: 'Ya tienes una cuenta',
      message: 'El usuario ya tiene una cuenta',
    });
  }

  body.mustCompleteProfile = true;
  body.passwordChanged = true;

  bcrypt.hash(body.password, 10, (error, pwd) => {
    if (error) {
      return res.status(500).send({
        status: 'error',
        message: 'Error al hashear la contraseña.',
      });
    }

    body.password = pwd;
    const data = user.create(body);

    fs.readFile(filePath, 'utf8', (error, template) => {
      if (error) {
        console.log('Error al leer el archivo HTML:', error);
        return res.status(500).send({
          status: 'error',
          message: 'Error al leer el archivo HTML.',
        });
      }
      const htmlContent = template.replace('[Nombre]', nombreyapellido);

      const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465, 
        secure: true,
        auth: {
            user: 'gestionsepa@inteli.com.ar',
            pass: 'inteliSepa23!',
        },
        tls: {
            rejectUnauthorized: false,
        },
        greetingTimeout: 30000, // 30 segundos de tiempo de espera para el saludo
    });

      const mailOptions = {
        from: 'gestionsepa@inteli.com.ar',
        to: body.correo,
        subject: 'Registro exitoso',
        html: htmlContent,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error al enviar el correo:', error);
          return res.status(500).send({
            status: 'error',
            message: 'Error al enviar el correo.',
          });
        } else {
          console.log('Correo enviado:', info.response);
          return res.status(200).send({
            status: 'success',
            message: 'El usuario fue creado con éxito.',
          });
        }
      });
    });
  });
};

const uploader = (req, res) => {
  if (!req.file) {
    return res.status(404).send({
      status: 'error',
      message: 'Petición no incluye la imagen'
    });
  }

  const generatedImageName = req.file.filename;
  const extension = generatedImageName.split('.').pop();

  if (!['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
    const filePath = req.file.path;
    fs.unlinkSync(filePath); 
    return res.status(400).send({
      status: 'error',
      message: 'Extensión del archivo inválida'
    });
  }

  const oldImage = req.user.image;

  user.findByIdAndUpdate(
    req.user.id,
    { image: generatedImageName },
    { new: true }
  )
    .then(userUpdated => {
      if (!userUpdated) {
        throw new Error('Usuario no encontrado');
      }

      if (oldImage) {
        const oldImagePath = path.join(__dirname, '..', 'img', 'upload', oldImage);
        fs.unlinkSync(oldImagePath);
      }

      return res.status(200).send({
        status: 'success',
        user: userUpdated,
        file: req.file
      });
    })
    .catch(error => {
      return res.status(500).send({
        status: 'error',
        message: 'Error al subir el avatar'
      });
    });
};

const avatar = (req, res) => {
  const file = req.params.file;
  const filePath = './img/upload/' + file;

  fs.stat(filePath, (error, exists) => {
    if (!exists) return res.status(404).send({
      status: 'error',
      message: 'No existe la imagen'
    });

    return res.sendFile(path.resolve(filePath));
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.params;
  const { image } = req.body;
  try {
    await user.findByIdAndUpdate(_id, { image: image });
    return res.status(200).send({ status: "success", message: "El avatar fue cambiado con éxito." });
  } catch (error) {
    console.log('Error al modificar el avatar:', error);
    return res.status(500).send({ status: 'error', message: 'Error al modificar el avatar' });
  }
};

const updateCorreo = async (req, res) => {
  const { _id } = req.params;
  const { correo, confirmCorreo } = req.body;
  const normalizedCorreo = normalizeEmail(correo);
  const normalizedConfirmCorreo = normalizeEmail(confirmCorreo);
  if (normalizedCorreo !== normalizedConfirmCorreo) {
    return res.status(400).json({ error: "los correos no coinciden." });
  }
  try {
    await user.findByIdAndUpdate(_id, { correo: normalizedCorreo });
    return res.status(200).send({ status: "success", message: "El correo fue cambiado con éxito." });
  } catch (error) {
    console.log('Error al modificar el correo:', error);
    return res.status(500).send({ status: 'error', message: 'Error al modificar el correo' });
  }
};

const updateItem = async (req, res) => {
  const { _id } = req.params;
  const { password, confirmPassword, ...rest } = req.body;

  const updates = {};
  const parseBoolean = (value) => {
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return Boolean(value);
  };

  if (password || confirmPassword) {
    if (!password || !confirmPassword) {
      return res.status(400).json({
        error: 'Debes enviar la contraseña y su confirmación',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    updates.password = await bcrypt.hash(password, 10);
    updates.passwordChanged = true;
    if (typeof rest.mustCompleteProfile === 'undefined') {
      updates.mustCompleteProfile = false;
    }
  }

  const allowedProfileFields = ['nombreyapellido', 'profesional', 'image'];
  allowedProfileFields.forEach((field) => {
    if (typeof rest[field] !== 'undefined') {
      updates[field] = rest[field];
    }
  });

  if (typeof rest.mustCompleteProfile !== 'undefined') {
    updates.mustCompleteProfile = parseBoolean(rest.mustCompleteProfile);
  }

  if (
    typeof rest.passwordChanged !== 'undefined' &&
    typeof updates.passwordChanged === 'undefined'
  ) {
    updates.passwordChanged = parseBoolean(rest.passwordChanged);
  }

  if (!Object.keys(updates).length) {
    return res.status(400).send({
      status: 'error',
      message: 'No hay datos para actualizar.',
    });
  }

  try {
    const updatedUser = await user
      .findByIdAndUpdate(_id, { $set: updates }, { new: true })
      .select('-password');

    if (!updatedUser) {
      return res.status(404).send({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    return res.status(200).send({
      status: 'success',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).send('Error al actualizar el usuario');
  }
};

const getUsuarios = async (req, res) => {
  const data = await user.find({}).select('-password');
  return res.status(200).send({
    status: "success",
    usuarios: data
  });
};

const changeUserRole = async (req, res) => {
  const { _id } = req.params;
  const { rol } = req.body;
  const requestedRole = sanitizeRole(rol);

  if (!requestedRole || !ALL_ROLES.includes(requestedRole)) {
    return res.status(400).send({
      status: "error",
      message: "Rol inválido o no permitido",
    });
  }

  try {
    const targetUser = await user.findById(_id);
    if (!targetUser) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    targetUser.rol = requestedRole;
    await targetUser.save();

    return res.status(200).send({
      status: "success",
      data: {
        id: targetUser._id,
        correo: targetUser.correo,
        rol: targetUser.rol,
      },
    });
  } catch (error) {
    console.error("Error actualizando rol de usuario:", error);
    return res.status(500).send({
      status: "error",
      message: "Error interno al actualizar el rol del usuario.",
    });
  }
};
const saveSubscription = async (req, res) => {
  const { userId, subscription } = req.body;

  if (!userId || !subscription) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos de usuario o suscripción.",
    });
  }

  try {
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado.",
      });
    }

    // Evitar duplicados
    const isDuplicate = userData.pushSubscriptions.some(
      (sub) => sub.endpoint === subscription.endpoint
    );

    if (!isDuplicate) {
      userData.pushSubscriptions.push(subscription);
      await userData.save();
    }

    res.status(200).send({
      status: "success",
      message: "Suscripción guardada correctamente.",
    });
  } catch (error) {
    console.error("Error al guardar la suscripción:", error);
    res.status(500).send({
      status: "error",
      message: "Error interno al guardar la suscripción.",
    });
  }
};


/**
* Enviar notificación personalizada
*/
const sendNotification = async (req, res) => {
  const { userId, title, message, url } = req.body;

  // Validar datos recibidos
  if (!userId || !title || !message || !url) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos para enviar la notificación.",
    });
  }

  try {
    // Buscar al usuario por ID
    const userData = await user.findById(userId);

    if (!userData) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado.",
      });
    }

    if (!userData.pushSubscriptions || userData.pushSubscriptions.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "El usuario no tiene suscripciones activas.",
      });
    }

    // Crear el payload de la notificación
    const payload = JSON.stringify({
      title,
      body: message,
      url,
    });

    // Enviar la notificación a todas las suscripciones del usuario
    const results = [];
    for (const subscription of userData.pushSubscriptions) {
      try {
        await webPush.sendNotification(subscription, payload);
        results.push({ subscription: subscription.endpoint, status: "success" });
      } catch (error) {
        console.error("Error enviando notificación:", error);

        // Manejar error si la suscripción es inválida (410: Gone)
        if (error.statusCode === 410) {
          userData.pushSubscriptions = userData.pushSubscriptions.filter(
            (sub) => sub.endpoint !== subscription.endpoint
          );
          await userData.save();
        }

        results.push({
          subscription: subscription.endpoint,
          status: "error",
          error: error.message,
        });
      }
    }

    res.status(200).send({
      status: "success",
      message: "Notificación enviada.",
      results,
    });
  } catch (error) {
    console.error("Error al enviar la notificación:", error);
    res.status(500).send({
      status: "error",
      message: "Error interno al enviar la notificación.",
    });
  }
};


const sendNotificationsToAll = async (req, res) => {
  const { title, message, url } = req.body;

  if (!title || !message || !url) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos para enviar la notificación.",
    });
  }

  try {
    const allUsers = await user.find({ pushSubscriptions: { $exists: true, $ne: [] } });

    const payload = JSON.stringify({
      title,
      body: message,
      url,
    });

    const results = [];

    for (const userData of allUsers) {
      for (const subscription of userData.pushSubscriptions) {
        try {
          await webPush.sendNotification(subscription, payload);
          results.push({ userId: userData._id, subscription: subscription.endpoint, status: "success" });
        } catch (error) {
          console.error(`Error enviando a ${userData._id} (${subscription.endpoint}):`, error.message);

          // Eliminar suscripción inválida
          if (error.statusCode === 410) {
            userData.pushSubscriptions = userData.pushSubscriptions.filter(
              (sub) => sub.endpoint !== subscription.endpoint
            );
            await userData.save();
          }

          results.push({ userId: userData._id, subscription: subscription.endpoint, status: "error", error: error.message });
        }
      }
    }

    res.status(200).send({
      status: "success",
      message: "Notificaciones enviadas a todos los usuarios.",
      results,
    });
  } catch (error) {
    console.error("Error al enviar notificaciones a todos:", error);
    res.status(500).send({
      status: "error",
      message: "Error interno al enviar notificaciones.",
    });
  }
};



module.exports = {
  getItems,
  getUsuarios,
  changeUserRole,
  postItem,
  updateItem,
  profile,
  updateCorreo,
  uploader,
  updateAvatar,
  avatar,
  forgotPassword,
  resetPassword,
  saveSubscription, // Nueva función
  sendNotification,   // Nueva función
  sendNotificationsToAll
};
