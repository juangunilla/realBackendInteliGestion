const mongoose = require('mongoose');
const {
  SrtRes90515,
  SrtRes90515Hist,
} = require('../../models/form/srtRes90515');
const { crearConHistorial } = require('../../helpers/historialHelper');
const {
  normalizeEntregaDocumentacionPayload,
  normalizeEntregaDocumentacionDocs,
} = require('../../helpers/entregaDocumentacion');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const postItem = async (req, res) => {
  try {
    const normalizedBody = normalizeEntregaDocumentacionPayload(req.body);
    const { cliente, establecimiento, ...datos } = normalizedBody;

    const clienteId = Array.isArray(cliente) ? cliente[0] : cliente;
    const establecimientoId = Array.isArray(establecimiento)
      ? establecimiento[0]
      : establecimiento;

    if (!clienteId) {
      return res.status(400).send({
        status: 'error',
        message: 'El campo cliente es obligatorio',
      });
    }

    if (!establecimientoId) {
      return res.status(400).send({
        status: 'error',
        message: 'El campo establecimiento es obligatorio',
      });
    }

    if (!isValidObjectId(clienteId)) {
      return res.status(400).send({
        status: 'error',
        message: 'El cliente no tiene un ObjectId válido',
      });
    }

    if (!isValidObjectId(establecimientoId)) {
      return res.status(400).send({
        status: 'error',
        message: 'El establecimiento no tiene un ObjectId válido',
      });
    }

    const payload = {
      cliente: clienteId,
      establecimiento: establecimientoId,
      ...datos,
    };

    const nuevo = await crearConHistorial(
      SrtRes90515,
      SrtRes90515Hist,
      clienteId,
      establecimientoId,
      payload,
      {
        user: req.user,
        entity: 'srt-res-905-15',
        description: 'Creación de estudio SRT Res. 905/15',
        payload,
      }
    );

    return res.status(201).send({
      status: 'success',
      data: nuevo,
    });
  } catch (error) {
    console.error('Error al crear estudio SRT Res. 905/15:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al crear el estudio',
      error: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const { _id } = req.params;
    const update = normalizeEntregaDocumentacionPayload(req.body);

    if (!_id) {
      return res.status(400).send({
        status: 'error',
        message: 'El id es obligatorio',
      });
    }

    if (!isValidObjectId(_id)) {
      return res.status(400).send({
        status: 'error',
        message: 'El id no es válido',
      });
    }

    if (update.cliente) {
      const clienteId = Array.isArray(update.cliente)
        ? update.cliente[0]
        : update.cliente;

      if (!isValidObjectId(clienteId)) {
        return res.status(400).send({
          status: 'error',
          message: 'El cliente no tiene un ObjectId válido',
        });
      }

      update.cliente = clienteId;
    }

    if (update.establecimiento) {
      const establecimientoId = Array.isArray(update.establecimiento)
        ? update.establecimiento[0]
        : update.establecimiento;

      if (!isValidObjectId(establecimientoId)) {
        return res.status(400).send({
          status: 'error',
          message: 'El establecimiento no tiene un ObjectId válido',
        });
      }

      update.establecimiento = establecimientoId;
    }

    const actualizado = await SrtRes90515.findByIdAndUpdate(
      _id,
      { $set: update },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!actualizado) {
      return res.status(404).send({
        status: 'error',
        message: `No se encontró el estudio con id ${_id}`,
      });
    }

    return res.status(200).send({
      status: 'success',
      message: `Actualizaste datos del estudio ${_id}`,
      data: actualizado,
    });
  } catch (error) {
    console.error(`Error al actualizar ${req.params._id}`, error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al actualizar el estudio',
      error: error.message,
    });
  }
};

const getItems = async (req, res) => {
  try {
    const data = await SrtRes90515.find({});
    return res.status(200).send({
      status: 'success',
      data: normalizeEntregaDocumentacionDocs(data),
    });
  } catch (error) {
    console.error('Error al obtener estudios SRT Res. 905/15:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al obtener estudios',
      error: error.message,
    });
  }
};

const getHistorial = async (req, res) => {
  try {
    const data = await SrtRes90515Hist.find({});
    return res.status(200).send({
      status: 'success',
      data: normalizeEntregaDocumentacionDocs(data),
    });
  } catch (error) {
    console.error('Error al obtener historial SRT Res. 905/15:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al obtener historial',
      error: error.message,
    });
  }
};

const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;

    if (!clienteId || !establecimientoId) {
      return res.status(400).send({
        status: 'error',
        message: 'clienteId y establecimientoId son obligatorios',
      });
    }

    if (!isValidObjectId(clienteId)) {
      return res.status(400).send({
        status: 'error',
        message: 'clienteId no es válido',
      });
    }

    if (!isValidObjectId(establecimientoId)) {
      return res.status(400).send({
        status: 'error',
        message: 'establecimientoId no es válido',
      });
    }

    const data = await SrtRes90515Hist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });

    return res.status(200).send({
      status: 'success',
      data: normalizeEntregaDocumentacionDocs(data),
    });
  } catch (error) {
    console.error('Error al obtener historial filtrado SRT Res. 905/15:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al obtener historial filtrado',
      error: error.message,
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
