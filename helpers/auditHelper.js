const AuditLog = require('../models/auditLog');

async function registrarAccion({
  user,
  action,
  entity,
  entityId,
  description,
  changes,
  payload,
}) {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId,
      description,
      changes,
      payload,
      user: user?.id || user?._id || null,
      userName:
        user?.nombreyapellido ||
        user?.nombre ||
        user?.userName ||
        user?.email ||
        "Usuario desconocido",
    });
  } catch (error) {
    console.error("No se pudo registrar la auditoría:", error);
  }
}

module.exports = { registrarAccion };
