const test = require('node:test');
const assert = require('node:assert/strict');

const controllerPath = require.resolve('../controllers/form/cargaDeFuego');
const modelPath = require.resolve('../models/form/cargaDeFuego');
const cargaDeFuego = require('../models/form/cargaDeFuego');

const originalCreate = cargaDeFuego.create;
const originalFindByIdAndUpdate = cargaDeFuego.findByIdAndUpdate;

const loadController = () => {
  delete require.cache[controllerPath];
  return require('../controllers/form/cargaDeFuego');
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
  cargaDeFuego.create = originalCreate;
  cargaDeFuego.findByIdAndUpdate = originalFindByIdAndUpdate;
  delete require.cache[controllerPath];
  require.cache[modelPath] = require.cache[modelPath];
});

test('postItem normaliza referencias anidadas y fechas vacias', async () => {
  let receivedPayload = null;
  cargaDeFuego.create = async (payload) => {
    receivedPayload = payload;
    return { _id: 'carga-1', ...payload };
  };

  const { postItem } = loadController();
  const req = {
    body: {
      cliente: [{ _id: '507f1f77bcf86cd799439011' }],
      establecimiento: { _id: '507f1f77bcf86cd799439012' },
      entidad: 'Bomberos',
      fecha: '',
      vencimiento: '   ',
      comentario: 'Alta nueva',
    },
  };
  const res = createResponseMock();

  await postItem(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.status, 'success');
  assert.deepEqual(receivedPayload.cliente, ['507f1f77bcf86cd799439011']);
  assert.deepEqual(receivedPayload.establecimiento, ['507f1f77bcf86cd799439012']);
  assert.equal(receivedPayload.fecha, null);
  assert.equal(receivedPayload.vencimiento, null);
});

test('postItem devuelve 400 si cliente o establecimiento no son validos', async () => {
  cargaDeFuego.create = async () => {
    throw new Error('no debería crear');
  };

  const { postItem } = loadController();
  const req = {
    body: {
      cliente: '',
      establecimiento: 'invalido',
    },
  };
  const res = createResponseMock();

  await postItem(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    status: 'error',
    message: 'El campo cliente y establecimiento debe ser un ObjectId válido',
  });
});

test('updateItem normaliza fechas vacias antes de persistir', async () => {
  let receivedUpdate = null;
  cargaDeFuego.findByIdAndUpdate = async (_id, update) => {
    receivedUpdate = update;
    return { _id, ...update.$set };
  };

  const { updateItem } = loadController();
  const req = {
    params: { _id: 'carga-1' },
    body: {
      fecha: '',
      vencimiento: ' ',
    },
  };
  const res = createResponseMock();

  await updateItem(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'success');
  assert.equal(receivedUpdate.$set.fecha, null);
  assert.equal(receivedUpdate.$set.vencimiento, null);
});
