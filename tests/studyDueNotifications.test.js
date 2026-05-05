const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildDueTodayNotificationContent,
  getAssignedProfessionalIds,
  getDayWindow,
  isDateWithinWindow,
} = require('../helpers/studyDueNotifications');

test('getAssignedProfessionalIds usa el campo configurado para OT', () => {
  const ids = getAssignedProfessionalIds(
    {
      asignado: [{ _id: 'prof-1' }, 'prof-2'],
    },
    {
      assignmentField: 'asignado',
    }
  );

  assert.deepEqual(ids, ['prof-1', 'prof-2']);
});

test('buildDueTodayNotificationContent arma el mensaje para un solo vencimiento', () => {
  const payload = buildDueTodayNotificationContent([
    {
      tipo: 'PAT',
      cliente: 'Cliente Demo',
      establecimiento: 'Av. Siempre Viva 123',
      dueDate: new Date('2026-04-09T12:00:00.000Z'),
      url: '/inteli/establedetalle/est-1',
    },
  ]);

  assert.equal(payload.title, 'Vencimiento de hoy');
  assert.equal(
    payload.message,
    'Hoy vence PAT para Cliente Demo - Av. Siempre Viva 123.'
  );
  assert.equal(payload.url, '/inteli/establedetalle/est-1');
});

test('buildDueTodayNotificationContent resume multiples vencimientos del dia', () => {
  const payload = buildDueTodayNotificationContent([
    {
      tipo: 'Verificación',
      cliente: 'Cliente B',
      establecimiento: 'Sucursal 2',
      dueDate: new Date('2026-04-09T18:00:00.000Z'),
      url: '/inteli/establedetalle/est-2',
    },
    {
      tipo: 'PAT',
      cliente: 'Cliente A',
      establecimiento: 'Sucursal 1',
      dueDate: new Date('2026-04-09T09:00:00.000Z'),
      url: '/inteli/establedetalle/est-1',
    },
  ]);

  assert.equal(payload.title, 'Vencimientos de hoy');
  assert.equal(
    payload.message,
    'Hoy vencen 2 estudios. Primero: PAT para Cliente A - Sucursal 1.'
  );
  assert.equal(payload.url, '/inteli/establedetalle/est-1');
});

test('isDateWithinWindow compara usando el dia local de Argentina', () => {
  const window = getDayWindow(
    new Date('2026-04-09T15:00:00.000Z'),
    'America/Argentina/Buenos_Aires'
  );

  assert.equal(
    isDateWithinWindow(new Date('2026-04-09T23:30:00.000Z'), window),
    true
  );
  assert.equal(
    isDateWithinWindow(new Date('2026-04-10T03:30:00.000Z'), window),
    false
  );
});
