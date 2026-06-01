const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeEmptyStringFields,
} = require('../helpers/fechaDerivado');

const {
  buildNotificationContent,
  getAddedProfessionalIds,
  normalizeAssignmentUpdate,
  normalizeAssignmentValue,
  normalizeReferenceIds,
} = require('../helpers/studyProfessionalAssignment');

test('normalizeAssignmentValue convierte un profesional suelto en array', () => {
  assert.deepEqual(normalizeAssignmentValue('abc'), ['abc']);
  assert.deepEqual(normalizeAssignmentValue(['abc', null, 'def']), ['abc', 'def']);
  assert.deepEqual(normalizeAssignmentValue(null), []);
});

test('normalizeAssignmentUpdate soporta updates directos y con $set', () => {
  const directUpdate = { profesional: 'abc' };
  const setUpdate = { $set: { profesional: 'def' } };

  normalizeAssignmentUpdate(directUpdate, 'profesional');
  normalizeAssignmentUpdate(setUpdate, 'profesional');

  assert.deepEqual(directUpdate, { profesional: ['abc'] });
  assert.deepEqual(setUpdate, { $set: { profesional: ['def'] } });
});

test('normalizeEmptyStringFields convierte strings vacios opcionales en undefined', () => {
  const normalized = normalizeEmptyStringFields(
    { resultado: '  ', estado: 'Vigente' },
    ['resultado']
  );

  assert.equal(normalized.resultado, undefined);
  assert.equal(normalized.estado, 'Vigente');
});

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
