const mongoose = require('mongoose');
const ChatMessage = require('../models/chatMessage');
const Users = require('../models/user');
const { studyConfigs, getStudyConfig } = require('../helpers/studyRegistry');
const webPush = require('../config/webpush');

let socketUtils;
const getSocketUtils = () => {
  if (!socketUtils) {
    socketUtils = require('../socketServer');
  }
  return socketUtils;
};

const getIO = () => {
  try {
    return getSocketUtils().getIO?.() || null;
  } catch (error) {
    console.error('Socket server no disponible', error);
    return null;
  }
};

const emitToUser = (userId, event, payload) => {
  try {
    getSocketUtils().emitToUser?.(userId, event, payload);
  } catch (error) {
    console.error('No se pudo emitir al usuario', error);
  }
};

const sanitizeMessage = (text = '') => text.trim();

const extractClienteNombre = (cliente) => {
  if (!cliente) return null;
  if (Array.isArray(cliente)) {
    const first = cliente[0];
    if (!first) return null;
    return first.razonSocial || first.nombre || first.rozonSocial || null;
  }
  return cliente.razonSocial || cliente.nombre || cliente.rozonSocial || null;
};

const extractEstablecimientoNombre = (establecimiento) => {
  if (!establecimiento) return null;
  if (Array.isArray(establecimiento)) {
    const first = establecimiento[0];
    if (!first) return null;
    return first.sucursal || first.calle || null;
  }
  return establecimiento.sucursal || establecimiento.calle || null;
};

const buildStudyReference = async (studyKey, studyObjectId) => {
  if (!studyKey || !studyObjectId) return null;
  const config = getStudyConfig(studyKey);
  if (!config) {
    throw new Error('Estudio no soportado');
  }
  if (!mongoose.isValidObjectId(studyObjectId)) {
    throw new Error('Identificador de estudio inválido');
  }

  const estudio = await config.model
    .findById(studyObjectId)
    .populate('cliente establecimiento')
    .lean();

  if (!estudio) {
    throw new Error('Estudio no encontrado');
  }

  const clienteNombre = extractClienteNombre(estudio.cliente) || 'Sin razón social';
  const establecimientoNombre =
    extractEstablecimientoNombre(estudio.establecimiento) || 'Establecimiento sin nombre';

  return {
    key: config.key,
    label: config.label,
    estudioId: studyObjectId,
    resumen: {
      cliente: clienteNombre,
      establecimiento: establecimientoNombre,
      estado: estudio.estado || estudio.cumplimiento || '',
      vencimiento: estudio.vencimiento || estudio.fecha || estudio.fechaMed || null,
    },
  };
};

const resolveUserId = (req) => req.user?.id || req.user?._id || req.user?.ID;

const sendPushForDirectMessage = async ({ recipientDoc, recipientId, senderName, message, studyRef }) => {
  if (!recipientDoc?.pushSubscriptions || recipientDoc.pushSubscriptions.length === 0) {
    return;
  }

  const snippet = message.length > 140 ? `${message.slice(0, 137)}...` : message;
  const body = studyRef?.label ? `${snippet}\nRef: ${studyRef.label}` : snippet;
  const payload = JSON.stringify({
    title: `Nuevo mensaje de ${senderName}`,
    body,
    url: `/inteli/chat?with=${recipientId}`,
  });

  const validSubs = [];
  for (const subscription of recipientDoc.pushSubscriptions) {
    try {
      await webPush.sendNotification(subscription, payload);
      validSubs.push(subscription);
    } catch (error) {
      console.error('Error enviando push de chat', error.message);
      if (error.statusCode !== 410) {
        validSubs.push(subscription);
      }
    }
  }

  if (validSubs.length !== recipientDoc.pushSubscriptions.length) {
    await Users.findByIdAndUpdate(recipientId, { pushSubscriptions: validSubs }).catch(() => {});
  }
};

const buildConversationFilter = (currentUserId, targetUserId) => {
  if (!targetUserId) {
    return { recipient: null };
  }
  return {
    $or: [
      { sender: currentUserId, recipient: targetUserId },
      { sender: targetUserId, recipient: currentUserId },
    ],
  };
};

const getMessages = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const currentUserId = resolveUserId(req);
  if (!currentUserId) {
    return res.status(401).send({ status: 'error', message: 'No autorizado' });
  }

  const { with: withUser } = req.query;
  let filter = {};

  if (withUser) {
    if (!mongoose.isValidObjectId(withUser)) {
      return res.status(400).send({ status: 'error', message: 'Usuario objetivo inválido' });
    }
    filter = buildConversationFilter(currentUserId, withUser);
  } else {
    filter = { recipient: null };
  }

  const messages = await ChatMessage.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'nombreyapellido image')
    .populate('recipient', 'nombreyapellido image');

  res.send({
    status: 'success',
    data: messages.reverse(),
  });
};

