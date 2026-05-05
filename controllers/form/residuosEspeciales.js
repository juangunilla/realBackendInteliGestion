const {
  ResiduosEspeciales,
  ResiduosEspecialesHist,
} = require('../../models/form/residuosEspeciales');
const { crearConHistorial } = require('../../helpers/historialHelper');
const { normalizeFechaDerivadoPayload } = require('../../helpers/fechaDerivado');

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

    const nuevo = await crearConHistorial(
      ResiduosEspeciales,
      ResiduosEspecialesHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: 'residuosEspeciales',
        description: 'Creación de Residuos Especiales',
        payload,
      }
    );

    return res.status(201).json({ status: 'success', data: nuevo });
  } catch (error) {
    console.error('Error al crear Residuos Especiales:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateItem = async (req, res) => {
  const { _id } = req.params;

  try {
    const update = normalizeFechaDerivadoPayload(req.body);
    const actualizado = await ResiduosEspeciales.findByIdAndUpdate(_id, update, {
      new: true,
    });

    if (!actualizado) {
      return res.status(404).json({
        status: 'error',
        message: 'Residuos Especiales no encontrado',
      });
    }

    return res.json({ status: 'success', data: actualizado });
  } catch (error) {
    console.error(`Error al actualizar Residuos Especiales ${_id}:`, error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar Residuos Especiales',
    });
  }
};

const getItems = async (req, res) => {
  try {
    const data = await ResiduosEspeciales.find({});
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener Residuos Especiales:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener Residuos Especiales',
    });
  }
};

const deleteItem = async (req, res) => {
  const { _id } = req.params;

  try {
    const eliminado = await ResiduosEspeciales.deleteOne({ _id });

    if (eliminado.deletedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Residuos Especiales no existe',
      });
    }

    return res.json({ status: 'success', message: 'Residuos Especiales eliminado' });
  } catch (error) {
    console.error('Error al eliminar Residuos Especiales:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al eliminar Residuos Especiales',
    });
  }
};

const getHistorial = async (req, res) => {
  try {
    const data = await ResiduosEspecialesHist.find({});
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial de Residuos Especiales:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener historial de Residuos Especiales',
    });
  }
};

const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await ResiduosEspecialesHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });

    return res.json({ status: 'success', data });
  } catch (error) {
    console.error(
      'Error al obtener historial de Residuos Especiales filtrado:',
      error
    );
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener historial de Residuos Especiales filtrado',
    });
  }
};

module.exports = {
  getItems,
  postItem,
  updateItem,
  deleteItem,
  getHistorial,
  getHistorialByClienteEst,
};
