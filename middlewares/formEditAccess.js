const check = require('./auth');

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const formEditAccess = (req, res, next) => {
  if (!MUTATION_METHODS.has(req.method)) {
    return next();
  }

  return check.auth(req, res, next);
};

module.exports = {
  MUTATION_METHODS,
  formEditAccess,
};
