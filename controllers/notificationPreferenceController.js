const {
  getUserNotificationPreferences,
  isSupportedNotificationEvent,
  upsertUserNotificationPreference,
} = require('../services/notificationPreferences');

const getAuthenticatedUserId = (req) => req.user?._id || req.user?.id || null;

const getPreferences = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado',
      });
    }

    const data = await getUserNotificationPreferences(userId);

    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Error al obtener preferencias de notificación:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener preferencias de notificación',
    });
  }
};

const updatePreference = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado',
      });
    }

    const eventKey = `${req.params.eventKey || ''}`.toUpperCase();

    if (!isSupportedNotificationEvent(eventKey)) {
      return res.status(400).json({
        status: 'error',
        message: 'Evento de notificación no soportado',
      });
    }

    const { inAppEnabled, emailEnabled } = req.body || {};
    const data = await upsertUserNotificationPreference(userId, eventKey, {
      inAppEnabled,
      emailEnabled,
    });

    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Error al actualizar preferencia de notificación:', error);
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Error al actualizar preferencia de notificación',
    });
  }
};

module.exports = {
  getPreferences,
  updatePreference,
};
