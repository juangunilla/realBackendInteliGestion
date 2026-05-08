const express = require('express');
const check = require('../middlewares/auth');
const {
  getPreferences,
  updatePreference,
} = require('../controllers/notificationPreferenceController');

const router = express.Router();

router.get('/', check.auth, getPreferences);
router.put('/:eventKey', check.auth, updatePreference);

module.exports = router;
