const { AspHidraulica, AspHidraulicaHist } = require('../../models/form/aspHidraulica');
const { crearConHistorial } = require('../../helpers/historialHelper');

// Crear nuevo Prueba Hidráulica con historial
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
      AspHidraulica,
      AspHidraulicaHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: "aspHidraulica",
        description: "Creación de ASP Hidráulica",
        payload,
      }
    );

    return res.status(201).json({ status: 'success', data: nuevo });
  } catch (error) {
    console.error('Error al crear ASP Hidráulica:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Actualizar
const updateItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const actualizado = await AspHidraulica.findByIdAndUpdate(_id, req.body, { new: true });
    if (!actualizado) {
      return res.status(404).json({ status: 'error', message: 'ASP Hidráulica no encontrado' });
    }
    res.json({ status: 'success', data: actualizado });
  } catch (error) {
    console.error(`Error al actualizar ASP Hidráulica ${_id}`, error);
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
