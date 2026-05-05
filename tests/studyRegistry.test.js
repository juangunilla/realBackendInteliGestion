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
