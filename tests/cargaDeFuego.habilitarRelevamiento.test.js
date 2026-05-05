const test = require('node:test');
const assert = require('node:assert/strict');

const modelPath = require.resolve('../models/form/cargaDeFuego');
const auditHelperPath = require.resolve('../helpers/auditHelper');
const controllerPath = require.resolve('../controllers/form/cargaDeFuego');

const cargaDeFuego = require('../models/form/cargaDeFuego');
const auditHelper = require('../helpers/auditHelper');

const originalFindById = cargaDeFuego.findById;
const originalFind = cargaDeFuego.find;
const originalRegistrarAccion = auditHelper.registrarAccion;

const loadController = () => {
  delete require.cache[controllerPath];
  return require('../controllers/form/cargaDeFuego');
};

const createResponseMock = () => {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
  };
};

test.afterEach(() => {
  cargaDeFuego.findById = originalFindById;
  cargaDeFuego.find = originalFind;
  auditHelper.registrarAccion = originalRegistrarAccion;
  delete require.cache[controllerPath];
  require.cache[modelPath] = require.cache[modelPath];
  require.cache[auditHelperPath] = require.cache[auditHelperPath];
});

test('habilita correctamente el relevamiento', async () => {
  const doc = {
    _id: 'estudio-1',
    relevamientoHabilitado: false,
    fechaHabilitacionRelevamiento: null,
    habilitadoRelevamientoPor: null,
    saveCalls: 0,
    async save() {
      this.saveCalls += 1;
      return this;
    },
  };

  cargaDeFuego.findById = async () => doc;

  let auditPayload = null;
  auditHelper.registrarAccion = async (payload) => {
    auditPayload = payload;
  };

  const { habilitarRelevamientoCargaDeFuego } = loadController();
  const req = { params: { id: 'estudio-1' }, user: { _id: 'user-1', nombreyapellido: 'Test User' } };
  const res = createResponseMock();

  await habilitarRelevamientoCargaDeFuego(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'success');
  assert.equal(res.body.msg, 'Relevamiento habilitado correctamente');
  assert.equal(doc.relevamientoHabilitado, true);
  assert.equal(doc.habilitadoRelevamientoPor, 'user-1');
  assert.ok(doc.fechaHabilitacionRelevamiento instanceof Date);
  assert.equal(doc.saveCalls, 1);
  assert.equal(auditPayload.entity, 'cargaDeFuego');
});

test('devuelve 404 si el id no existe', async () => {
  cargaDeFuego.findById = async () => null;
  auditHelper.registrarAccion = async () => {};

  const { habilitarRelevamientoCargaDeFuego } = loadController();
  const req = { params: { id: 'inexistente' } };
  const res = createResponseMock();

  await habilitarRelevamientoCargaDeFuego(req, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, {
    status: 'error',
    msg: 'Carga de Fuego no encontrada',
  });
});

test('es idempotente si ya estaba habilitado', async () => {
  const doc = {
    _id: 'estudio-2',
    relevamientoHabilitado: true,
    fechaHabilitacionRelevamiento: new Date('2026-04-01T10:00:00.000Z'),
    habilitadoRelevamientoPor: 'user-2',
    async save() {
      throw new Error('no debería guardar');
    },
  };

  cargaDeFuego.findById = async () => doc;
  auditHelper.registrarAccion = async () => {
    throw new Error('no debería auditar');
  };

  const { habilitarRelevamientoCargaDeFuego } = loadController();
  const req = { params: { id: 'estudio-2' } };
  const res = createResponseMock();

  await habilitarRelevamientoCargaDeFuego(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'success');
  assert.equal(res.body.msg, 'El relevamiento ya estaba habilitado');
  assert.equal(res.body.data, doc);
});

test('expone el flag en la respuesta del listado', async () => {
  const docs = [
    {
      _id: 'estudio-3',
      relevamientoHabilitado: true,
      fechaHabilitacionRelevamiento: new Date('2026-04-01T10:00:00.000Z'),
      habilitadoRelevamientoPor: 'user-3',
    },
  ];

  cargaDeFuego.find = async () => docs;
  const { getItems } = loadController();
  const req = {};
  const res = createResponseMock();

  await getItems(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'success');
  assert.equal(res.body.data[0].relevamientoHabilitado, true);
  assert.equal(res.body.data[0].habilitadoRelevamientoPor, 'user-3');
  assert.ok(res.body.data[0].fechaHabilitacionRelevamiento instanceof Date);
});
