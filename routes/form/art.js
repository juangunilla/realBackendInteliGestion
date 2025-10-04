const express = require('express');
const router = express.Router();
const { 
  getItems, 
  postItem, 
  updateItem, 
  deleteItem, 
  getHistorial, 
  getHistorialByClienteEst 
} = require('../../controllers/form/art');

// Activos
router.get('/', getItems);             // Obtener todos los ART activos
router.post('/', postItem);            // Crear un ART
router.put('/:_id', updateItem);       // Actualizar un ART por ID
router.delete('/:_id', deleteItem);    // Eliminar un ART por ID

// Historial
router.get('/historial', getHistorial);  // Obtener todo el historial de ART
router.get('/historial/:clienteId/:establecimientoId', getHistorialByClienteEst); // Historial filtrado

module.exports = router;
