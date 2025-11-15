const express = require('express');
const router = express.Router();
const check = require('../middlewares/auth');
const { getMessages, postMessage, getStudyTypes, searchStudies, listUsers } = require('../controllers/chat');

router.get('/', check.auth, getMessages);
router.post('/', check.auth, postMessage);
router.get('/study-types', check.auth, getStudyTypes);
router.get('/studies/search', check.auth, searchStudies);
router.get('/users', check.auth, listUsers);

module.exports = router;
