async function crearConHistorial(ModeloActivo, ModeloHistorial, clienteId, establecimientoId, datos) {
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
  return await nuevo.save();
}

module.exports = { crearConHistorial };
