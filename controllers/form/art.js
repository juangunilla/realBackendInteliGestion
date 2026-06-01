const { Art, ArtHist } = require('../../models/form/art');
const { crearConHistorial } = require('../../helpers/historialHelper');
const {
  normalizeEntregaDocumentacionPayload,
  normalizeEntregaDocumentacionDocs,
} = require('../../helpers/entregaDocumentacion');

// Crear nuevo ART con historial
const postItem = async (req, res) => {
  try {
    const normalizedBody = normalizeEntregaDocumentacionPayload(req.body);
    const { cliente, establecimiento, ...datos } = normalizedBody;

    const clienteId = Array.isArray(cliente) ? cliente[0] : cliente;
    const establecimientoId = Array.isArray(establecimiento) ? establecimiento[0] : establecimiento;

    const payload = {
      cliente: clienteId,
      establecimiento: establecimientoId,
      ...datos,
    };

    const nuevo = await crearConHistorial(
      Art,
      ArtHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: "art",
        description: "Creación de ART",
        payload,
      }
    );

    return res.status(201).json({ status: 'success', data: nuevo });
  } catch (error) {
    console.error('Error al crear ART:', error);
    res.status(500).json({ status: 'error', message: 'Error al crear ART' });
  }
};

// Actualizar ART activo
const updateItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const update = normalizeEntregaDocumentacionPayload(req.body);
    const actualizado = await Art.findByIdAndUpdate(
      _id,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!actualizado) {
      return res.status(404).json({ status: 'error', message: 'ART no encontrada' });
    }
    res.json({ status: 'success', data: actualizado });
  } catch (error) {
    console.error(`Error al actualizar ART ${_id}`, error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar ART' });
  }
};

// Obtener todos los ART activos
const getItems = async (req, res) => {
  try {
    const data = await Art.find({});
    res.json({ status: 'success', data: normalizeEntregaDocumentacionDocs(data) });
  } catch (error) {
    console.error('Error al obtener ART:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener ART' });
  }
};

// Eliminar ART activo
const deleteItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const eliminado = await Art.deleteOne({ _id });
    if (eliminado.deletedCount === 0) {
      return res.status(404).json({ status: 'error', message: 'La ART no existe' });
    }
    res.json({ status: 'success', message: 'ART eliminada' });
  } catch (error) {
    console.error('Error al eliminar ART:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar ART' });
  }
};

// Obtener historial completo
const getHistorial = async (req, res) => {
  try {
    const data = await ArtHist.find({});
    res.json({ status: 'success', data: normalizeEntregaDocumentacionDocs(data) });
  } catch (error) {
    console.error('Error al obtener historial ART:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ART' });
  }
};

// Obtener historial filtrado por cliente y establecimiento
const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await ArtHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });
    res.json({ status: 'success', data: normalizeEntregaDocumentacionDocs(data) });
  } catch (error) {
    console.error('Error al obtener historial ART filtrado:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener historial ART filtrado' });
  }
};

module.exports = { getItems, postItem, updateItem, deleteItem, getHistorial, getHistorialByClienteEst };
