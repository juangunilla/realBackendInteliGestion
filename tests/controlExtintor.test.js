const test = require('node:test');
const assert = require('node:assert/strict');

const controllerPath = require.resolve('../controllers/form/controlExtintor');
const ControlExtintor = require('../models/form/controlExtintor');
const { calculateVencimientoFromConfeccion } = require('../middlewares/vencitrimestral');

const originalFindByIdAndUpdate = ControlExtintor.findByIdAndUpdate;

const loadController = () => {
  delete require.cache[controllerPath];
  return require('../controllers/form/controlExtintor');
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
  ControlExtintor.findByIdAndUpdate = originalFindByIdAndUpdate;
  delete require.cache[controllerPath];
});

test('calculateVencimientoFromConfeccion permite sumar cuatro meses para control extintor', () => {
  const vencimiento = calculateVencimientoFromConfeccion('2026-05-07T00:00:00.000Z', 4);

  assert.ok(vencimiento instanceof Date);
  assert.equal(vencimiento.toISOString(), '2026-09-07T00:00:00.000Z');
});

test('updateItem recalcula vencimiento cuando cambia confeccion', async () => {
  let receivedUpdate = null;
  ControlExtintor.findByIdAndUpdate = async (_id, update) => {
    receivedUpdate = update;
    return { _id, ...update.$set };
  };

  const { updateItem } = loadController();
  const req = {
    params: { _id: 'ext-1' },
    body: {
      confeccion: '2026-05-07T00:00:00.000Z',
    },
  };
  const res = createResponseMock();

  await updateItem(req, res);

  assert.equal(receivedUpdate.$set.vencimiento.toISOString(), '2026-09-07T00:00:00.000Z');
  assert.equal(res.body, 'Actualizaste datos del estudioext-1');
});

test('calculateVencimientoFromConfeccion mantiene tres meses por defecto', () => {
  const vencimiento = calculateVencimientoFromConfeccion('2026-05-07T00:00:00.000Z');

  assert.equal(vencimiento.toISOString(), '2026-08-07T00:00:00.000Z');
});
