const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getStudyAssignmentField,
  getStudyConfig,
  getStudyDateFields,
  resolveStudyDueDate,
  resolveStudyEditPath,
  resolveStudyStatus,
} = require('../helpers/studyRegistry');

test('getStudyConfig resuelve estudios nuevos y alias normalizados', () => {
  const analisis = getStudyConfig('analisisderiesgo');
  assert.ok(analisis);
  assert.equal(analisis.key, 'analisis-de-riesgo');
  assert.equal(analisis.apiPath, '/api/analisisderiesgo');

  const emergencias = getStudyConfig('Capacitación en Emergencias');
  assert.ok(emergencias);
  assert.equal(emergencias.key, 'capacitacion-emergencias');

  const certificadoRedIncendio = getStudyConfig('certificadoredincendio');
  assert.ok(certificadoRedIncendio);
  assert.equal(certificadoRedIncendio.key, 'certificado-red-incendio');
  assert.equal(
    certificadoRedIncendio.apiPath,
    '/api/certificadoredincendio'
  );

  const residuosEspeciales = getStudyConfig('residuosespeciales');
  assert.ok(residuosEspeciales);
  assert.equal(residuosEspeciales.key, 'residuos-especiales');
  assert.equal(residuosEspeciales.apiPath, '/api/residuosespeciales');

  const srtRes90515 = getStudyConfig('SRT Res. 905/15');
  assert.ok(srtRes90515);
  assert.equal(srtRes90515.key, 'srt-res-905-15');
  assert.equal(srtRes90515.apiPath, '/api/srtres90515');

  const ddjjCancerigenos = getStudyConfig('DDJJ cancerigenos');
  assert.ok(ddjjCancerigenos);
  assert.equal(ddjjCancerigenos.key, 'ddjj-cancerigenos');
  assert.equal(ddjjCancerigenos.apiPath, '/api/ddjjcancerigenos');

  const cargaTermica = getStudyConfig('Carga termica');
  assert.ok(cargaTermica);
  assert.equal(cargaTermica.key, 'carga-termica');
  assert.equal(cargaTermica.apiPath, '/api/cargatermica');

  const ventilacion = getStudyConfig('Ventilacion');
  assert.ok(ventilacion);
  assert.equal(ventilacion.key, 'ventilacion');
  assert.equal(ventilacion.apiPath, '/api/ventilacion');

  const controlEstiabs = getStudyConfig('Control Estiabs');
  assert.ok(controlEstiabs);
  assert.equal(controlEstiabs.key, 'control-estiabs');
  assert.equal(controlEstiabs.apiPath, '/api/controlestiabs');

  const certifMaqHerram = getStudyConfig('Certif Maq. y Herram');
  assert.ok(certifMaqHerram);
  assert.equal(certifMaqHerram.key, 'certif-maq-herram');
  assert.equal(certifMaqHerram.apiPath, '/api/certifmaqherram');

  const convenioProf = getStudyConfig('Convenio Prof');
  assert.ok(convenioProf);
  assert.equal(convenioProf.key, 'convenio-prof');
  assert.equal(convenioProf.apiPath, '/api/convenioprof');

  const relevamientoTrimesAutoelev = getStudyConfig('Relevamiento Trimes de Autoelev.');
  assert.ok(relevamientoTrimesAutoelev);
  assert.equal(relevamientoTrimesAutoelev.key, 'relevamiento-trimes-autoelev');
  assert.equal(relevamientoTrimesAutoelev.apiPath, '/api/relevamientotrimesautoelev');
});

test('resolveStudyStatus y resolveStudyDueDate contemplan campos de capacitaciones nuevas', () => {
  const config = getStudyConfig('capacitacionemergencias');
  const study = {
    estadoVigencia: 'Vigente',
    vencimientoCapacitacion: new Date('2026-12-15T00:00:00.000Z'),
  };

  assert.equal(resolveStudyStatus(config, study), 'Vigente');
  assert.deepEqual(
    resolveStudyDueDate(config, study),
    new Date('2026-12-15T00:00:00.000Z')
  );
});

test('resolveStudyEditPath arma la ruta de edicion con el id', () => {
  const config = getStudyConfig('termografia');
  assert.equal(
    resolveStudyEditPath(config, 'abc123'),
    '/api/termografia/abc123'
  );
});

test('getStudyAssignmentField soporta configuraciones especiales como OT', () => {
  const config = getStudyConfig('ot');
  assert.equal(getStudyAssignmentField(config), 'asignado');
});

test('Carga de Fuego usa solo vencimiento como fecha relevante', () => {
  const config = getStudyConfig('carga de fuego');
  assert.deepEqual(getStudyDateFields(config), ['vencimiento']);

  const dueDate = resolveStudyDueDate(config, {
    fecha: new Date('2026-04-09T00:00:00.000Z'),
    vencimiento: new Date('2026-06-15T00:00:00.000Z'),
  });

  assert.deepEqual(
    dueDate,
    new Date('2026-06-15T00:00:00.000Z')
  );
});
