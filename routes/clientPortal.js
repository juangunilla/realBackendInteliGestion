const express = require('express');
const {
  acceptStudyScheduledDate,
  getClientes,
  getEstablecimientos,
  getStudies,
  getStudiesSummary,
  login,
  me,
} = require('../controllers/clientPortal');
const { clientPortalAuth } = require('../middlewares/clientPortalAuth');
const { scopeClientAccess } = require('../middlewares/clientPortalScope');

const router = express.Router();

router.post('/auth/login', login);

router.use(clientPortalAuth, scopeClientAccess);

router.get('/auth/me', me);
router.get('/clientes', getClientes);
router.get('/establecimientos', getEstablecimientos);
router.get('/studies/summary', getStudiesSummary);
router.get('/studies', getStudies);
router.post('/studies/:studyType/:studyId/accept-scheduled-date', acceptStudyScheduledDate);

module.exports = router;
