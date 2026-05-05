const mongoose = require('mongoose');
const {
  AnalisisDeRiesgo,
  AnalisisDeRiesgoHist,
} = require('../../models/form/analisisDeRiesgo');
const { crearConHistorial } = require('../../helpers/historialHelper');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Crear nuevo estudio con historial
const postItem = async (req, res) => {
  try {
    const { cliente, establecimiento, ...datos } = req.body;

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
      AnalisisDeRiesgo,
      AnalisisDeRiesgoHist,
      clienteId,
      establecimientoId,
      payload,
      {
        user: req.user,
        entity: 'analisist',
        description: 'Creación de estudio de Análisis',
        payload,
      }
    );

    return res.status(201).send({
      status: 'success',
      data: nuevo,
    });
  } catch (error) {
    console.error('Error al crear estudio de análisis:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al crear el estudio',
      error: error.message,
    });
  }
};

// Actualizar estudio activo
const updateItem = async (req, res) => {
  try {
    const { _id } = req.params;
    const update = req.body;

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

    const actualizado = await AnalisisDeRiesgo.findByIdAndUpdate(
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

// Obtener todos los estudios activos
const getItems = async (req, res) => {
  try {
    const data = await AnalisisDeRiesgo.find({});
    return res.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Error al obtener estudios:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al obtener estudios',
      error: error.message,
    });
  }
};

// Obtener historial completo
const getHistorial = async (req, res) => {
  try {
    const data = await AnalisisDeRiesgoHist.find({});
    return res.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al obtener historial',
      error: error.message,
    });
  }
};

// Obtener historial filtrado por cliente y establecimiento
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

    const data = await AnalisisDeRiesgoHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });

    return res.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Error al obtener historial filtrado:', error);
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