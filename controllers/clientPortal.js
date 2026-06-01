const bcrypt = require('bcrypt');
const ClientPortalAccount = require('../models/clientPortalAccount');
const Clientes = require('../models/clientes');
const Establecimientos = require('../models/establecimientos');
const { createClientPortalToken } = require('../services/clientPortalJwt');
const { buildScopedStudyQuery, buildStudiesSummary, listScopedStudies } = require('../helpers/clientPortalStudies');
const { getStudyConfig, getStudyScheduledDateFields } = require('../helpers/studyRegistry');

const sanitizeAccount = (account) => ({
  id: `${account._id}`,
  email: account.email,
  active: account.active,
  contactName: account.contactName,
  clienteIds: (account.clienteIds || []).map((id) => `${id}`),
  allowedEstablecimientoIds: (account.allowedEstablecimientoIds || []).map((id) => `${id}`),
  permissions: account.permissions || {},
  lastLoginAt: account.lastLoginAt || null,
  createdAt: account.createdAt || null,
  updatedAt: account.updatedAt || null,
});

const login = async (req, res) => {
  try {
    const email = (req.body?.email || '').toString().trim().toLowerCase();
    const password = req.body?.password || '';

    if (!email || !password) {
      return res.status(400).send({
        status: 'error',
        message: 'Email y contraseña son obligatorios.',
      });
    }

    const account = await ClientPortalAccount.findOne({ email });
    if (!account || account.active !== true) {
      return res.status(401).send({
        status: 'error',
        message: 'Credenciales inválidas.',
      });
    }

    const matches = await bcrypt.compare(password, account.passwordHash);
    if (!matches) {
      return res.status(401).send({
        status: 'error',
        message: 'Credenciales inválidas.',
      });
    }

    account.lastLoginAt = new Date();
    await account.save();

    return res.status(200).send({
      status: 'success',
      token: createClientPortalToken(account),
      account: sanitizeAccount(account),
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'No se pudo iniciar sesión en el portal.',
      error: error.message,
    });
  }
};

const me = async (req, res) =>
  res.status(200).send({
    status: 'success',
    account: sanitizeAccount(req.clientPortalAccount),
    scope: req.portalScope,
  });

const getClientes = async (req, res) => {
  try {
    const { clienteIdsPermitidos = [] } = req.portalScope || {};
    const data = await Clientes.find({ _id: { $in: clienteIdsPermitidos } })
      .populate('establecimientos._id')
      .lean();

    return res.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'No se pudieron obtener los clientes del portal.',
      error: error.message,
    });
  }
};

const getEstablecimientos = async (req, res) => {
  try {
    const { establecimientoIdsPermitidos = [] } = req.portalScope || {};
    const data = await Establecimientos.find({ _id: { $in: establecimientoIdsPermitidos } }).lean();

    return res.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'No se pudieron obtener los establecimientos del portal.',
      error: error.message,
    });
  }
};

const getStudies = async (req, res) => {
  try {
    if (req.clientPortalAccount?.permissions?.canViewStudies === false) {
      return res.status(403).send({
        status: 'error',
        message: 'La cuenta no tiene permiso para ver estudios.',
      });
    }

    const data = await listScopedStudies(req.portalScope);
    return res.status(200).send({
      status: 'success',
      total: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'No se pudieron obtener los estudios del portal.',
      error: error.message,
    });
  }
};

const getStudiesSummary = async (req, res) => {
  try {
    if (req.clientPortalAccount?.permissions?.canViewStudies === false) {
      return res.status(403).send({
        status: 'error',
        message: 'La cuenta no tiene permiso para ver estudios.',
      });
    }

    const studies = await listScopedStudies(req.portalScope);
    return res.status(200).send({
      status: 'success',
      data: buildStudiesSummary(studies),
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'No se pudo obtener el resumen de estudios del portal.',
      error: error.message,
    });
  }
};

const acceptStudyScheduledDate = async (req, res) => {
  try {
    if (req.clientPortalAccount?.permissions?.canViewStudies === false) {
      return res.status(403).send({
        status: 'error',
        message: 'La cuenta no tiene permiso para confirmar fechas.',
      });
    }

    const { studyType, studyId } = req.params;
    const config = getStudyConfig(studyType);
    if (!config?.model) {
      return res.status(404).send({
        status: 'error',
        message: 'Tipo de estudio no reconocido.',
      });
    }

    const query = {
      _id: studyId,
      ...buildScopedStudyQuery(req.portalScope || {}),
    };

    const study = await config.model.findOne(query);
    if (!study) {
      return res.status(404).send({
        status: 'error',
        message: 'No se encontró el estudio dentro del alcance del portal.',
      });
    }

    const scheduledDateFields = getStudyScheduledDateFields(config);
    const scheduledDateField = scheduledDateFields.find((field) => Boolean(study[field]));

    if (!scheduledDateField) {
      return res.status(400).send({
        status: 'error',
        message: 'Este estudio no tiene una fecha programada para confirmar.',
      });
    }

    const acceptedAtField =
      scheduledDateField === 'fechaCapacitacion'
        ? 'fechaCapacitacionAceptadaClienteAt'
        : 'fechaMuestraAceptadaClienteAt';
    const acceptedEmailField =
      scheduledDateField === 'fechaCapacitacion'
        ? 'fechaCapacitacionAceptadaClienteEmail'
        : 'fechaMuestraAceptadaClienteEmail';

    study[acceptedAtField] = new Date();
    study[acceptedEmailField] = req.clientPortalAccount?.email || null;
    await study.save();

    return res.status(200).send({
      status: 'success',
      message: 'La fecha programada quedó confirmada.',
      data: {
        id: `${study._id}`,
        scheduledDateField,
        scheduledDate: study[scheduledDateField],
        fechaMuestraAceptadaClienteAt: study[acceptedAtField],
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'No se pudo confirmar la fecha programada.',
      error: error.message,
    });
  }
};

module.exports = {
  acceptStudyScheduledDate,
  getClientes,
  getEstablecimientos,
  getStudies,
  getStudiesSummary,
  login,
  me,
};
