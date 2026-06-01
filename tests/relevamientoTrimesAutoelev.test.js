const test = require('node:test');
const assert = require('node:assert/strict');

const controllerPath = require.resolve('../controllers/form/relevamientoTrimesAutoelev');
const RelevamientoTrimesAutoelev = require('../models/form/relevamientoTrimesAutoelev');
const { calculateVencimientoFromConfeccion } = require('../middlewares/vencitrimestral');
const { getStudyConfig } = require('../helpers/studyRegistry');

const originalFindByIdAndUpdate = RelevamientoTrimesAutoelev.findByIdAndUpdate;

const loadController = () => {
  delete require.cache[controllerPath];
  return require('../controllers/form/relevamientoTrimesAutoelev');
};

const createResponseMock = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  send(payload) {
    this.body = payload;
    return this;
  },
});

test.afterEach(() => {
  RelevamientoTrimesAutoelev.findByIdAndUpdate = originalFindByIdAndUpdate;
  delete require.cache[controllerPath];
});

test('calculateVencimientoFromConfeccion mantiene tres meses para relevamiento trimestral', () => {
  const vencimiento = calculateVencimientoFromConfeccion('2026-05-07T00:00:00.000Z');

  assert.equal(vencimiento.toISOString(), '2026-08-07T00:00:00.000Z');
});

test('updateItem recalcula vencimiento a tres meses cuando cambia confeccion', async () => {
  let receivedUpdate = null;
  RelevamientoTrimesAutoelev.findByIdAndUpdate = async (_id, update) => {
    receivedUpdate = update;
    return { _id, ...update.$set };
  };

  const { updateItem } = loadController();
  const req = {
    params: { _id: 'rel-1' },
    body: {
      confeccion: '2026-05-07T00:00:00.000Z',
    },
  };
  const res = createResponseMock();

  await updateItem(req, res);

  assert.equal(receivedUpdate.$set.vencimiento.toISOString(), '2026-08-07T00:00:00.000Z');
  assert.equal(res.body, 'Actualizaste datos del estudiorel-1');
});

test('getStudyConfig resuelve Relevamiento Trimes de Autoelev.', () => {
  const study = getStudyConfig('relevamientotrimesautoelev');

  assert.ok(study);
  assert.equal(study.key, 'relevamiento-trimes-autoelev');
  assert.equal(study.apiPath, '/api/relevamientotrimesautoelev');
});
