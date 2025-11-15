const fs = require('fs');
const path = require('path');
const moment = require('moment');
const cron = require('node-cron');
const transporter = require('../config/mailer');

// --- cargar todos los modelos automáticamente ---
const modelsDir = path.join(__dirname, '../models/form');
const estudios = fs
  .readdirSync(modelsDir)
  .filter(f => f.endsWith('.js'))
  .map(f => ({
    nombre: f.replace('.js', '').replace(/([A-Z])/g, ' $1').trim(),
    modelo: require(path.join(modelsDir, f))
  }));

// --- función para enviar correo ---
const sendReminderEmail = (userEmail, estudioNombre, dueDate, razonSocialCliente, calle, numero) => {
  const mailOptions = {
    from: 'gestionsepa@inteli',
    to: userEmail,
    subject: 'Recordatorio de estudio o tareas por vencer',
    text: `Hola,\n\nEl estudio "${estudioNombre}" de ${razonSocialCliente} (dirección: ${calle} ${numero}) está por vencer el ${moment(dueDate).format('DD/MM/YYYY')}.\n\nRevisá tus tareas o estudios por vencer en https://gestionsepa.netlify.app/\n\nSaludos,\nInteli`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error('Error al enviar correo:', err);
    else console.log(`📧 Correo enviado a ${userEmail} (${estudioNombre})`);
  });
};

// --- función principal ---
const checkDueTasks = async () => {
  try {
    const now = moment();
    const limit = moment().add(3, 'days');

    console.log(`🔍 Verificando estudios por vencer entre ${now.format('DD/MM')} y ${limit.format('DD/MM')}...`);

    for (const est of estudios) {
      const Modelo = est.modelo;
      const nombre = est.nombre;

      if (typeof Modelo.find !== 'function') {
        console.warn(`⚠️ El modelo ${nombre} no tiene función .find() (¿exportación incorrecta?)`);
        continue;
      }

      const tasks = await Modelo.find({
        vencimiento: { $gte: now.toDate(), $lte: limit.toDate() },
      }).populate('cliente profesional establecimiento');

      for (const task of tasks) {
        const userEmail = task.profesional?.[0]?.correo;
        const razon = task.cliente?.[0]?.razonSocial || '';
        const calle = task.establecimiento?.[0]?.calle || '';
        const numero = task.establecimiento?.[0]?.numero || '';

        if (userEmail) {
          sendReminderEmail(userEmail, nombre, task.vencimiento, razon, calle, numero);
        }
      }
    }

    console.log('✅ Verificación completada.');
  } catch (error) {
    console.error('❌ Error al verificar estudios por vencer:', error);
  }
};

// --- programar ejecución automática a las 8:00 AM todos los días ---
cron.schedule('*/1 * * * *', () => {
  console.log('⏰ Ejecutando recordatorio diario (8:00 AM)...');
  checkDueTasks();
}, { timezone: 'America/Argentina/Buenos_Aires' });

// --- exportar para uso manual o test ---
module.exports = { checkDueTasks };
