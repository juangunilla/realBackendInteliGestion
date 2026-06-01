const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeEntregaDocumentacionPayload,
  normalizeEntregaDocumentacionDoc,
} = require('../helpers/entregaDocumentacion');
const { Art } = require('../models/form/art');
const { Artrgrgl } = require('../models/form/artRGRGL');
const { Ventilacion } = require('../models/form/ventilacion');
const { DdjjCancerigenos } = require('../models/form/ddjjCancerigenos');
const { SrtRes90515 } = require('../models/form/srtRes90515');
const { ControlEstiabs } = require('../models/form/controlEstiabs');
const { CertifMaqHerram } = require('../models/form/certifMaqHerram');
const { ConvenioProf } = require('../models/form/convenioProf');
const RelevamientoTrimesAutoelev = require('../models/form/relevamientoTrimesAutoelev');
const IluminacionRuido = require('../models/form/iluminacionyruido');

test('normaliza entregaDocumentacion en payloads sin convertirlo en string', () => {
  assert.deepEqual(
    normalizeEntregaDocumentacionPayload({ entregaDocumentacion: 'true' }),
    { entregaDocumentacion: true }
  );
  assert.deepEqual(
    normalizeEntregaDocumentacionPayload({ entregaDocumentacion: 'false' }),
    { entregaDocumentacion: false }
  );
  assert.deepEqual(
    normalizeEntregaDocumentacionPayload({ entregaDocumentacion: undefined }),
    { entregaDocumentacion: false }
  );
  assert.deepEqual(normalizeEntregaDocumentacionPayload({ observacion: 'ok' }), {
    observacion: 'ok',
  });
});

test('normaliza entregaDocumentacion ausente en documentos de respuesta como false', () => {
  const doc = normalizeEntregaDocumentacionDoc({ observacion: 'ok' });

  assert.equal(doc.entregaDocumentacion, false);
});

test('los estudios priorizados exponen entregaDocumentacion con default false', () => {
  const docs = [
    new Art({}),
    new Artrgrgl({}),
    new Ventilacion({}),
    new DdjjCancerigenos({}),
    new SrtRes90515({}),
    new ControlEstiabs({}),
    new CertifMaqHerram({}),
    new ConvenioProf({}),
    new RelevamientoTrimesAutoelev({}),
    new IluminacionRuido({}),
  ];

  for (const doc of docs) {
    assert.equal(doc.entregaDocumentacion, false);
    assert.equal(typeof doc.entregaDocumentacion, 'boolean');
  }
});
