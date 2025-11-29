const {
  CapacitacionIncendio,
  CapacitacionIncendioHist,
} = require('../../models/form/CapacitacionIncendio');
const { crearConHistorial } = require('../../helpers/historialHelper');
const { registrarAccion } = require('../../helpers/auditHelper');

const ENTITY = 'capacitacion_incendio';

const postItem = async (req, res) => {
  try {
    const { cliente, establecimiento, ...datos } = req.body;

    const clienteId = Array.isArray(cliente) ? cliente[0] : cliente;
    const establecimientoId = Array.isArray(establecimiento)
      ? establecimiento[0]
      : establecimiento;

    const payload = {
      cliente: clienteId,
      establecimiento: establecimientoId,
      ...datos,
    };

    const data = await crearConHistorial(
      CapacitacionIncendio,
      CapacitacionIncendioHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: ENTITY,
        description: 'Creación de capacitación de incendio',
        payload,
      }
    );

    return res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('[CapIncendio] Error al crear registro', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo crear la capacitación',
    });
  }
};

const updateItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const data = await CapacitacionIncendio.findByIdAndUpdate(
      _id,
      { $set: req.body },
      { new: true }
    );

    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: 'La capacitación no existe',
      });
    }

    await registrarAccion({
      user: req.user,
      action: 'update',
      entity: ENTITY,
      entityId: _id,
      description: 'Actualización de capacitación de incendio',
      changes: req.body,
    });

    return res.json({ status: 'success', data });
  } catch (error) {
    console.error(`[CapIncendio] Error al actualizar ${_id}`, error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo actualizar la capacitación',
    });
  }
};

const getItems = async (req, res) => {
  try {
    const data = await CapacitacionIncendio.find({});
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('[CapIncendio] Error al listar', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudieron obtener las capacitaciones',
    });
  }
};

const getHistorial = async (req, res) => {
  try {
    const data = await CapacitacionIncendioHist.find({});
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('[CapIncendio] Error al obtener historial', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo obtener el historial de capacitaciones',
    });
  }
};

const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await CapacitacionIncendioHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('[CapIncendio] Error al obtener historial filtrado', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo obtener el historial filtrado',
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
