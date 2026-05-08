const test = require('node:test');
const assert = require('node:assert/strict');

const { Antisinestral, AntisinestralHist } = require('../models/form/antisinestral');

test('Antisinestral expone checks de plano y croquis con default false', async () => {
  const doc = new Antisinestral({
    cliente: [],
    establecimiento: [],
  });

  await doc.validate();

  assert.equal(doc.planoEvac, false);
  assert.equal(doc.croquisUea, false);
  assert.equal(doc.croquisInc, false);
});

test('AntisinestralHist acepta checks informados en el payload', async () => {
  const doc = new AntisinestralHist({
    cliente: [],
    establecimiento: [],
    planoEvac: true,
    croquisUea: true,
    croquisInc: false,
  });

  await doc.validate();

  assert.equal(doc.planoEvac, true);
  assert.equal(doc.croquisUea, true);
  assert.equal(doc.croquisInc, false);
});
