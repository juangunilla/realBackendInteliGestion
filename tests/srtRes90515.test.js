const test = require('node:test');
const assert = require('node:assert/strict');

const { SrtRes90515 } = require('../models/form/srtRes90515');
const { getStudyConfig } = require('../helpers/studyRegistry');

test('SrtRes90515 expone los campos base y de cotizacion', () => {
  const documento = new SrtRes90515({});

  assert.equal(documento.confeccion, undefined);
  assert.equal(documento.vencimiento, undefined);
  assert.equal(documento.observacion, undefined);
  assert.equal(documento.cotizacion, undefined);
  assert.equal(documento.fechaCotizacion, undefined);
  assert.equal(documento.estadoCotizacion, undefined);
  assert.equal(documento.incluido, undefined);
});

test('getStudyConfig resuelve SRT Res. 905/15', () => {
  const study = getStudyConfig('srtres90515');

  assert.ok(study);
  assert.equal(study.key, 'srt-res-905-15');
  assert.equal(study.apiPath, '/api/srtres90515');
});
