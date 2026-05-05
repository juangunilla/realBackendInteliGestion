const mongoose = require('mongoose');
const {
  resolveStudyDueDate,
  resolveStudyEditPath,
  resolveStudyStatus,
  studyConfigs,
} = require('./studyRegistry');
const Clientes = require('../models/clientes');

async function obtenerEstudiosActivosPorEstablecimiento(establecimientoId) {
  if (!establecimientoId) {
    return [];
  }

  const establecimientoObjectId = mongoose.Types.ObjectId.isValid(establecimientoId)
    ? new mongoose.Types.ObjectId(establecimientoId)
    : null;

  let clienteAsociado = null;
  try {
    clienteAsociado = await Clientes.findOne({
      establecimientos: establecimientoObjectId || establecimientoId,
    })
      .select('_id')
      .lean()
      .exec();
  } catch (error) {
    console.warn(`No se pudo obtener el cliente para el establecimiento ${establecimientoId}:`, error.message);
  }

  const consultas = studyConfigs.map(async (config) => {
    if (typeof config.model?.find !== 'function') {
      console.warn(`⚠️ El modelo "${config.label}" no está exportando una función .find().`);
      return { ...config, documentos: [] };
    }

    const filtrosOr = [];

    if (establecimientoObjectId) {
      filtrosOr.push(
        { establecimiento: establecimientoObjectId },
        { 'establecimiento._id': establecimientoObjectId }
      );
    } else {
      filtrosOr.push(
        { establecimiento: establecimientoId },
        { 'establecimiento._id': establecimientoId }
      );
    }

    if (clienteAsociado?._id) {
      filtrosOr.push(
        { cliente: clienteAsociado._id },
        { 'cliente._id': clienteAsociado._id }
      );
    }

    const query = filtrosOr.length ? { $or: filtrosOr } : {};

    const documentos = await config.model.find(query);
    return { ...config, documentos };
  });

  const resultados = await Promise.all(consultas);

  return resultados.reduce((acumulado, studyConfig) => {
    const { label, key, documentos, apiPath } = studyConfig;

    const formateados = documentos.map((doc) => {
      const datos = typeof doc.toObject === 'function' ? doc.toObject() : doc;
      const studyId = datos._id ? `${datos._id}` : null;

      return {
        tipo: label,
        key,
        studyId,
        apiPath: apiPath || null,
        editPath: resolveStudyEditPath(studyConfig, studyId),
        coleccion: doc.collection?.name || datos.collection || null,
        estado: resolveStudyStatus(studyConfig, datos),
        vencimiento: resolveStudyDueDate(studyConfig, datos),
        detalles: datos,
      };
    });
    return acumulado.concat(formateados);
  }, []);
}

module.exports = { obtenerEstudiosActivosPorEstablecimiento };
