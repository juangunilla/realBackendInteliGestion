const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/dbInfo'); // Ajusta la ruta según tu estructura

// Ruta para obtener información sobre la base de datos
router.get('/', databaseController.getDatabaseInfo);

// Resto de tus rutas y configuración aquí

module.exports = router;
