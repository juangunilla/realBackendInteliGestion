const test = require('node:test');
const assert = require('node:assert/strict');

const { ConvenioProf } = require('../models/form/convenioProf');
const { getStudyConfig } = require('../helpers/studyRegistry');

test('ConvenioProf expone los campos base del formulario', () => {
  const documento = new ConvenioProf({});

  assert.equal(documento.confeccion, undefined);
  assert.equal(documento.vencimiento, undefined);
  assert.equal(documento.observacion, undefined);
});

test('getStudyConfig resuelve Convenio Prof', () => {
  const study = getStudyConfig('convenioprof');

  assert.ok(study);
  assert.equal(study.key, 'convenio-prof');
  assert.equal(study.apiPath, '/api/convenioprof');
});
