const express = require('express');
const router = express.Router();
const { listAuditLogs, getAuditByEntity } = require('../controllers/auditLogs');
const check = require('../middlewares/auth');
const { requireSuperAdminRole } = require('../middlewares/superAdmin');

router.get('/entity/:entity/:entityId', check.auth, getAuditByEntity);
router.get('/', check.auth, requireSuperAdminRole, listAuditLogs);

module.exports = router;
