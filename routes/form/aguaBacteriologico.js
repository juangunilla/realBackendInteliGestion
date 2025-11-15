const express = require('express');
const check = require('../../middlewares/auth');
const router = express.Router();
const { 
  getItems, 
  postItem, 
  updateItem, 
  getHistorial, 
  getHistorialByClienteEst 
} = require('../../controllers/form/aguaBacteriologico');

// Activos
router.get('/', check.auth, getItems);
router.post('/', check.auth, postItem);
router.put('/:_id', check.auth, updateItem);

// Historial
router.get('/historial', getHistorial); 
router.get('/historial/:clienteId/:establecimientoId', getHistorialByClienteEst);

module.exports = router;
