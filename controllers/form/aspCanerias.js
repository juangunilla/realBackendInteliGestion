const { AspCanerias, AspCaneriasHist } = require('../../models/form/aspCanerias');
const { crearConHistorial } = require('../../helpers/historialHelper');

// Crear nuevo Informe Cañerías con historial
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
      AspCanerias,
      AspCaneriasHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: "aspCanerias",
        description: "Creación de ASP Cañerías",
        payload,
      }
    );

    return res.status(201).json({ status: 'success', data: nuevo });
  } catch (error) {
    console.error('Error al crear ASP Cañerías:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Actualizar
const updateItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const actualizado = await AspCanerias.findByIdAndUpdate(_id, req.body, { new: true });
    if (!actualizado) {
      return res.status(404).json({ status: 'error', message: 'ASP Cañerías no encontrado' });
    }
    res.json({ status: 'success', data: actualizado });
  } catch (error) {
    console.error(`Error al actualizar ASP Cañerías ${_id}`, error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar ASP Cañerías' });
  }
};

// Obtener activos
const getItems = async (req, res) => {
  try {
    const data = await AspCanerias.find({});
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener ASP Cañerías:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener ASP Cañerías' });
  }
};

// Eliminar
const deleteItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const eliminado = await AspCanerias.deleteOne({ _id });
    if (eliminado.deletedCount === 0) {
      return res.status(404).json({ status: 'error', message: 'El ASP Cañerías no existe' });
    }
    res.json({ status: 'success', message: 'ASP Cañerías eliminado' });
  } catch (error) {
    console.error('Error al eliminar ASP Cañerías:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar ASP Cañerías' });
  }
};

// Historial completo
const getHistorial = async (req, res) => {
  try {
    const data = await AspCaneriasHist.find({});
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial ASP Cañerías:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ASP Cañerías' });
  }
};

// Historial filtrado
const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await AspCaneriasHist.find({ cliente: clienteId, establecimiento: establecimientoId });
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial ASP Cañerías filtrado:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ASP Cañerías filtrado' });
  }
};

module.exports = { getItems, postItem, updateItem, deleteItem, getHistorial, getHistorialByClienteEst };
