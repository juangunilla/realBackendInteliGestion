const { Artrgrgl, ArtrgrglHist } = require('../../models/form/artrgrgl');
const { crearConHistorial } = require('../../helpers/historialHelper');

// Crear nuevo ARTRGRGL con historial
const postItem = async (req, res) => {
  try {
    const { cliente, establecimiento, ...datos } = req.body;

    const clienteId = Array.isArray(cliente) ? cliente[0] : cliente;
    const establecimientoId = Array.isArray(establecimiento) ? establecimiento[0] : establecimiento;

    const nuevo = await crearConHistorial(
      Artrgrgl,
      ArtrgrglHist,
      clienteId,
      establecimientoId,
      datos
    );

    return res.status(201).json({ status: 'success', data: nuevo });
  } catch (error) {
    console.error('Error al crear ARTRGRGL:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Actualizar ARTRGRGL activo
const updateItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const actualizado = await Artrgrgl.findByIdAndUpdate(_id, req.body, { new: true });
    if (!actualizado) {
      return res.status(404).json({ status: 'error', message: 'ARTRGRGL no encontrada' });
    }
    res.json({ status: 'success', data: actualizado });
  } catch (error) {
    console.error(`Error al actualizar ARTRGRGL ${_id}`, error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar ARTRGRGL' });
  }
};

// Obtener todos los ARTRGRGL activos
const getItems = async (req, res) => {
  try {
    const data = await Artrgrgl.find({});
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener ARTRGRGL:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener ARTRGRGL' });
  }
};

// Eliminar ARTRGRGL activo
const deleteItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const eliminado = await Artrgrgl.deleteOne({ _id });
    if (eliminado.deletedCount === 0) {
      return res.status(404).json({ status: 'error', message: 'La ARTRGRGL no existe' });
    }
    res.json({ status: 'success', message: 'ARTRGRGL eliminada' });
  } catch (error) {
    console.error('Error al eliminar ARTRGRGL:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar ARTRGRGL' });
  }
};

// Obtener historial completo
const getHistorial = async (req, res) => {
  try {
    const data = await ArtrgrglHist.find({});
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial ARTRGRGL:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ARTRGRGL' });
  }
};

// Obtener historial filtrado por cliente y establecimiento
const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await ArtrgrglHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial ARTRGRGL filtrado:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ARTRGRGL filtrado' });
  }
};

module.exports = { getItems, postItem, updateItem, deleteItem, getHistorial, getHistorialByClienteEst };
