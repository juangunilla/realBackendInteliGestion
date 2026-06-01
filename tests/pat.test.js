const test = require('node:test');
const assert = require('node:assert/strict');

const Pat = require('../models/form/pat');

test('PAT usa PAT como tipoEstudio por defecto', () => {
  const documento = new Pat({});

  assert.equal(documento.tipoEstudio, 'PAT');
});

test('PAT permite Proteccion catodica como tipoEstudio', () => {
  const documento = new Pat({ tipoEstudio: 'Proteccion catodica' });

  assert.equal(documento.tipoEstudio, 'Proteccion catodica');
});
