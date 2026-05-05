const mongoose = require('mongoose');
const establecimientos = require('../models/establecimientos');
const profesionales = require('../models/profesionales');
require('../models/ciuu'); // Asegura que el modelo esté registrado para autopopulate
const Users = require('../models/user');
const webPush = require('../config/webpush');
const clientes = require('../models/clientes');
const { obtenerEstudiosActivosPorEstablecimiento } = require('../helpers/estudiosActivosHelper');
const { registrarAccion } = require('../helpers/auditHelper');

const registrarCambioProfesional = (establecimiento, profesionalId, { desde, hasta, comentario } = {}) => {
    if (!establecimiento.historialProfesionales) {
        establecimiento.historialProfesionales = [];
    }

    const fechaDesde = desde ? new Date(desde) : new Date();
    const fechaHasta = hasta ? new Date(hasta) : undefined;

    const historial = establecimiento.historialProfesionales;
    const ultimoRegistro = historial.length > 0 ? historial[historial.length - 1] : null;

    if (ultimoRegistro && `${ultimoRegistro.profesional}` === profesionalId && !ultimoRegistro.hasta) {
        if (comentario) {
            ultimoRegistro.comentario = comentario;
        }
        if (fechaHasta) {
            ultimoRegistro.hasta = fechaHasta;
        }
        establecimiento.profesionalAsignado = [profesionalId];
        return;
    }

    if (ultimoRegistro && !ultimoRegistro.hasta) {
        ultimoRegistro.hasta = fechaDesde;
    }

    historial.push({
        profesional: profesionalId,
        desde: fechaDesde,
        hasta: fechaHasta,
        comentario
    });

    establecimiento.profesionalAsignado = [profesionalId];
};

const postItem = async (req, res) => {
    try {
        const { body, query } = req;
        const { calle, numero } = body;
        const clienteInput =
            body.clienteId ||
            body.cliente_id ||
            query.clienteId ||
            query.cliente_id ||
            body.cliente;

        const clienteId =
            (clienteInput && typeof clienteInput === 'object' && clienteInput._id) ||
            clienteInput;

        let cliente = null;
        if (clienteId) {
            cliente = await clientes.findById(clienteId);
            if (!cliente) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El cliente indicado no existe',
                });
            }
        }

        let data = null;
        if (calle && numero) {
            const existingEstable = await establecimientos.findOne({ calle, numero });
            if (existingEstable) {
                data = existingEstable;
            }
        }

        if (!data) {
            data = await establecimientos.create(body);
        }
        let clienteActualizado = null;

        if (cliente) {
            const resumen = {
                _id: data._id,
                nombre: data.nombre,
                direccion: data.direccion,
                localidad: data.localidad,
                frecuencia: data.frecuencia,
                responsable: data.responsable,
            };

            const yaAsignado = (cliente.establecimientos || []).some(
                (e) => `${e._id}` === `${data._id}`
            );

            if (!yaAsignado) {
                cliente.establecimientos = cliente.establecimientos || [];
                cliente.establecimientos.push(resumen);
                clienteActualizado = await cliente.save();
                await clienteActualizado.populate('establecimientos._id');
            } else {
                clienteActualizado = await clientes
                    .findById(cliente._id)
                    .populate('establecimientos._id');
            }
        }

        await registrarAccion({
            user: req.user,
            action: "create",
            entity: "establecimiento",
            entityId: data._id,
            description: "Se creó un nuevo establecimiento",
            payload: body,
        });

        return res.send({
            status: 'success',
            data,
            cliente: clienteActualizado,
            warning: cliente ? undefined : 'No se indicó cliente; el establecimiento quedó sin asignar',
        });
    } catch (error) {
        console.error('Error al crear establecimiento:', error);
        return res.status(500).send({
            status: 'error',
            message: 'No se pudo crear el establecimiento',
            error: error.message,
        });
    }
};



const updateItem = async (req, res) => {
    const { _id } = req.params;
    const {
        profesionalId,
        profesionalAsignado,
        desde,
        hasta,
        comentario,
        comentarioCambioProfesional,
        ...updatedFields
    } = req.body;

    try {
        const establecimiento = await establecimientos.findById(_id);
        if (!establecimiento) {
            return res.status(404).send({
                status: 'error',
                message: 'Establecimiento no encontrado'
            });
        }

        Object.entries(updatedFields).forEach(([key, value]) => {
            establecimiento[key] = value;
        });

        const targetProfesionalId =
            profesionalId ||
            (Array.isArray(profesionalAsignado)
                ? profesionalAsignado[0]
                : profesionalAsignado);

        if (targetProfesionalId) {
            const profesional = await profesionales.findById(targetProfesionalId);
            if (!profesional) {
                return res.status(404).send({
                    status: 'error',
                    message: 'Profesional no encontrado'
                });
            }

        registrarCambioProfesional(establecimiento, targetProfesionalId, {
            desde,
            hasta,
            comentario: comentarioCambioProfesional ?? comentario
        });
    }

        await establecimiento.save();
        await notifyAssignment(targetProfesionalId, establecimiento);

        await registrarAccion({
            user: req.user,
            action: 'update',
            entity: 'establecimiento',
            entityId: establecimiento._id,
            description: 'Se actualizaron campos del establecimiento',
            changes: updatedFields,
            payload: req.body,
        });

        res.send({
            status: 'success',
            data: establecimiento
        });
    } catch (error) {
        console.error('Error al actualizar el establecimiento:', error);
        res.status(500).send('Error al actualizar el establecimiento.');
    }
};
  

