const {
  Termografia,
  TermografiaHist,
} = require('../../models/form/termografia');
const { crearConHistorial } = require('../../helpers/historialHelper');
const { registrarAccion } = require('../../helpers/auditHelper');

const ENTITY = 'termografia';

const normalizeRef = (value) => (Array.isArray(value) ? value[0] : value);

const normalizePayload = (payload = {}) => {
  const data = { ...payload };

  if (Object.prototype.hasOwnProperty.call(data, 'cliente')) {
    data.cliente = normalizeRef(data.cliente);
  }

  if (Object.prototype.hasOwnProperty.call(data, 'establecimiento')) {
    data.establecimiento = normalizeRef(data.establecimiento);
  }

  return data;
};

const postItem = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const { cliente, establecimiento, ...datos } = payload;

    const data = await crearConHistorial(
      Termografia,
      TermografiaHist,
      cliente,
      establecimiento,
      datos,
      {
        user: req.user,
        entity: ENTITY,
        description: 'Creación de estudio de Termografía',
        payload,
      }
    );

    return res.status(201).send({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Error al crear estudio de termografía:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al crear el estudio',
      error: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  const { _id } = req.params;

  try {
    const update = normalizePayload(req.body);
    const data = await Termografia.findByIdAndUpdate(
      _id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).send({
        status: 'error',
        message: 'El estudio no existe',
      });
    }

    await registrarAccion({
      user: req.user,
      action: 'update',
      entity: ENTITY,
      entityId: _id,
      description: 'Actualización de estudio de Termografía',
      changes: update,
    });

    return res.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error(`Error al actualizar el estudio de termografía ${_id}:`, error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al actualizar el estudio',
      error: error.message,
    });
  }
};

const getItems = async (req, res) => {
  try {
    const data = await Termografia.find({});
    return res.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Error al obtener estudios de termografía:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al obtener estudios',
      error: error.message,
    });
  }
};

const getHistorial = async (req, res) => {
  try {
    const data = await TermografiaHist.find({});
    return res.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Error al obtener historial de termografía:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al obtener historial',
      error: error.message,
    });
  }
};

const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await TermografiaHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });

    return res.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Error al obtener historial filtrado de termografía:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al obtener historial filtrado',
      error: error.message,
    });
  }
};

module.exports = {
  getItems,
  postItem,
  updateItem,
  getHistorial,
  getHistorialByClienteEst,
};
