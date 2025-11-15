const express = require('express');
const router = express.Router();
const {
  getItems,
  postItem,
  updateItem,
  getHistorial,
  getHistorialByClienteEst
} = require('../../controllers/form/analisist');

// Estudios activos
router.get('/', getItems);
router.post('/', postItem);
router.put('/:_id', updateItem);

// Historial
router.get('/historial', getHistorial);
router.get('/historial/:clienteId/:establecimientoId', getHistorialByClienteEst);

module.exports = router;
