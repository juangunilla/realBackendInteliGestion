const test = require('node:test');
const assert = require('node:assert/strict');

const auth = require('../middlewares/auth');
const { formEditAccess } = require('../middlewares/formEditAccess');

const createRes = () => {
  const res = {
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
  };

  return res;
};

test('formEditAccess no exige auth para GET', async () => {
  const req = { method: 'GET' };
  const res = createRes();

  let authCalled = false;
  const originalAuth = auth.auth;
  auth.auth = () => {
    authCalled = true;
  };

  let nextCalled = false;
  try {
    formEditAccess(req, res, () => {
      nextCalled = true;
    });
  } finally {
    auth.auth = originalAuth;
  }

  assert.equal(authCalled, false);
  assert.equal(nextCalled, true);
});

test('formEditAccess permite POST a cualquier usuario autenticado', async () => {
  const req = { method: 'POST', user: null };
  const res = createRes();

  const originalAuth = auth.auth;
  auth.auth = (request, response, next) => {
    request.user = { rol: 'profe' };
    next();
  };

  let nextCalled = false;
  try {
    formEditAccess(req, res, () => {
      nextCalled = true;
    });
  } finally {
    auth.auth = originalAuth;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
});

test('formEditAccess delega en auth el bloqueo de POST sin autenticar', async () => {
  const req = { method: 'POST', user: null };
  const res = createRes();

  const originalAuth = auth.auth;
  auth.auth = (request, response, next) => {
    response.status(401).json({
      status: 'error',
      message: 'La petición no tiene la cabecera de autenticación',
    });
  };

  let nextCalled = false;
  try {
    formEditAccess(req, res, () => {
      nextCalled = true;
    });
  } finally {
    auth.auth = originalAuth;
  }

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    status: 'error',
    message: 'La petición no tiene la cabecera de autenticación',
  });
});
