const jwt = require('jsonwebtoken');

const getClientPortalSecret = () => {
  const secret = process.env.CLIENT_PORTAL_JWT_SECRET;
  if (!secret) {
    throw new Error('Falta definir CLIENT_PORTAL_JWT_SECRET');
  }
  return secret;
};

const createClientPortalToken = (account) => {
  const payload = {
    portalAccountId: `${account._id || account.id}`,
    type: 'client-portal',
  };

  return jwt.sign(payload, getClientPortalSecret(), {
    expiresIn: '30d',
  });
};

const verifyClientPortalToken = (token) =>
  jwt.verify(token, getClientPortalSecret());

module.exports = {
  createClientPortalToken,
  verifyClientPortalToken,
};
