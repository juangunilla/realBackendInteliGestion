const express = require('express');
const { auth } = require('../middlewares/auth');
const { getMetrics } = require('../controllers/dashboardController');

const router = express.Router();

const ALLOWED_ROLES = new Set(['superadmin', 'seguidor']);

const requireDashboardRole = (req, res, next) => {
  const userRole = req.user?.rol || req.user?.role;

  if (!ALLOWED_ROLES.has(userRole)) {
    return res.status(403).json({
      status: 'error',
      message: 'No tienes permisos para acceder a las métricas del dashboard',
    });
  }

  return next();
};

router.get('/metrics', auth, requireDashboardRole, getMetrics);

module.exports = router;
