const NotificationPreference = require('../models/NotificationPreference');

const NOTIFICATION_EVENTS = {
  PROFESSIONAL_ASSIGNED_TO_STUDY: {
    eventKey: 'PROFESSIONAL_ASSIGNED_TO_STUDY',
    inAppEnabled: true,
    emailEnabled: false,
  },
};

const getSupportedNotificationEventKeys = () => Object.keys(NOTIFICATION_EVENTS);

const isSupportedNotificationEvent = (eventKey) =>
  Object.prototype.hasOwnProperty.call(NOTIFICATION_EVENTS, `${eventKey || ''}`.toUpperCase());

const getNotificationPreferenceDefaults = (eventKey) => {
  const normalizedEventKey = `${eventKey || ''}`.toUpperCase();
  return NOTIFICATION_EVENTS[normalizedEventKey] || null;
};

const mergeNotificationPreference = (eventKey, preference) => {
  const defaults = getNotificationPreferenceDefaults(eventKey);
  if (!defaults) {
    return null;
  }

  return {
    eventKey: defaults.eventKey,
    inAppEnabled:
      typeof preference?.inAppEnabled === 'boolean'
        ? preference.inAppEnabled
        : defaults.inAppEnabled,
    emailEnabled:
      typeof preference?.emailEnabled === 'boolean'
        ? preference.emailEnabled
        : defaults.emailEnabled,
  };
};

const getUserNotificationPreferences = async (userId) => {
  const docs = await NotificationPreference.find({
    userId,
    eventKey: { $in: getSupportedNotificationEventKeys() },
  }).lean();

  const docsByEvent = new Map(docs.map((doc) => [doc.eventKey, doc]));

  return getSupportedNotificationEventKeys().map((eventKey) => {
    const merged = mergeNotificationPreference(eventKey, docsByEvent.get(eventKey));
    return {
      ...merged,
      userId,
      createdAt: docsByEvent.get(eventKey)?.createdAt || null,
      updatedAt: docsByEvent.get(eventKey)?.updatedAt || null,
    };
  });
};

const getUserNotificationPreference = async (userId, eventKey) => {
  const normalizedEventKey = `${eventKey || ''}`.toUpperCase();
  const preference = await NotificationPreference.findOne({
    userId,
    eventKey: normalizedEventKey,
  }).lean();

  return mergeNotificationPreference(normalizedEventKey, preference);
};

const upsertUserNotificationPreference = async (userId, eventKey, updates) => {
  const normalizedEventKey = `${eventKey || ''}`.toUpperCase();
  const defaults = getNotificationPreferenceDefaults(normalizedEventKey);

  if (!defaults) {
    const error = new Error('Evento de notificación no soportado');
    error.statusCode = 400;
    throw error;
  }

  const updatePayload = {};

  if (typeof updates.inAppEnabled === 'boolean') {
    updatePayload.inAppEnabled = updates.inAppEnabled;
  }
  if (typeof updates.emailEnabled === 'boolean') {
    updatePayload.emailEnabled = updates.emailEnabled;
  }

  if (!Object.keys(updatePayload).length) {
    const error = new Error('Debes enviar al menos una preferencia válida');
    error.statusCode = 400;
    throw error;
  }

  const doc = await NotificationPreference.findOneAndUpdate(
    { userId, eventKey: normalizedEventKey },
    {
      $set: updatePayload,
      $setOnInsert: {
        userId,
        eventKey: normalizedEventKey,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  ).lean();

  return mergeNotificationPreference(normalizedEventKey, doc);
};

module.exports = {
  NOTIFICATION_EVENTS,
  getNotificationPreferenceDefaults,
  getSupportedNotificationEventKeys,
  getUserNotificationPreference,
  getUserNotificationPreferences,
  isSupportedNotificationEvent,
  mergeNotificationPreference,
  upsertUserNotificationPreference,
};
