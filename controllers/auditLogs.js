const mongoose = require('mongoose');
const AuditLog = require('../models/auditLog');

const listAuditLogs = async (req, res) => {
  try {
    const { entity, action } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const filter = {};

    if (entity) {
      filter.entity = entity;
    }

    if (action) {
      filter.action = action;
    }

    if (req.query.entityId && mongoose.isValidObjectId(req.query.entityId)) {
      filter.entityId = req.query.entityId;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).send({
      status: 'success',
      data: {
        logs,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).send({
      status: 'error',
      message: 'Error al obtener los registros de auditoría',
    });
  }
};

const getAuditByEntity = async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    if (!entity || !entityId) {
      return res.status(400).send({
        status: 'error',
        message: 'Debe proporcionar entidad y ID',
      });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 1, 5);

    const logs = await AuditLog.find({
      entity,
      entityId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).send({
      status: 'success',
      data: {
        logs,
      },
    });
  } catch (error) {
    console.error('Error obteniendo auditoría por entidad:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al obtener registros',
    });
  }
};

module.exports = { listAuditLogs, getAuditByEntity };