const postMessage = async (req, res) => {
  try {
    const currentUserId = resolveUserId(req);
    if (!currentUserId) {
      return res.status(401).send({ status: 'error', message: 'No autorizado' });
    }

    const { message, studyKey, studyId, recipientId } = req.body;
    const text = sanitizeMessage(message);
    if (!text) {
      return res.status(400).send({
        status: 'error',
        message: 'El mensaje no puede estar vacío',
      });
    }

    let recipient = null;
    if (recipientId) {
      if (!mongoose.isValidObjectId(recipientId)) {
        return res.status(400).send({ status: 'error', message: 'Usuario objetivo inválido' });
      }
      recipient = await Users.findById(recipientId, 'nombreyapellido image pushSubscriptions');
      if (!recipient) {
        return res.status(404).send({ status: 'error', message: 'El usuario destino no existe' });
      }
    }

    let studyRef = null;
    if (studyKey && studyId) {
      try {
        studyRef = await buildStudyReference(studyKey, studyId);
      } catch (error) {
        return res.status(400).send({ status: 'error', message: error.message });
      }
    }

    const chatMessage = new ChatMessage({
      sender: currentUserId,
      recipient: recipient ? recipientId : null,
      message: text,
      studyRef,
    });

    const populated = await chatMessage.save();
    await populated.populate('sender', 'nombreyapellido image');
    await populated.populate('recipient', 'nombreyapellido image');

    const io = getIO();
    if (recipient) {
      emitToUser(recipientId, 'chat:newMessage', populated);
      emitToUser(currentUserId, 'chat:newMessage', populated);
      const senderName = req.user?.nombreyapellido || req.user?.nombre || 'Usuario';
      sendPushForDirectMessage({
        recipientDoc: recipient,
        recipientId,
        senderName,
        message: text,
        studyRef,
      }).catch((error) => console.error('Push directo falló', error));
    } else if (io) {
      io.emit('chat:newMessage', populated);
    }

    res.status(201).send({ status: 'success', data: populated });
  } catch (error) {
    console.error('Error al guardar el mensaje de chat', error);
    res.status(500).send({ status: 'error', message: 'Error al enviar el mensaje' });
  }
};

const getStudyTypes = (req, res) => {
  const data = studyConfigs.map(({ key, label }) => ({ key, label }));
  res.send({ status: 'success', data });
};

const searchStudies = async (req, res) => {
  try {
    const { type, q = '' } = req.query;
    const config = getStudyConfig(type);
    if (!config) {
      return res.status(400).send({ status: 'error', message: 'Tipo de estudio desconocido' });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 50);
    const docs = await config.model
      .find({})
      .sort({ updatedAt: -1 })
      .limit(200)
      .populate('cliente establecimiento')
      .lean();

    const query = q.trim().toLowerCase();
    const filtered = query
      ? docs.filter((doc) => {
          const cliente =
            doc.cliente?.[0]?.razonSocial ||
            doc.cliente?.[0]?.nombre ||
            doc.cliente?.razonSocial ||
            '';
          const establecimiento =
            doc.establecimiento?.[0]?.sucursal ||
            doc.establecimiento?.[0]?.calle ||
            doc.establecimiento?.sucursal ||
            '';
          return (
            cliente.toLowerCase().includes(query) ||
            establecimiento.toLowerCase().includes(query) ||
            (doc.estado || '').toLowerCase().includes(query)
          );
        })
      : docs;

    const data = filtered.slice(0, limit).map((doc) => ({
      id: doc._id,
      key: config.key,
      label: config.label,
      cliente: extractClienteNombre(doc.cliente) || 'Sin razón social',
      establecimiento: extractEstablecimientoNombre(doc.establecimiento) || 'Establecimiento sin nombre',
      estado: doc.estado || doc.cumplimiento || '',
      vencimiento: doc.vencimiento || doc.fecha || doc.fechaMed || null,
    }));

    res.send({ status: 'success', data });
  } catch (error) {
    console.error('Error al buscar estudios para el chat', error);
    res.status(500).send({ status: 'error', message: 'No se pudieron obtener estudios' });
  }
};

const listUsers = async (req, res) => {
  const usuarios = await Users.find({}, 'nombreyapellido image online lastSeen').lean();
  res.send({ status: 'success', data: usuarios });
};

module.exports = { getMessages, postMessage, getStudyTypes, searchStudies, listUsers };
