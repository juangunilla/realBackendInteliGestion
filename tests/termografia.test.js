const test = require('node:test');
const assert = require('node:assert/strict');

const {
  Termografia,
  syncTermografiaFields,
} = require('../models/form/termografia');

test('syncTermografiaFields calcula vencimiento un año despues de la fecha de emision', () => {
  const payload = {
    numeroTableros: '5',
    fechaEmision: '2026-04-03T00:00:00.000Z',
  };

  syncTermografiaFields(payload);

  assert.equal(payload.numeroTableros, 5);
  assert.ok(payload.vencimiento instanceof Date);
  assert.equal(payload.vencimiento.toISOString(), '2027-04-03T00:00:00.000Z');
});

test('Termografia normaliza el vencimiento al validar el documento', async () => {
  const doc = new Termografia({
    cliente: [],
    establecimiento: [],
    numeroTableros: 2,
    fechaEmision: '2025-01-15T00:00:00.000Z',
    observacion: 'Relevamiento anual',
    cotizacion: '12345',
  });

  await doc.validate();

  assert.ok(doc.vencimiento instanceof Date);
  assert.equal(doc.vencimiento.toISOString(), '2026-01-15T00:00:00.000Z');
});
