const express = require('express');
const router = express.Router();
const { getItem } = require('../services/health');

router.get('/', getItem);

module.exports = router;
