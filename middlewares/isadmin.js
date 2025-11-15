// Middleware para verificar el rol de administrador
const { SUPERADMIN_ROLE } = require('../config/roles');

function isAdmin(req, res, next) {
    if (![ 'admin', SUPERADMIN_ROLE ].includes(req.user?.rol)) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
    }
    next();
}

module.exports = isAdmin;
  
