const test = require('node:test');
const assert = require('node:assert/strict');

const {
  syncCertificadoRedIncendioFields,
} = require('../models/form/certificadoRedIncendio');

test('syncCertificadoRedIncendioFields sincroniza observaciones y cotizado booleano', () => {
  const payload = {
    cotizado: true,
    observaciones: 'Certificado generado',
    fechaRevision: '2026-05-03T00:00:00.000Z',
  };

  syncCertificadoRedIncendioFields(payload);

  assert.equal(payload.cotizado, 'Si');
  assert.equal(payload.cotizacion, 'Si');
  assert.equal(payload.observacion, 'Certificado generado');
  assert.equal(payload.comentarios, 'Certificado generado');
  assert.deepEqual(payload.fechaRevision, new Date('2026-05-03T00:00:00.000Z'));
});

test('syncCertificadoRedIncendioFields admite cotizacion Si/No como alias de cotizado', () => {
  const payload = {
    cotizacion: 'No',
    observacion: 'Sin cotizar',
  };

  syncCertificadoRedIncendioFields(payload);

  assert.equal(payload.cotizado, 'No');
  assert.equal(payload.cotizacion, 'No');
  assert.equal(payload.observaciones, 'Sin cotizar');
});
