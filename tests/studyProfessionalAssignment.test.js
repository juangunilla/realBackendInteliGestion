const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildNotificationContent,
  getAddedProfessionalIds,
  normalizeReferenceIds,
} = require('../helpers/studyProfessionalAssignment');

test('normalizeReferenceIds soporta strings, ObjectId-like y arrays', () => {
  const ids = normalizeReferenceIds([
    'abc',
    { _id: 'def' },
    null,
    { _id: 'abc' },
  ]);

  assert.deepEqual(ids, ['abc', 'def']);
});

test('getAddedProfessionalIds devuelve solo los profesionales recien asignados', () => {
  const added = getAddedProfessionalIds(
    [{ _id: 'p1' }],
    [{ _id: 'p1' }, { _id: 'p2' }, 'p3']
  );

  assert.deepEqual(added, ['p2', 'p3']);
});

test('buildNotificationContent arma mensaje y url con establecimiento', () => {
  const payload = buildNotificationContent(
    {
      _id: 'study-1',
      cliente: [{ razonSocial: 'Cliente Demo' }],
      establecimiento: [{ _id: 'est-1', calle: 'Av. Siempre Viva 123' }],
    },
    { studyLabel: 'el estudio PAT' }
  );

  assert.equal(payload.title, 'Nuevo estudio asignado');
  assert.equal(
    payload.message,
    'Se te asignó el estudio PAT para Cliente Demo - Av. Siempre Viva 123.'
  );
  assert.equal(payload.url, '/inteli/establedetalle/est-1');
  assert.match(payload.mailText, /Cliente: Cliente Demo/);
});
