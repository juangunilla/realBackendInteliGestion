const { registrarAccion } = require('./auditHelper');

async function crearConHistorial(ModeloActivo, ModeloHistorial, clienteId, establecimientoId, datos, options = {}) {
  // Buscar estudios previos activos del mismo cliente y establecimiento
  const anteriores = await ModeloActivo.find({ 
    cliente: clienteId,
    establecimiento: establecimientoId
  });

  if (anteriores.length > 0) {
    const docs = anteriores.map(est => ({
      ...est.toObject(),
      archivadoEn: new Date()
    }));

    await ModeloHistorial.insertMany(docs);
    await ModeloActivo.deleteMany({ 
      cliente: clienteId,
      establecimiento: establecimientoId
    });
  }

  // Crear nuevo
  const nuevo = new ModeloActivo({ 
    cliente: clienteId, 
    establecimiento: establecimientoId,
    ...datos 
  });
  const guardado = await nuevo.save();

  if (options.entity || options.description || options.user) {
    await registrarAccion({
      user: options.user,
      action: options.action || "create",
      entity: options.entity || ModeloActivo.modelName.toLowerCase(),
      entityId: guardado._id,
      description: options.description || `Creación de ${ModeloActivo.modelName}`,
      payload: options.payload,
      changes: options.changes,
    });
  }

  return guardado;
}

module.exports = { crearConHistorial };
