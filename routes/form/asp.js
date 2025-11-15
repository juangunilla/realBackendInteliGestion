const express = require('express');
const router = express.Router();

const { 
  getItems, 
  postItem, 
  updateItem, 
  deleteItem, 
  getHistorial, 
  getHistorialByClienteEst 
} = require('../../controllers/form/asp');

// ----- ASP activos -----
router.get('/', getItems);             // Obtener todos los ASP activos
router.post('/', postItem);            // Crear un nuevo ASP
router.put('/:_id', updateItem);       // Actualizar un ASP por ID
router.delete('/:_id', deleteItem);    // Eliminar un ASP por ID

// ----- Historial -----
router.get('/historial', getHistorial); // Obtener todo el historial de ASP
router.get(
  '/historial/:clienteId/:establecimientoId',
  getHistorialByClienteEst
); // Historial filtrado por cliente y establecimiento

module.exports = router;
