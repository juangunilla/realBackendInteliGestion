const {
  CertificadoRedIncendio,
  CertificadoRedIncendioHist,
} = require('../../models/form/certificadoRedIncendio');
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
      CertificadoRedIncendio,
      CertificadoRedIncendioHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: 'certificadoRedIncendio',
        description: 'Creación de Certificado Red Incendio',
        payload,
      }
    );

    return res.status(201).json({ status: 'success', data: nuevo });
  } catch (error) {
    console.error('Error al crear Certificado Red Incendio:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateItem = async (req, res) => {
  const { _id } = req.params;

  try {
    const update = normalizeFechaDerivadoPayload(req.body);
    const actualizado = await CertificadoRedIncendio.findByIdAndUpdate(_id, update, {
      new: true,
    });

    if (!actualizado) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificado Red Incendio no encontrado',
      });
    }

    return res.json({ status: 'success', data: actualizado });
  } catch (error) {
    console.error(`Error al actualizar Certificado Red Incendio ${_id}:`, error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar Certificado Red Incendio',
    });
  }
};

const getItems = async (req, res) => {
  try {
    const data = await CertificadoRedIncendio.find({});
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener Certificados Red Incendio:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener Certificados Red Incendio',
    });
  }
};

const deleteItem = async (req, res) => {
  const { _id } = req.params;

  try {
    const eliminado = await CertificadoRedIncendio.deleteOne({ _id });

    if (eliminado.deletedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificado Red Incendio no existe',
      });
    }

    return res.json({
      status: 'success',
      message: 'Certificado Red Incendio eliminado',
    });
  } catch (error) {
    console.error('Error al eliminar Certificado Red Incendio:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al eliminar Certificado Red Incendio',
    });
  }
};

const getHistorial = async (req, res) => {
  try {
    const data = await CertificadoRedIncendioHist.find({});
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error al obtener historial de Certificado Red Incendio:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener historial de Certificado Red Incendio',
    });
  }
};

const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await CertificadoRedIncendioHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });

    return res.json({ status: 'success', data });
  } catch (error) {
    console.error(
      'Error al obtener historial de Certificado Red Incendio filtrado:',
      error
    );
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener historial de Certificado Red Incendio filtrado',
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
