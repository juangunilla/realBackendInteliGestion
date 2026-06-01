const test = require('node:test');
const assert = require('node:assert/strict');

const resolveModel = (value) => {
  if (value?.schema) {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return Object.values(value).find((candidate) => candidate?.schema);
};

const studyModels = [
  ['AguaBacteriologico', resolveModel(require('../models/form/aguaBacteriologico'))],
  ['AguaFisicoQuimico', resolveModel(require('../models/form/aguaFisicoQuimico'))],
  ['AnalisisDeRiesgo', resolveModel(require('../models/form/analisisDeRiesgo'))],
  ['Analisis', resolveModel(require('../models/form/analisist'))],
  ['Antisinestral', resolveModel(require('../models/form/antisinestral'))],
  ['Art', resolveModel(require('../models/form/art'))],
  ['ArtClient', resolveModel(require('../models/form/artClient'))],
  ['ArtRGRGL', resolveModel(require('../models/form/artRGRGL'))],
  ['Asp', resolveModel(require('../models/form/asp'))],
  ['AspCanerias', resolveModel(require('../models/form/aspCanerias'))],
  ['AspEnsayo', resolveModel(require('../models/form/aspEnsayo'))],
  ['AspHidraulica', resolveModel(require('../models/form/aspHidraulica'))],
  ['CapacitacionAutoelevadorRes96015', resolveModel(require('../models/form/capacitacionAutoelevadorRes96015'))],
  ['CapacitacionEnEmergencias', resolveModel(require('../models/form/capacitacionEnEmergencias'))],
  ['CapacitacionIncendio', resolveModel(require('../models/form/CapacitacionIncendio'))],
  ['CapacitacionRiesgoEspecifico', resolveModel(require('../models/form/capacitacionRiesgoEspecifico'))],
  ['Capacitaciones', resolveModel(require('../models/form/capacitaciones'))],
  ['CargaDeFuego', resolveModel(require('../models/form/cargaDeFuego'))],
  ['CargaTermica', resolveModel(require('../models/form/cargaTermica'))],
  ['CertifMaqHerram', resolveModel(require('../models/form/certifMaqHerram'))],
  ['CertificadoRedIncendio', resolveModel(require('../models/form/certificadoRedIncendio'))],
  ['ContaminanteLab', resolveModel(require('../models/form/contaminantelab'))],
  ['ControlEstiabs', resolveModel(require('../models/form/controlEstiabs'))],
  ['ControlExtintor', resolveModel(require('../models/form/controlExtintor'))],
  ['ConvenioProf', resolveModel(require('../models/form/convenioProf'))],
  ['Cronoc', resolveModel(require('../models/form/cronoc'))],
  ['Cronot', resolveModel(require('../models/form/cronot'))],
  ['DdjjCancerigenos', resolveModel(require('../models/form/ddjjCancerigenos'))],
  ['EntregaEpp', resolveModel(require('../models/form/entregaepp'))],
  ['Ergonomico', resolveModel(require('../models/form/ergonomico'))],
  ['EstudioHumo', resolveModel(require('../models/form/estudiohumo'))],
  ['IluminacionYRuido', resolveModel(require('../models/form/iluminacionyruido'))],
  ['LeySap', resolveModel(require('../models/form/leysap'))],
  ['Pat', resolveModel(require('../models/form/pat'))],
  ['RelevamientoTrimesAutoelev', resolveModel(require('../models/form/relevamientoTrimesAutoelev'))],
  ['ResiduosEspeciales', resolveModel(require('../models/form/residuosEspeciales'))],
  ['SrtRes90515', resolveModel(require('../models/form/srtRes90515'))],
  ['Termografia', resolveModel(require('../models/form/termografia'))],
  ['Ventilacion', resolveModel(require('../models/form/ventilacion'))],
  ['Verificacion', resolveModel(require('../models/form/verificacion'))],
  ['Vibracion', resolveModel(require('../models/form/vibracion'))],
];

test('todos los formularios de estudios con cliente y establecimiento exponen profesional', () => {
  studyModels.forEach(([label, model]) => {
    assert.ok(model?.schema, `${label} debe exportar un modelo válido`);
    assert.ok(
      model.schema.path('profesional'),
      `${label} debe incluir el campo profesional`
    );
  });
});
