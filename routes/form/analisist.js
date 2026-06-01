const express = require('express');
const router = express.Router();
const check = require('../../middlewares/auth');
const {
  getItems,
  postItem,
  updateItem,
  crearRevalidacionAnalisis,
  getHistorial,
  getHistorialByClienteEst
} = require('../../controllers/form/analisist');

// Estudios activos
router.get('/', check.auth, getItems);
router.post('/', check.auth, postItem);
router.put('/:_id', check.auth, updateItem);
router.post('/:id/revalidar', check.auth, crearRevalidacionAnalisis);

// Historial
router.get('/historial', check.auth, getHistorial);
router.get('/historial/:clienteId/:establecimientoId', check.auth, getHistorialByClienteEst);

module.exports = router;
