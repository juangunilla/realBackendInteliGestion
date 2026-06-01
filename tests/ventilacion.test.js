const test = require('node:test');
const assert = require('node:assert/strict');

const { Ventilacion } = require('../models/form/ventilacion');
const { getStudyConfig } = require('../helpers/studyRegistry');

test('Ventilacion expone los campos base del formulario', () => {
  const documento = new Ventilacion({});

  assert.equal(documento.confeccion, undefined);
  assert.equal(documento.vencimiento, undefined);
  assert.equal(documento.observacion, undefined);
});

test('getStudyConfig resuelve Ventilacion', () => {
  const study = getStudyConfig('ventilacion');

  assert.ok(study);
  assert.equal(study.key, 'ventilacion');
  assert.equal(study.apiPath, '/api/ventilacion');
});
