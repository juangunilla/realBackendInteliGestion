const mongoose = require('mongoose');
const { Analisis, AnalisisHist } = require('../../models/form/analisist');
const { crearConHistorial } = require('../../helpers/historialHelper');

const DATE_FIELDS = ['confeccion', 'vencimiento'];
const REFERENCE_FIELDS = ['revalidacionDe', 'estudioOrigen'];

const normalizeId = (value) => {
  if (Array.isArray(value)) {
    return normalizeId(value[0]);
  }

  if (value && typeof value === 'object') {
    if (mongoose.isValidObjectId(value)) {
      return `${value}`;
    }

    const candidate = value._id || value.id;
    if (candidate) {
      return normalizeId(candidate);
    }

    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  return value ?? null;
};

const normalizeDateValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const normalizePayload = (payload = {}) => {
  const data = { ...payload };

  DATE_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = normalizeDateValue(data[field]);
    }
  });

  REFERENCE_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = normalizeId(data[field]);
    }
  });

  if (Object.prototype.hasOwnProperty.call(data, 'cliente')) {
    data.cliente = normalizeId(data.cliente);
  }

  if (Object.prototype.hasOwnProperty.call(data, 'establecimiento')) {
    data.establecimiento = normalizeId(data.establecimiento);
  }

  return data;
};

const sendValidationError = (res, message) =>
  res.status(400).json({
    status: 'error',
    message,
  });

const toReferenceArray = (value) => {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((item) => item?._id || item);
};

const validateClienteEstablecimiento = (body = {}) => {
  const invalidFields = [];

  if (
    Object.prototype.hasOwnProperty.call(body, 'cliente') &&
    !mongoose.isValidObjectId(normalizeId(body.cliente))
  ) {
    invalidFields.push('cliente');
  }

  if (
    Object.prototype.hasOwnProperty.call(body, 'establecimiento') &&
    !mongoose.isValidObjectId(normalizeId(body.establecimiento))
  ) {
    invalidFields.push('establecimiento');
  }

  return invalidFields;
};

// Crear nuevo estudio con historial
const postItem = async (req, res) => {
  try {
    const invalidFields = validateClienteEstablecimiento(req.body);
    if (invalidFields.length) {
      return sendValidationError(
        res,
        `El campo ${invalidFields.join(' y ')} debe ser un ObjectId válido`
      );
    }

    const payload = normalizePayload(req.body);

    const nuevo = await crearConHistorial(
      Analisis,
      AnalisisHist,
      payload.cliente,
      payload.establecimiento,
      payload,
      {
        user: req.user,
        entity: 'analisist',
        description: 'Creación de estudio de Análisis',
        payload,
      }
    );

    return res.status(200).send({ status: 'success', data: nuevo });
  } catch (error) {
    console.error('Error al crear estudio de análisis:', error);

    if (error?.name === 'ValidationError' || error?.name === 'CastError') {
      return sendValidationError(res, error.message);
    }

    return res.status(500).send('Error al crear el estudio');
  }
};

// Actualizar estudio activo
const updateItem = async (req, res) => {
  const { _id } = req.params;

  try {
    const invalidFields = validateClienteEstablecimiento(req.body);
    if (invalidFields.length) {
      return sendValidationError(
        res,
        `El campo ${invalidFields.join(' y ')} debe ser un ObjectId válido`
      );
    }

    const update = normalizePayload(req.body);
    const actualizado = await Analisis.findByIdAndUpdate(
      _id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!actualizado) {
      return res.status(404).json({
        status: 'error',
        message: 'Estudio de análisis no encontrado',
      });
    }

    return res.status(200).send({ status: 'success', data: actualizado });
  } catch (error) {
    console.error(`Error al actualizar ${_id}`, error);

    if (error?.name === 'ValidationError' || error?.name === 'CastError') {
      return sendValidationError(res, error.message);
    }

    return res.status(500).send('Error al actualizar el estudio');
  }
};

// Obtener todos los estudios activos
const getItems = async (req, res) => {
  try {
    const data = await Analisis.find({});
    res.status(200).send({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener estudios:', error);
    res.status(500).send('Error al obtener estudios');
  }
};

const crearRevalidacionAnalisis = async (req, res) => {
  const { id } = req.params;

  try {
    const estudioBase = await Analisis.findById(id);

    if (!estudioBase) {
      return res.status(404).json({
        ok: false,
        message: 'Estudio base no encontrado',
      });
    }

    const estudioOrigen = estudioBase.estudioOrigen || estudioBase._id;
    const cantidadExistente = await Analisis.countDocuments({
      $or: [{ _id: estudioOrigen }, { estudioOrigen }],
    });

    const nuevoEstudio = await Analisis.create({
      cliente: toReferenceArray(estudioBase.cliente),
      establecimiento: toReferenceArray(estudioBase.establecimiento),
      confeccion: estudioBase.confeccion,
      vencimiento: estudioBase.vencimiento,
      observacion: estudioBase.observacion,
      entregaDocumentacion: estudioBase.entregaDocumentacion,
      revalidacionDe: estudioBase._id,
      estudioOrigen,
      esRevalidacion: true,
      numeroRevalidacion: cantidadExistente,
    });

    return res.status(200).json({
      ok: true,
      estudio: nuevoEstudio,
    });
  } catch (error) {
    console.error('Error al crear revalidación de análisis', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al crear revalidación de análisis',
    });
  }
};

// Obtener historial completo
const getHistorial = async (req, res) => {
  try {
    const data = await AnalisisHist.find({});
    res.status(200).send({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).send('Error al obtener historial');
  }
};

// Obtener historial filtrado por cliente y establecimiento
const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await AnalisisHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });
    res.status(200).send({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial filtrado:', error);
    res.status(500).send('Error al obtener historial filtrado');
  }
};

module.exports = {
  getItems,
  postItem,
  updateItem,
  crearRevalidacionAnalisis,
  getHistorial,
  getHistorialByClienteEst,
};
