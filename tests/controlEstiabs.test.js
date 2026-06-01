const test = require('node:test');
const assert = require('node:assert/strict');

const { ControlEstiabs } = require('../models/form/controlEstiabs');
const { getStudyConfig } = require('../helpers/studyRegistry');

test('ControlEstiabs expone los campos base del formulario', () => {
  const documento = new ControlEstiabs({});

  assert.equal(documento.confeccion, undefined);
  assert.equal(documento.vencimiento, undefined);
  assert.equal(documento.observacion, undefined);
});

test('getStudyConfig resuelve Control Estiabs', () => {
  const study = getStudyConfig('controlestiabs');

  assert.ok(study);
  assert.equal(study.key, 'control-estiabs');
  assert.equal(study.apiPath, '/api/controlestiabs');
});
