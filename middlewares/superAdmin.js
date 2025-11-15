const { SUPER_ADMIN_EMAIL, SUPERADMIN_ROLE } = require('../config/roles');

const normalizeEmail = (value) => {
  if (!value) return '';
  return value.toLowerCase().trim();
};

const requireSuperAdminRole = (req, res, next) => {
  if (req.user?.rol !== SUPERADMIN_ROLE) {
    return res.status(403).json({
      status: 'error',
      message: 'Necesitas ser superadministrador para acceder a este recurso.',
    });
  }
  next();
};

const requireSuperAdminOwner = (req, res, next) => {
  if (req.user?.rol !== SUPERADMIN_ROLE) {
    return res.status(403).json({
      status: 'error',
      message: 'Solo el superadministrador puede modificar roles.',
    });
  }

  const userEmail = normalizeEmail(req.user?.correo);
  if (userEmail !== SUPER_ADMIN_EMAIL) {
    return res.status(403).json({
      status: 'error',
      message: 'Solo la cuenta principal del superadministrador puede administrar roles.',
    });
  }

  next();
};

module.exports = {
  requireSuperAdminRole,
  requireSuperAdminOwner,
};
