const webPush = require('../config/webpush');
const socketServer = require('../socketServer');

const DEFAULT_NOTIFICATION_URL = '/inteli';

const unwrapFirst = (value) => {
  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value || null;
};

const extractClienteNombre = (cliente) => {
  const resolved = unwrapFirst(cliente);

  return (
    resolved?.razonSocial ||
    resolved?.nombre ||
    resolved?.rozonSocial ||
    null
  );
};

const extractEstablecimientoNombre = (establecimiento) => {
  const resolved = unwrapFirst(establecimiento);
  const direccion = [resolved?.calle, resolved?.numero].filter(Boolean).join(' ').trim();

  return (
    resolved?.sucursal ||
    direccion ||
    resolved?.direccion ||
    resolved?.nombre ||
    null
  );
};

const resolveNotificationUrl = (studyDoc) => {
  const establecimiento = unwrapFirst(studyDoc?.establecimiento);
  const establecimientoId = establecimiento?._id || establecimiento;

  return establecimientoId
    ? `/inteli/establedetalle/${establecimientoId}`
    : DEFAULT_NOTIFICATION_URL;
};

const emitRealtimeNotification = (userId, event, payload) => {
  try {
    socketServer.emitToUser?.(userId, event, payload);
  } catch (error) {
    console.error('No se pudo emitir la notificación en tiempo real:', error.message);
  }
};

const buildPushPayload = (payload = {}) =>
  JSON.stringify({
    title: payload.title,
    body: payload.message,
    url: payload.url || DEFAULT_NOTIFICATION_URL,
  });

const sendPushToUser = async (userDoc, payload, options = {}) => {
  if (!userDoc) {
    return false;
  }

  if (options.realtimeEvent) {
    emitRealtimeNotification(userDoc._id, options.realtimeEvent, payload);
  }

  if (!Array.isArray(userDoc.pushSubscriptions) || !userDoc.pushSubscriptions.length) {
    return false;
  }

  const body = buildPushPayload(payload);
  const validSubscriptions = [];

  for (const subscription of userDoc.pushSubscriptions) {
    try {
      await webPush.sendNotification(subscription, body);
      validSubscriptions.push(subscription);
    } catch (error) {
      console.error('Error enviando notificación push:', error.message);
      if (error.statusCode !== 410) {
        validSubscriptions.push(subscription);
      }
    }
  }

  if (validSubscriptions.length !== userDoc.pushSubscriptions.length) {
    userDoc.pushSubscriptions = validSubscriptions;
    await userDoc.save().catch((error) => {
      console.error('No se pudieron depurar las suscripciones inválidas:', error.message);
    });
  }

  return validSubscriptions.length > 0;
};

const sendPushToUsers = async (users, payload, options = {}) => {
  for (const userDoc of users) {
    await sendPushToUser(userDoc, payload, options);
  }
};

module.exports = {
  DEFAULT_NOTIFICATION_URL,
  emitRealtimeNotification,
  extractClienteNombre,
  extractEstablecimientoNombre,
  resolveNotificationUrl,
  sendPushToUser,
  sendPushToUsers,
};
