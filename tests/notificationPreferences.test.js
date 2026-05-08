const test = require('node:test');
const assert = require('node:assert/strict');

const NotificationPreference = require('../models/NotificationPreference');
const {
  getNotificationPreferenceDefaults,
  isSupportedNotificationEvent,
  mergeNotificationPreference,
  upsertUserNotificationPreference,
} = require('../services/notificationPreferences');
const { shouldSendChannel } = require('../helpers/studyProfessionalAssignment');

test('getNotificationPreferenceDefaults mantiene compatibilidad para assignment', () => {
  assert.deepEqual(getNotificationPreferenceDefaults('PROFESSIONAL_ASSIGNED_TO_STUDY'), {
    eventKey: 'PROFESSIONAL_ASSIGNED_TO_STUDY',
    inAppEnabled: true,
    emailEnabled: false,
  });
});

test('isSupportedNotificationEvent valida solo eventos registrados', () => {
  assert.equal(isSupportedNotificationEvent('PROFESSIONAL_ASSIGNED_TO_STUDY'), true);
  assert.equal(isSupportedNotificationEvent('UNKNOWN_EVENT'), false);
});

test('mergeNotificationPreference aplica defaults cuando no existe documento', () => {
  assert.deepEqual(mergeNotificationPreference('PROFESSIONAL_ASSIGNED_TO_STUDY', null), {
    eventKey: 'PROFESSIONAL_ASSIGNED_TO_STUDY',
    inAppEnabled: true,
    emailEnabled: false,
  });
});

test('shouldSendChannel respeta el estado de cada canal', () => {
  const preference = {
    inAppEnabled: false,
    emailEnabled: true,
  };

  assert.equal(shouldSendChannel(preference, 'inApp'), false);
  assert.equal(shouldSendChannel(preference, 'email'), true);
});

test('upsertUserNotificationPreference no duplica flags entre $set y $setOnInsert', async () => {
  const originalFindOneAndUpdate = NotificationPreference.findOneAndUpdate;
  let capturedUpdate = null;

  NotificationPreference.findOneAndUpdate = (filter, update, options) => {
    capturedUpdate = { filter, update, options };
    return {
      lean: async () => ({
        userId: filter.userId,
        eventKey: filter.eventKey,
        inAppEnabled: update.$set.inAppEnabled,
        emailEnabled: update.$set.emailEnabled,
      }),
    };
  };

  try {
    const result = await upsertUserNotificationPreference(
      '649df5e39ffba22c2af6861f',
      'PROFESSIONAL_ASSIGNED_TO_STUDY',
      {
        inAppEnabled: false,
        emailEnabled: false,
      }
    );

    assert.deepEqual(result, {
      eventKey: 'PROFESSIONAL_ASSIGNED_TO_STUDY',
      inAppEnabled: false,
      emailEnabled: false,
    });
    assert.deepEqual(capturedUpdate.update.$set, {
      inAppEnabled: false,
      emailEnabled: false,
    });
    assert.deepEqual(capturedUpdate.update.$setOnInsert, {
      userId: '649df5e39ffba22c2af6861f',
      eventKey: 'PROFESSIONAL_ASSIGNED_TO_STUDY',
    });
    assert.equal(
      Object.prototype.hasOwnProperty.call(capturedUpdate.update.$setOnInsert, 'inAppEnabled'),
      false
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(capturedUpdate.update.$setOnInsert, 'emailEnabled'),
      false
    );
  } finally {
    NotificationPreference.findOneAndUpdate = originalFindOneAndUpdate;
  }
});
