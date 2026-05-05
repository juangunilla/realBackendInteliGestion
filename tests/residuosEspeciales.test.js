const test = require('node:test');
const assert = require('node:assert/strict');

const {
  syncResiduosEspecialesFields,
} = require('../models/form/residuosEspeciales');

test('syncResiduosEspecialesFields calcula vencimiento a 10 años y sincroniza observaciones', () => {
  const payload = {
    fechaEstudio: '2026-04-14T00:00:00.000Z',
    observaciones: 'Formulario relacionado a residuos especiales',
  };

  syncResiduosEspecialesFields(payload);

  assert.deepEqual(payload.vencimiento, new Date('2036-04-14T00:00:00.000Z'));
  assert.equal(payload.observacion, 'Formulario relacionado a residuos especiales');
  assert.equal(payload.comentarios, 'Formulario relacionado a residuos especiales');
});

test('syncResiduosEspecialesFields respeta fechaVencimiento si llega explícita', () => {
  const payload = {
    fechaEstudio: '2026-04-14T00:00:00.000Z',
    fechaVencimiento: '2037-01-01T00:00:00.000Z',
  };

  syncResiduosEspecialesFields(payload);

  assert.deepEqual(payload.vencimiento, new Date('2037-01-01T00:00:00.000Z'));
});
