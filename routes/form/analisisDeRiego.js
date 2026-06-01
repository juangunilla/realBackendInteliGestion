const express = require('express');
const router = express.Router();
const check = require('../../middlewares/auth');

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
router.get('/', check.auth, getItems);

// Crear nuevo
router.post('/', check.auth, postItem);

// Actualizar por ID
router.put('/:_id', check.auth, updateItem);


// =========================
// 📌 Historial
// =========================

// Obtener todo el historial
router.get('/historial', check.auth, getHistorial);

// Obtener historial filtrado
router.get('/historial/:clienteId/:establecimientoId', check.auth, getHistorialByClienteEst);


module.exports = router;
