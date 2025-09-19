const jwt = require('jsonwebtoken');

const secret = "clave-secret-inteli-0393";

const createTokens = (user) => {
  const payload = {
    id: user.id,
    nombreyapellido: user.nombreyapellido,
    rol: user.rol,
    image: user.image,
    iat: Math.floor(Date.now() / 1000), // Fecha actual en segundos
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // Expiración en 30 días
  };
  const token = jwt.sign(payload, secret);
  return token;
};

module.exports = {
  secret,
  createTokens
};
