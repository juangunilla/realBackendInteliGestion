const test = require('node:test');
const assert = require('node:assert/strict');

const {
  AnalisisDeRiesgo,
} = require('../models/form/analisisDeRiesgo');

test('AnalisisDeRiesgo inicializa el checklist con mapa, rar y matriz', () => {
  const documento = new AnalisisDeRiesgo({});

  assert.deepEqual(documento.checklist.toObject(), {
    mapa: false,
    rar: false,
    matriz: false,
  });
});
