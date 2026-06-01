const ClientPortalAccount = require('../models/clientPortalAccount');
const { verifyClientPortalToken } = require('../services/clientPortalJwt');

const extractBearerToken = (headerValue = '') => {
  const raw = headerValue.trim().replace(/['"]+/g, '');
  if (raw.toLowerCase().startsWith('bearer ')) {
    return raw.slice(7).trim();
  }
  return raw;
};

const clientPortalAuth = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({
        status: 'error',
        message: 'Falta la cabecera de autenticación del portal.',
      });
    }

    const token = extractBearerToken(req.headers.authorization);
    const payload = verifyClientPortalToken(token);

    if (payload?.type !== 'client-portal' || !payload?.portalAccountId) {
      return res.status(401).send({
        status: 'error',
        message: 'Token de portal inválido.',
      });
    }

    const account = await ClientPortalAccount.findById(payload.portalAccountId).lean();

    if (!account || account.active !== true) {
      return res.status(403).send({
        status: 'error',
        message: 'La cuenta del portal no está disponible.',
      });
    }

    req.clientPortalAccount = account;
    return next();
  } catch (error) {
    return res.status(401).send({
      status: 'error',
      message: 'No se pudo validar la sesión del portal.',
      error: error.message,
    });
  }
};

module.exports = { clientPortalAuth };
