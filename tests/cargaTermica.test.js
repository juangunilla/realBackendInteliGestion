const test = require('node:test');
const assert = require('node:assert/strict');

const { CargaTermica } = require('../models/form/cargaTermica');
const { getStudyConfig } = require('../helpers/studyRegistry');

test('CargaTermica expone los campos base del formulario', () => {
  const documento = new CargaTermica({});

  assert.equal(documento.confeccion, undefined);
  assert.equal(documento.vencimiento, undefined);
  assert.equal(documento.observacion, undefined);
});

test('getStudyConfig resuelve Carga termica', () => {
  const study = getStudyConfig('cargatermica');

  assert.ok(study);
  assert.equal(study.key, 'carga-termica');
  assert.equal(study.apiPath, '/api/cargatermica');
});
