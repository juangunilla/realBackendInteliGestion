const {
  CapacitacionAutoelevadorRes96015,
  CapacitacionAutoelevadorRes96015Hist,
} = require('../../models/form/capacitacionAutoelevadorRes96015');
const { crearConHistorial } = require('../../helpers/historialHelper');
const { registrarAccion } = require('../../helpers/auditHelper');
const { normalizeFechaDerivadoPayload } = require('../../helpers/fechaDerivado');

const ENTITY = 'capacitacion_autoelevador_res_960_15';

const postItem = async (req, res) => {
  try {
    const { cliente, establecimiento, ...rawDatos } = req.body;
    const datos = normalizeFechaDerivadoPayload(rawDatos);

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
      CapacitacionAutoelevadorRes96015,
      CapacitacionAutoelevadorRes96015Hist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: ENTITY,
        description: 'Creación de capacitación autoelevador Res. 960/15',
        payload,
      }
    );

    return res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('[CapAutoelevador96015] Error al crear registro', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo crear la capacitación',
    });
  }
};

const updateItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const update = normalizeFechaDerivadoPayload(req.body);
    const data = await CapacitacionAutoelevadorRes96015.findByIdAndUpdate(
      _id,
      { $set: update },
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
      description: 'Actualización de capacitación autoelevador Res. 960/15',
      changes: update,
    });

    return res.json({ status: 'success', data });
  } catch (error) {
    console.error(`[CapAutoelevador96015] Error al actualizar ${_id}`, error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo actualizar la capacitación',
    });
  }
};

const getItems = async (req, res) => {
  try {
    const data = await CapacitacionAutoelevadorRes96015.find({});
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('[CapAutoelevador96015] Error al listar', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudieron obtener las capacitaciones',
    });
  }
};

const getHistorial = async (req, res) => {
  try {
    const data = await CapacitacionAutoelevadorRes96015Hist.find({});
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('[CapAutoelevador96015] Error al obtener historial', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo obtener el historial de capacitaciones',
    });
  }
};

const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await CapacitacionAutoelevadorRes96015Hist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error(
      '[CapAutoelevador96015] Error al obtener historial filtrado',
      error
    );
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
