const express = require('express');
const router = express.Router();

const {
  getItems,
  postItem,
  updateItem,
  getHistorial,
  getHistorialByClienteEst
} = require('../../controllers/form/analisisDeRiesgo');

// =========================
// 📌 Estudios activos
// =========================

// Obtener todos
router.get('/', getItems);

// Crear nuevo
router.post('/', postItem);

// Actualizar por ID
router.put('/:_id', updateItem);


// =========================
// 📌 Historial
// =========================

// Obtener todo el historial
router.get('/historial', getHistorial);

// Obtener historial filtrado
router.get('/historial/:clienteId/:establecimientoId', getHistorialByClienteEst);


module.exports = router;