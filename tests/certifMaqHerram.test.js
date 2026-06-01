const test = require('node:test');
const assert = require('node:assert/strict');

const { CertifMaqHerram } = require('../models/form/certifMaqHerram');
const { getStudyConfig } = require('../helpers/studyRegistry');

test('CertifMaqHerram expone los campos base del formulario', () => {
  const documento = new CertifMaqHerram({});

  assert.equal(documento.confeccion, undefined);
  assert.equal(documento.vencimiento, undefined);
  assert.equal(documento.observacion, undefined);
});

test('getStudyConfig resuelve Certif Maq. y Herram', () => {
  const study = getStudyConfig('certifmaqherram');

  assert.ok(study);
  assert.equal(study.key, 'certif-maq-herram');
  assert.equal(study.apiPath, '/api/certifmaqherram');
});
