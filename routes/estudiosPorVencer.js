const express = require('express');
const moment = require('moment');
const mongoose = require('mongoose');
const { studyConfigs } = require('../helpers/studyRegistry');
const check = require('../middlewares/auth');
const isAdmin = require('../middlewares/isadmin');
const { sendDueTodayNotifications } = require('../helpers/studyDueNotifications');

const router = express.Router();

// GET /api/estudios-por-vencer?days=3&profesionalId=...
router.get('/', check.auth, async (req, res) => {
  try {
    const daysParam = parseInt(req.query.days, 10);
    const days = Number.isFinite(daysParam) && daysParam > 0 && daysParam <= 90 ? daysParam : 3;
    const { profesionalId } = req.query;

    if (profesionalId && !mongoose.isValidObjectId(profesionalId)) {
      return res.status(400).send({ status: 'error', message: 'profesionalId inválido' });
    }

    const now = moment();
    const limit = moment().add(days, 'days');
    const data = [];

    for (const config of studyConfigs) {
      const model = config.model;
      if (typeof model?.find !== 'function') continue;

      const filter = {
        vencimiento: { $gte: now.toDate(), $lte: limit.toDate() },
        ...(profesionalId ? { profesional: profesionalId } : {}),
      };

      const docs = await model
        .find(filter)
        .populate('cliente profesional establecimiento')
        .lean();

      for (const doc of docs) {
        const profesionales = Array.isArray(doc.profesional) ? doc.profesional : doc.profesional ? [doc.profesional] : [];
        const clientes = Array.isArray(doc.cliente) ? doc.cliente : doc.cliente ? [doc.cliente] : [];
        const establecimientos = Array.isArray(doc.establecimiento) ? doc.establecimiento : doc.establecimiento ? [doc.establecimiento] : [];

        data.push({
          key: config.key,
          tipo: config.label,
          estudioId: doc._id,
          vencimiento: doc.vencimiento || doc.fecha || doc.fechaMed || null,
          estado: doc.estado || doc.cumplimiento || null,
          profesionales: profesionales.map((p) => ({
            id: p?._id,
            nombre: p?.nombreyapellido || p?.nombre || null,
            correo: p?.correo || null,
          })),
          clientes: clientes.map((c) => ({
            id: c?._id,
            razonSocial: c?.razonSocial || c?.rozonSocial || c?.nombre || null,
          })),
          establecimientos: establecimientos.map((e) => ({
            id: e?._id,
            direccion: [e?.calle, e?.numero].filter(Boolean).join(' ') || e?.sucursal || null,
          })),
          documento: doc,
        });
      }
    }

    data.sort((a, b) => {
      const va = a.vencimiento ? new Date(a.vencimiento).getTime() : Number.MAX_SAFE_INTEGER;
      const vb = b.vencimiento ? new Date(b.vencimiento).getTime() : Number.MAX_SAFE_INTEGER;
      return va - vb;
    });

    return res.send({
      status: 'success',
      window: { from: now.toISOString(), to: limit.toISOString(), days },
      data,
    });
  } catch (error) {
    console.error('Error al obtener estudios por vencer', error);
    return res.status(500).send({ status: 'error', message: 'No se pudieron obtener los estudios por vencer' });
  }
});

// POST /api/estudios-por-vencer/disparar-hoy
router.post('/disparar-hoy', check.auth, isAdmin, async (req, res) => {
  try {
    const zone = process.env.APP_TIMEZONE || 'America/Argentina/Buenos_Aires';
    const result = await sendDueTodayNotifications({ zone });

    return res.send({
      status: 'success',
      message: 'Recordatorio de vencimientos de hoy ejecutado.',
      window: {
        from: result.window.start.toISO(),
        to: result.window.end.toISO(),
        zone,
      },
      studies: result.studies,
      notifiedUsers: result.notifiedUsers,
    });
  } catch (error) {
    console.error('Error al disparar el recordatorio de vencimientos del día', error);
    return res.status(500).send({
      status: 'error',
      message: 'No se pudo ejecutar el recordatorio de vencimientos del día',
    });
  }
});

module.exports = router;
