// Middleware para verificar el rol de administrador
function isAdmin(req, res, next) {
    // Supongamos que el rol del usuario se almacena en req.user.rol
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
    }
    next();
  }
  