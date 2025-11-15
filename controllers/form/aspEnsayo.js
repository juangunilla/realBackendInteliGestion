const { AspEnsayo, AspEnsayoHist } = require('../../models/form/aspEnsayo');
const { crearConHistorial } = require('../../helpers/historialHelper');

// Crear nuevo Ensayo periódico con historial
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
      AspEnsayo,
      AspEnsayoHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: "aspEnsayo",
        description: "Creación de ASP Ensayo",
        payload,
      }
    );

    return res.status(201).json({ status: 'success', data: nuevo });
  } catch (error) {
    console.error('Error al crear ASP Ensayo:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Actualizar activo
const updateItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const actualizado = await AspEnsayo.findByIdAndUpdate(_id, req.body, { new: true });
    if (!actualizado) {
      return res.status(404).json({ status: 'error', message: 'ASP Ensayo no encontrado' });
    }
    res.json({ status: 'success', data: actualizado });
  } catch (error) {
    console.error(`Error al actualizar ASP Ensayo ${_id}`, error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar ASP Ensayo' });
  }
};

// Obtener activos
const getItems = async (req, res) => {
  try {
    const data = await AspEnsayo.find({});
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener ASP Ensayo:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener ASP Ensayo' });
  }
};

// Eliminar activo
const deleteItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const eliminado = await AspEnsayo.deleteOne({ _id });
    if (eliminado.deletedCount === 0) {
      return res.status(404).json({ status: 'error', message: 'El ASP Ensayo no existe' });
    }
    res.json({ status: 'success', message: 'ASP Ensayo eliminado' });
  } catch (error) {
    console.error('Error al eliminar ASP Ensayo:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar ASP Ensayo' });
  }
};

// Historial completo
const getHistorial = async (req, res) => {
  try {
    const data = await AspEnsayoHist.find({});
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial ASP Ensayo:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ASP Ensayo' });
  }
};

// Historial filtrado por cliente/establecimiento
const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await AspEnsayoHist.find({ cliente: clienteId, establecimiento: establecimientoId });
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial ASP Ensayo filtrado:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ASP Ensayo filtrado' });
  }
};

module.exports = { getItems, postItem, updateItem, deleteItem, getHistorial, getHistorialByClienteEst };
