const jwt = require('jsonwebtoken');
const moment = require('moment');
const { secret } = require('../services/jwt');

exports.auth = (req, res, next) => {
  const requestId = req.requestId || Math.random().toString(36).substring(7); // Generar un ID si no existe
  console.log(`[AUTH START] Request ID: ${requestId} - URL: ${req.originalUrl}`);

  // Comprobar si me llega la cabecera de auth
  if (!req.headers.authorization) {
    console.log(`[AUTH ERROR] Request ID: ${requestId} - Falta la cabecera de autorización`);
    return res.status(403).send({
      status: "error",
      message: "La petición no tiene la cabecera de autenticación",
    });
  }

  // Limpiar el token
  let token = req.headers.authorization.replace(/['"]+/g, '');

  // Decodificar token
  try {
    let payload = jwt.verify(token, secret);
    console.log(`[AUTH SUCCESS] Request ID: ${requestId} - Token decodificado:`, payload);

    // Comprobar expiración del token
    if (payload.exp <= moment().unix()) {
      console.log(`[AUTH ERROR] Request ID: ${requestId} - Token expirado`);
      return res.status(401).send({
        status: "error",
        message: "Token expirado",
      });
    }

    // Agregar datos de usuario a request
    req.user = payload;

    // Incluir el rol en la cabecera
    res.setHeader('X-User-Rol', payload.rol);

    // Si el usuario no es "admin" y está intentando cambiar su propio rol, prohibirlo
    if (payload.rol !== 'admin' && req.params._id === req.user._id && req.body.rol) {
      console.log(`[AUTH ERROR] Request ID: ${requestId} - Usuario no autorizado para cambiar su propio rol`);
      return res.status(403).send({
        status: "error",
        message: "No está autorizado para cambiar su propio rol",
      });
    }

  } catch (error) {
    console.log(`[AUTH ERROR] Request ID: ${requestId} - Token inválido`, error);
    return res.status(404).send({
      status: "error",
      message: "Token inválido",
      error,
    });
  }

  console.log(`[AUTH END] Request ID: ${requestId} - Pasando al siguiente middleware`);
  // Pasar a ejecución de acción
  next();
};
