const transporter = require('../config/mailer');
const User = require('../models/user');
const Profesional = require('../models/profesionales');
const {
  extractClienteNombre,
  extractEstablecimientoNombre,
  resolveNotificationUrl,
  sendPushToUsers,
} = require('./pushNotifications');

const normalizeReferenceIds = (value) => {
  const items = Array.isArray(value) ? value : value ? [value] : [];

  return [...new Set(items
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item._id) return `${item._id}`;
      return `${item}`;
    })
    .filter(Boolean))];
};

const getAddedProfessionalIds = (previous, current) => {
  const previousIds = new Set(normalizeReferenceIds(previous));
  return normalizeReferenceIds(current).filter((id) => !previousIds.has(id));
};

const getAssignmentField = (options = {}) => options.assignmentField || 'profesional';

const buildNotificationContent = (studyDoc, options = {}) => {
  const cliente = extractClienteNombre(studyDoc?.cliente);
  const establecimiento = extractEstablecimientoNombre(studyDoc?.establecimiento);
  const studyLabel = options.studyLabel || 'un estudio';

  const contextParts = [cliente, establecimiento].filter(Boolean);
  const contextSuffix = contextParts.length ? ` para ${contextParts.join(' - ')}` : '';

  return {
    title: 'Nuevo estudio asignado',
    message: `Se te asignó ${studyLabel}${contextSuffix}.`,
    url: resolveNotificationUrl(studyDoc),
    mailSubject: 'Nuevo estudio asignado',
    mailText: [
      'Se te asignó un estudio en Inteli Gestión.',
      cliente ? `Cliente: ${cliente}` : null,
      establecimiento ? `Establecimiento: ${establecimiento}` : null,
      studyDoc?._id ? `ID del estudio: ${studyDoc._id}` : null,
      '',
      `Acceso: ${resolveNotificationUrl(studyDoc)}`,
    ].filter(Boolean).join('\n'),
  };
};

const sendMailToRecipients = async (emails, payload) => {
  for (const email of emails) {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'gestionsepa@inteli.com.ar',
        to: email,
        subject: payload.mailSubject,
        text: payload.mailText,
      });
    } catch (error) {
      console.error(`No se pudo enviar el correo de asignación a ${email}:`, error.message);
    }
  }
};

const notifyStudyProfessionalAssignment = async ({
  model,
  studyId,
  previousProfessionals,
  options = {},
}) => {
  try {
    if (!studyId || !model) {
      return;
    }

    const assignmentField = getAssignmentField(options);

    const studyDoc = await model
      .findById(studyId)
      .populate('cliente establecimiento')
      .populate(assignmentField)
      .exec();

    if (!studyDoc) {
      return;
    }

    const addedProfessionalIds = getAddedProfessionalIds(
      previousProfessionals,
      studyDoc[assignmentField]
    );

    if (!addedProfessionalIds.length) {
      return;
    }

    const [users, professionals] = await Promise.all([
      User.find({ profesional: { $in: addedProfessionalIds } }),
      Profesional.find({ _id: { $in: addedProfessionalIds } }).lean(),
    ]);

    const payload = buildNotificationContent(studyDoc, options);
    await sendPushToUsers(users, payload, { realtimeEvent: 'study:assignment' });

    const emails = new Set();
    users.forEach((userDoc) => {
      if (userDoc?.correo) {
        emails.add(userDoc.correo.trim().toLowerCase());
      }
    });
    professionals.forEach((professional) => {
      if (professional?.correo) {
        emails.add(professional.correo.trim().toLowerCase());
      }
    });

    if (emails.size) {
      await sendMailToRecipients([...emails], payload);
    }
  } catch (error) {
    console.error('Falló la notificación de asignación del estudio:', error);
  }
};

const studyProfessionalAssignmentPlugin = (schema, options = {}) => {
  schema.pre('save', async function studyAssignmentPreSave(next) {
    const assignmentField = getAssignmentField(options);

    if (this.isNew) {
      this._previousProfessionalIds = [];
      return next();
    }

    if (!this.isModified(assignmentField)) {
      this._previousProfessionalIds = null;
      return next();
    }

    try {
      const previousDoc = await this.constructor
        .findById(this._id)
        .select(assignmentField)
        .lean();
      this._previousProfessionalIds = previousDoc?.[assignmentField] || [];
    } catch (error) {
      console.error('No se pudieron leer los profesionales previos del estudio:', error.message);
      this._previousProfessionalIds = [];
    }

    return next();
  });

  schema.post('save', async function studyAssignmentPostSave(doc) {
    const previousProfessionals = doc._previousProfessionalIds;
    if (!doc.isNew && previousProfessionals === null) {
      return;
    }

    await notifyStudyProfessionalAssignment({
      model: doc.constructor,
      studyId: doc._id,
      previousProfessionals: previousProfessionals || [],
      options,
    });
  });

  schema.pre('findOneAndUpdate', async function studyAssignmentPreUpdate(next) {
    const assignmentField = getAssignmentField(options);

    try {
      const previousDoc = await this.model
        .findOne(this.getQuery())
        .select(assignmentField)
        .lean();
      this._previousProfessionalIds = previousDoc?.[assignmentField] || [];
    } catch (error) {
      console.error('No se pudieron leer los profesionales previos del estudio:', error.message);
      this._previousProfessionalIds = [];
    }

    return next();
  });

  schema.post('findOneAndUpdate', async function studyAssignmentPostUpdate(doc) {
    if (!doc) {
      return;
    }

    await notifyStudyProfessionalAssignment({
      model: this.model,
      studyId: doc._id,
      previousProfessionals: this._previousProfessionalIds || [],
      options,
    });
  });
};

module.exports = {
  buildNotificationContent,
  getAddedProfessionalIds,
  normalizeReferenceIds,
  notifyStudyProfessionalAssignment,
  studyProfessionalAssignmentPlugin,
};
