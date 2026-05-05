const { AspHidraulica, AspHidraulicaHist } = require('../../models/form/aspHidraulica');
const { crearConHistorial } = require('../../helpers/historialHelper');
const { normalizeFechaDerivadoPayload } = require('../../helpers/fechaDerivado');
const { getStudyDateOrderError } = require('../../helpers/studyDateOrder');

const normalizeRef = (value) => (Array.isArray(value) ? value[0] : value);

const normalizePayload = (payload = {}) => {
  const data = normalizeFechaDerivadoPayload({ ...payload });

  if (Object.prototype.hasOwnProperty.call(data, 'cliente')) {
    data.cliente = normalizeRef(data.cliente);
  }

  if (Object.prototype.hasOwnProperty.call(data, 'establecimiento')) {
    data.establecimiento = normalizeRef(data.establecimiento);
  }

  return data;
};

const sendValidationError = (res, message) => {
  return res.status(400).json({ status: 'error', message });
};

// Crear nuevo Prueba Hidráulica con historial
const postItem = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const { cliente, establecimiento, ...datos } = payload;
    const clienteId = cliente;
    const establecimientoId = establecimiento;
    const dateOrderError = getStudyDateOrderError(datos);

    if (dateOrderError) {
      return sendValidationError(res, dateOrderError);
    }

    const auditPayload = { cliente: clienteId, establecimiento: establecimientoId, ...datos };

    const nuevo = await crearConHistorial(
      AspHidraulica,
      AspHidraulicaHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: "aspHidraulica",
        description: "Creación de ASP Hidráulica",
        payload: auditPayload,
      }
    );

    return res.status(201).json({ status: 'success', data: nuevo });
  } catch (error) {
    console.error('Error al crear ASP Hidráulica:', error);
    if (error?.name === 'ValidationError') {
      return sendValidationError(res, error.message);
    }

    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Actualizar
const updateItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const update = normalizePayload(req.body);
    const actual = await AspHidraulica.findById(_id);

    if (!actual) {
      return res.status(404).json({ status: 'error', message: 'ASP Hidráulica no encontrado' });
    }

    const dateOrderError = getStudyDateOrderError({
      ...actual.toObject(),
      ...update,
    });

    if (dateOrderError) {
      return sendValidationError(res, dateOrderError);
    }

    const actualizado = await AspHidraulica.findByIdAndUpdate(
      _id,
      update,
      { new: true, runValidators: true }
    );

    res.json({ status: 'success', data: actualizado });
  } catch (error) {
    console.error(`Error al actualizar ASP Hidráulica ${_id}`, error);
    if (error?.name === 'ValidationError') {
      return sendValidationError(res, error.message);
    }

    res.status(500).json({ status: 'error', message: 'Error al actualizar ASP Hidráulica' });
  }
};

// Obtener activos
const getItems = async (req, res) => {
  try {
    const data = await AspHidraulica.find({});
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener ASP Hidráulica:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener ASP Hidráulica' });
  }
};

// Eliminar
const deleteItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const eliminado = await AspHidraulica.deleteOne({ _id });
    if (eliminado.deletedCount === 0) {
      return res.status(404).json({ status: 'error', message: 'El ASP Hidráulica no existe' });
    }
    res.json({ status: 'success', message: 'ASP Hidráulica eliminado' });
  } catch (error) {
    console.error('Error al eliminar ASP Hidráulica:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar ASP Hidráulica' });
  }
};

// Historial completo
const getHistorial = async (req, res) => {
  try {
    const data = await AspHidraulicaHist.find({});
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial ASP Hidráulica:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ASP Hidráulica' });
  }
};

// Historial filtrado
const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await AspHidraulicaHist.find({ cliente: clienteId, establecimiento: establecimientoId });
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial ASP Hidráulica filtrado:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ASP Hidráulica filtrado' });
  }
};

module.exports = { getItems, postItem, updateItem, deleteItem, getHistorial, getHistorialByClienteEst };
