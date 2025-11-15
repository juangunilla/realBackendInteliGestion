const express = require('express');
const router = express.Router();

const { getItems, postItem, updateItem, deleteItem, getHistorial, getHistorialByClienteEst } = require('../../controllers/form/aspCanerias');

// Activos
router.get('/', getItems);
router.post('/', postItem);
router.put('/:_id', updateItem);
router.delete('/:_id', deleteItem);

// Historial
router.get('/historial', getHistorial);
router.get('/historial/:clienteId/:establecimientoId', getHistorialByClienteEst);

module.exports = router;
