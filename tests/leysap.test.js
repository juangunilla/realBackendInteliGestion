const test = require('node:test');
const assert = require('node:assert/strict');

const LeySap = require('../models/form/leysap');

test('LeySap acepta hasta cuatro fechas de simulacro', async () => {
  const doc = new LeySap({
    cliente: [],
    establecimiento: [],
    primerSimulacroFecha: '2026-01-10T00:00:00.000Z',
    segundoSimulacroFecha: '2026-03-10T00:00:00.000Z',
    tercerSimulacroFecha: '2026-05-10T00:00:00.000Z',
    cuartoSimulacroFecha: '2026-07-10T00:00:00.000Z',
  });

  await doc.validate();

  assert.equal(doc.primerSimulacroFecha.toISOString(), '2026-01-10T00:00:00.000Z');
  assert.equal(doc.segundoSimulacroFecha.toISOString(), '2026-03-10T00:00:00.000Z');
  assert.equal(doc.tercerSimulacroFecha.toISOString(), '2026-05-10T00:00:00.000Z');
  assert.equal(doc.cuartoSimulacroFecha.toISOString(), '2026-07-10T00:00:00.000Z');
});
