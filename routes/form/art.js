const express = require('express');
const router = express.Router();
const check = require('../../middlewares/auth');
const { 
  getItems, 
  postItem, 
  updateItem, 
  deleteItem, 
  getHistorial, 
  getHistorialByClienteEst 
} = require('../../controllers/form/art');

// ----- ART activos -----
router.get('/', check.auth, getItems);             // Obtener todos los ART activos
router.post('/', check.auth, postItem);            // Crear un nuevo ART
router.put('/:_id', check.auth, updateItem);       // Actualizar un ART por ID
router.delete('/:_id', check.auth, deleteItem);    // Eliminar un ART por ID

// ----- Historial -----
router.get('/historial', check.auth, getHistorial); // Obtener todo el historial de ART
router.get(
  '/historial/:clienteId/:establecimientoId',
  check.auth,
  getHistorialByClienteEst
); // Historial filtrado por cliente y establecimiento

module.exports = router;
