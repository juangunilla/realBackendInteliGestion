const test = require('node:test');
const assert = require('node:assert/strict');

const controllerPath = require.resolve('../controllers/form/aspHidraulica');
const {
  AspHidraulica,
  getAspHidraulicaDateOrderError,
} = require('../models/form/aspHidraulica');

const originalFindById = AspHidraulica.findById;
const originalFindByIdAndUpdate = AspHidraulica.findByIdAndUpdate;

const loadController = () => {
  delete require.cache[controllerPath];
  return require('../controllers/form/aspHidraulica');
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
  AspHidraulica.findById = originalFindById;
  AspHidraulica.findByIdAndUpdate = originalFindByIdAndUpdate;
  delete require.cache[controllerPath];
});

test('getAspHidraulicaDateOrderError permite que la fecha de estudio sea posterior', () => {
  const errorMessage = getAspHidraulicaDateOrderError({
    fechaMedicion: '2026-04-10',
    fechaEstudio: '2026-04-12',
  });

  assert.equal(errorMessage, null);
});

test('AspHidraulica invalida fecha de estudio anterior a la medicion', async () => {
  const doc = new AspHidraulica({
    cliente: [],
    establecimiento: [],
    fechaMedicion: '2026-04-10',
    fechaEstudio: '2026-04-09',
  });

  await assert.rejects(
    doc.validate(),
    (error) => {
      assert.equal(error.name, 'ValidationError');
      assert.equal(
        error.errors.fechaEstudio.message,
        'La fecha del estudio no puede ser anterior a la fecha de medición'
      );
      return true;
    }
  );
});

test('updateItem permite guardar una fecha de estudio posterior a la medicion existente', async () => {
  AspHidraulica.findById = async () => ({
    _id: 'asp-1',
    toObject: () => ({
      fechaMedicion: new Date('2026-04-10T00:00:00.000Z'),
    }),
  });

  let receivedOptions = null;
  AspHidraulica.findByIdAndUpdate = async (_id, update, options) => {
    receivedOptions = options;
    return { _id, ...update };
  };

  const { updateItem } = loadController();
  const req = {
    params: { _id: 'asp-1' },
    body: { fechaEstudio: '2026-04-12' },
  };
  const res = createResponseMock();

  await updateItem(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'success');
  assert.equal(receivedOptions.runValidators, true);
});

test('updateItem rechaza una fecha de estudio anterior a la medicion existente', async () => {
  AspHidraulica.findById = async () => ({
    _id: 'asp-1',
    toObject: () => ({
      fechaMedicion: new Date('2026-04-10T00:00:00.000Z'),
    }),
  });

  let updateCalled = false;
  AspHidraulica.findByIdAndUpdate = async () => {
    updateCalled = true;
    return null;
  };

  const { updateItem } = loadController();
  const req = {
    params: { _id: 'asp-1' },
    body: { fechaEstudio: '2026-04-05' },
  };
  const res = createResponseMock();

  await updateItem(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    status: 'error',
    message: 'La fecha del estudio no puede ser anterior a la fecha de medición',
  });
  assert.equal(updateCalled, false);
});
