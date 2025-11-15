const { Asp, AspHist } = require('../../models/form/asp');
const { crearConHistorial } = require('../../helpers/historialHelper');

// Crear nuevo ASP con historial
const postItem = async (req, res) => {
  try {
    const { cliente, establecimiento, ...datos } = req.body;

    const clienteId = Array.isArray(cliente) ? cliente[0] : cliente;
    const establecimientoId = Array.isArray(establecimiento) ? establecimiento[0] : establecimiento;

    const payload = {
      cliente: clienteId,
      establecimiento: establecimientoId,
      ...datos,
    };

    const nuevo = await crearConHistorial(
      Asp,
      AspHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: "asp",
        description: "Creación de ASP",
        payload,
      }
    );

    return res.status(201).json({ status: 'success', data: nuevo });
  } catch (error) {
    console.error('Error al crear ASP:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Actualizar ASP activo
const updateItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const actualizado = await Asp.findByIdAndUpdate(_id, req.body, { new: true });
    if (!actualizado) {
      return res.status(404).json({ status: 'error', message: 'ASP no encontrado' });
    }
    res.json({ status: 'success', data: actualizado });
  } catch (error) {
    console.error(`Error al actualizar ASP ${_id}`, error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar ASP' });
  }
};

// Obtener todos los ASP activos
const getItems = async (req, res) => {
  try {
    const data = await Asp.find({});
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener ASP:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener ASP' });
  }
};

// Eliminar ASP activo
const deleteItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const eliminado = await Asp.deleteOne({ _id });
    if (eliminado.deletedCount === 0) {
      return res.status(404).json({ status: 'error', message: 'El ASP no existe' });
    }
    res.json({ status: 'success', message: 'ASP eliminado' });
  } catch (error) {
    console.error('Error al eliminar ASP:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar ASP' });
  }
};

// Obtener historial completo
const getHistorial = async (req, res) => {
  try {
    const data = await AspHist.find({});
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial ASP:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ASP' });
  }
};

// Obtener historial filtrado por cliente y establecimiento
const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await AspHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial ASP filtrado:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ASP filtrado' });
  }
};

module.exports = { getItems, postItem, updateItem, deleteItem, getHistorial, getHistorialByClienteEst };
