const express = require('express');
const router = express.Router();
const check = require('../../middlewares/auth');

const { getItems, postItem, updateItem, deleteItem, getHistorial, getHistorialByClienteEst } = require('../../controllers/form/aspCanerias');

// Activos
router.get('/', check.auth, getItems);
router.post('/', check.auth, postItem);
router.put('/:_id', check.auth, updateItem);
router.delete('/:_id', check.auth, deleteItem);

// Historial
router.get('/historial', check.auth, getHistorial);
router.get('/historial/:clienteId/:establecimientoId', check.auth, getHistorialByClienteEst);

module.exports = router;
