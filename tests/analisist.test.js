const test = require('node:test');
const assert = require('node:assert/strict');

const controllerPath = require.resolve('../controllers/form/analisist');
const modelPath = require.resolve('../models/form/analisist');

const { Analisis } = require('../models/form/analisist');

const originalFindById = Analisis.findById;
const originalCountDocuments = Analisis.countDocuments;
const originalCreate = Analisis.create;
const originalFindByIdAndUpdate = Analisis.findByIdAndUpdate;

const loadController = () => {
  delete require.cache[controllerPath];
  return require('../controllers/form/analisist');
};

const createResponseMock = () => ({
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
});

test.afterEach(() => {
  Analisis.findById = originalFindById;
  Analisis.countDocuments = originalCountDocuments;
  Analisis.create = originalCreate;
  Analisis.findByIdAndUpdate = originalFindByIdAndUpdate;
  delete require.cache[controllerPath];
  require.cache[modelPath] = require.cache[modelPath];
});

test('crearRevalidacionAnalisis replica el estudio y marca la revalidacion', async () => {
  const estudioBase = {
    _id: '507f1f77bcf86cd799439021',
    cliente: [{ _id: '507f1f77bcf86cd799439011' }],
    establecimiento: [{ _id: '507f1f77bcf86cd799439012' }],
    confeccion: new Date('2026-05-01T00:00:00.000Z'),
    vencimiento: new Date('2026-08-01T00:00:00.000Z'),
    observacion: 'Original',
    entregaDocumentacion: true,
  };

  let createPayload = null;
  Analisis.findById = async () => estudioBase;
  Analisis.countDocuments = async () => 2;
  Analisis.create = async (payload) => {
    createPayload = payload;
    return { _id: '507f1f77bcf86cd799439099', ...payload };
  };

  const { crearRevalidacionAnalisis } = loadController();
  const req = { params: { id: estudioBase._id } };
  const res = createResponseMock();

  await crearRevalidacionAnalisis(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.deepEqual(createPayload.cliente, ['507f1f77bcf86cd799439011']);
  assert.deepEqual(createPayload.establecimiento, ['507f1f77bcf86cd799439012']);
  assert.equal(createPayload.revalidacionDe, estudioBase._id);
  assert.equal(createPayload.estudioOrigen, estudioBase._id);
  assert.equal(createPayload.esRevalidacion, true);
  assert.equal(createPayload.numeroRevalidacion, 2);
});

test('updateItem normaliza fechas vacias antes de persistir', async () => {
  let receivedUpdate = null;
  Analisis.findByIdAndUpdate = async (_id, update) => {
    receivedUpdate = update;
    return { _id, ...update.$set };
  };

  const { updateItem } = loadController();
  const req = {
    params: { _id: 'analisis-1' },
    body: {
      confeccion: '',
      vencimiento: ' ',
    },
  };
  const res = createResponseMock();

  await updateItem(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'success');
  assert.equal(receivedUpdate.$set.confeccion, null);
  assert.equal(receivedUpdate.$set.vencimiento, null);
});