const profesionalItem = async (req, res) => {
    const { _id } = req.params;
    const { profesionalId, desde, hasta, comentario, comentarioCambioProfesional } = req.body;

    if (!profesionalId) {
        return res.status(400).send({
            status: 'error',
            message: 'Debes indicar el profesional'
        });
    }

    const profesional = await profesionales.findById(profesionalId);
    if (!profesional) {
        return res.status(404).send({
            status: 'error',
            message: 'Profesional no encontrado'
        });
    }

    const establecimiento = await establecimientos.findById(_id);
    if (!establecimiento) {
        return res.status(404).send({
            status: 'error',
            message: 'Establecimiento no encontrado'
        });
    }

    registrarCambioProfesional(establecimiento, profesionalId, {
        desde,
        hasta,
        comentario: comentarioCambioProfesional ?? comentario
    });

    await establecimiento.save();

    await registrarAccion({
        user: req.user,
        action: 'assign',
        entity: 'establecimiento',
        entityId: establecimiento._id,
        description: 'Cambio de profesional asignado',
        changes: { profesionalId, desde, hasta },
        payload: req.body,
    });

    return res.status(200).send({
        status: 'success',
        data: establecimiento
    });
};

const notifyAssignment = async (profesionalId, establecimiento) => {
    if (!profesionalId || !establecimiento) return;
    try {
        const targetUser = await Users.findOne({
            profesional: profesionalId,
        }).select('pushSubscriptions nombreyapellido correo');

        if (!targetUser) return;

        await sendPushToUser(targetUser, {
            title: 'Nueva asignación',
            message: `Fuiste asignado a ${establecimiento.calle || 'un establecimiento'} ${
                establecimiento.numero || ''
            }`,
            url: `/inteli/establedetalle/${establecimiento._id}`,
        });
    } catch (error) {
        console.error('No se pudo enviar notificación de asignación:', error);
    }
};

const sendPushToUser = async (userDoc, payload) => {
    if (!userDoc || !Array.isArray(userDoc.pushSubscriptions) || !userDoc.pushSubscriptions.length) {
        return;
    }

    const body = JSON.stringify(payload);
    const subscriptions = [...userDoc.pushSubscriptions];
    const valid = [];

    for (const subscription of subscriptions) {
        try {
            await webPush.sendNotification(subscription, body);
            valid.push(subscription);
        } catch (error) {
            console.error('Error enviando notificación push:', error.message);
            if (error.statusCode !== 410) {
                valid.push(subscription);
            }
        }
    }

    if (valid.length !== subscriptions.length) {
        userDoc.pushSubscriptions = valid;
        await userDoc.save().catch(() => {});
    }
};


const getItems = async (req, res) => {
    const getEstablecimientos = await establecimientos.find()
    res.send( getEstablecimientos );
};

const deleteItem = async (req, res) => {
    const { _id } = req.params;

    try {
      const establecimiento = await establecimientos.findById(_id);
      if (!establecimiento) {
        return res.status(404).send({
          status: 'error',
          message: 'El establecimiento no existe',
        });
      }

      const result = await establecimientos.deleteOne({ _id });

      if (result.deletedCount === 0) {
        return res.status(404).send({
          status: 'error',
          message: 'El establecimiento no existe',
        });
      }

      await registrarAccion({
        user: req.user,
        action: 'delete',
        entity: 'establecimiento',
        entityId: _id,
        description: 'Se eliminó el establecimiento',
        payload: establecimiento.toObject(),
      });

      res.send({
        status: 'success',
        message: 'Establecimiento eliminado correctamente',
      });
    } catch (error) {
      console.error('Error al eliminar el establecimiento:', error);
      res.status(500).send({
        status: 'error',
        message: 'Error al eliminar el establecimiento',
      });
    }
  };
  
 

const profile = async (req, res) => {
    const rawId =
        (req.params && req.params._id) ||
        req.query._id ||
        req.query.id ||
        (req.body && req.body._id);

    const _id = (rawId || '').toString().trim();

    try {
        if (!mongoose.isValidObjectId(_id)) {
            return res.status(400).send({
                status: "error",
                message: "El ID de establecimiento no es válido",
                id: _id || null,
            });
        }

        const data = await establecimientos
            .findById(_id)
            .populate('historialProfesionales.profesional');
        if (!data) {
            return res.status(404).send({
                status: "error",
                message: "El establecimiento no existe"
            });
        }
        return res.status(200).send({
            status: "success",
            data
        });
    } catch (error) {
        console.log('Error al obtener establecimiento:', error);
        return res.status(500).send({
            status: "error",
            message: "Error al obtener establecimiento"
        });
    }
}

const getEstudiosActivos = async (req, res) => {
    const { _id } = req.params;

    if (!mongoose.isValidObjectId(_id)) {
        return res.status(400).send({
            status: "error",
            message: "El ID de establecimiento no es válido"
        });
    }

    try {
        const estudios = await obtenerEstudiosActivosPorEstablecimiento(_id);
        console.log(`Estudios activos (${_id}): ${estudios.length}`);
        res.status(200).send({
            status: "success",
            data: estudios,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: "error",
            message: "Error al obtener estudios activos del establecimiento"
        });
    }
}


module.exports = { getItems, postItem, updateItem, profesionalItem, profile, deleteItem, getEstudiosActivos };
