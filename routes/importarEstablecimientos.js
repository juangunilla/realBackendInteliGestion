const express = require('express');
const router = express.Router();
const check = require('../middlewares/auth');
const { importarEstablecimientos } = require('../controllers/importarEstablecimientos');

router.post('/importar-establecimientos', check.auth, importarEstablecimientos);

module.exports = router;
