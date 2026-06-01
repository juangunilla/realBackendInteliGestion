const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DdjjCancerigenos,
} = require('../models/form/ddjjCancerigenos');
const { getStudyConfig } = require('../helpers/studyRegistry');

test('DdjjCancerigenos expone los campos base del formulario', () => {
  const documento = new DdjjCancerigenos({});

  assert.equal(documento.confeccion, undefined);
  assert.equal(documento.vencimiento, undefined);
  assert.equal(documento.observacion, undefined);
});

test('getStudyConfig resuelve DDJJ cancerigenos', () => {
  const study = getStudyConfig('ddjjcancerigenos');

  assert.ok(study);
  assert.equal(study.key, 'ddjj-cancerigenos');
  assert.equal(study.apiPath, '/api/ddjjcancerigenos');
});
