const express = require('express');
const router = express.Router();

const Event = require('../models/Event');
const { auth } = require('../middlewares/auth');
const { SUPERADMIN_ROLE } = require('../config/roles');

// POST /api/metrics/track -> guarda eventos de uso
router.post('/track', auth, async (req, res) => {
  const { feature, action, extra } = req.body || {};

  if (!feature || !action) {
    return res.status(400).json({
      status: 'error',
      message: 'Los campos feature y action son obligatorios',
    });
  }

  try {
    await Event.create({
      userId: req.user.id,
      companyId:
        req.user?.companyId ||
        req.user?.company_id ||
        req.user?.company ||
        req.user?.companiaId,
      role: req.user?.role || req.user?.rol,
      feature,
      action,
      extra: extra || {},
    });

    return res.status(201).json({
      status: 'success',
      message: 'Evento registrado',
    });
  } catch (error) {
    console.error('[METRICS] Error al registrar evento', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo registrar el evento',
    });
  }
});

// GET /api/metrics/overview -> métricas solo para superadmin
router.get('/overview', auth, async (req, res) => {
  const userRole = req.user?.role || req.user?.rol;
  if (userRole !== 'super_admin' && userRole !== SUPERADMIN_ROLE) {
    return res.status(403).json({
      status: 'error',
      message: 'No tienes permisos para acceder a estas métricas',
    });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const [topFeatures, eventsByDay, recentEvents] = await Promise.all([
      Event.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { feature: '$feature', action: '$action' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: {
              $concat: [
                { $ifNull: ['$_id.feature', ''] },
                ' / ',
                { $ifNull: ['$_id.action', ''] },
              ],
            },
            feature: '$_id.feature',
            action: '$_id.action',
            count: 1,
          },
        },
        { $sort: { count: -1, feature: 1, action: 1 } },
      ]),
      Event.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: '$_id', date: '$_id', count: 1 } },
        { $sort: { date: 1 } },
      ]),
      Event.find({ createdAt: { $gte: thirtyDaysAgo } })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    return res.json({
      status: 'success',
      data: { topFeatures, eventsByDay, recentEvents },
    });
  } catch (error) {
    console.error('[METRICS] Error al obtener overview', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo obtener las métricas',
    });
  }
});

module.exports = router;
