const { DateTime } = require('luxon');
const User = require('../models/user');
const {
  getStudyAssignmentField,
  getStudyDateFields,
  resolveStudyDueDate,
  studyConfigs,
} = require('./studyRegistry');
const {
  DEFAULT_NOTIFICATION_URL,
  extractClienteNombre,
  extractEstablecimientoNombre,
  resolveNotificationUrl,
  sendPushToUser,
} = require('./pushNotifications');

const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || 'America/Argentina/Buenos_Aires';

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

const toDateTime = (value, zone = DEFAULT_TIMEZONE) => {
  if (!value) {
    return null;
  }

  if (DateTime.isDateTime(value)) {
    return value.setZone(zone);
  }

  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone });
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return DateTime.fromJSDate(parsed, { zone });
};

const getDayWindow = (referenceDate = DateTime.now(), zone = DEFAULT_TIMEZONE) => {
  const dateTime = toDateTime(referenceDate, zone) || DateTime.now().setZone(zone);

  return {
    start: dateTime.startOf('day'),
    end: dateTime.endOf('day'),
  };
};

const isDateWithinWindow = (value, window) => {
  const candidate = toDateTime(value, window.start.zoneName);

  return Boolean(
    candidate &&
    candidate.isValid &&
    candidate.toMillis() >= window.start.toMillis() &&
    candidate.toMillis() <= window.end.toMillis()
  );
};

const buildDueTodayQuery = (config, window) => {
  const dateFields = getStudyDateFields(config);

  if (!dateFields.length) {
    return null;
  }

  return {
    $or: dateFields.map((field) => ({
      [field]: {
        $gte: window.start.toJSDate(),
        $lte: window.end.toJSDate(),
      },
    })),
  };
};

const getAssignedProfessionalIds = (doc, config = {}) =>
  normalizeReferenceIds(doc?.[getStudyAssignmentField(config)]);

const sortEntries = (entries = []) =>
  [...entries].sort((left, right) => {
    const leftTime = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return left.tipo.localeCompare(right.tipo, 'es');
  });

const buildStudyContext = (entry) => {
  const parts = [entry.cliente, entry.establecimiento].filter(Boolean);
  return parts.length ? `${entry.tipo} para ${parts.join(' - ')}` : entry.tipo;
};

const buildDueTodayNotificationContent = (entries = []) => {
  const sortedEntries = sortEntries(entries);
  const firstEntry = sortedEntries[0];

  if (!firstEntry) {
    return {
      title: 'Vencimientos de hoy',
      message: 'Tenés estudios con vencimiento hoy.',
      url: DEFAULT_NOTIFICATION_URL,
    };
  }

  if (sortedEntries.length === 1) {
    return {
      title: 'Vencimiento de hoy',
      message: `Hoy vence ${buildStudyContext(firstEntry)}.`,
      url: firstEntry.url || DEFAULT_NOTIFICATION_URL,
    };
  }

  return {
    title: 'Vencimientos de hoy',
    message: `Hoy vencen ${sortedEntries.length} estudios. Primero: ${buildStudyContext(firstEntry)}.`,
    url: firstEntry.url || DEFAULT_NOTIFICATION_URL,
  };
};

const buildStudyEntry = (config, doc) => ({
  studyId: `${doc._id}`,
  tipo: config.label,
  dueDate: resolveStudyDueDate(config, doc),
  url: resolveNotificationUrl(doc),
  cliente: extractClienteNombre(doc?.cliente),
  establecimiento: extractEstablecimientoNombre(doc?.establecimiento),
  assignmentIds: getAssignedProfessionalIds(doc, config),
});

const dedupeEntriesByStudy = (entries = []) => {
  const seen = new Set();

  return entries.filter((entry) => {
    if (!entry?.studyId || seen.has(entry.studyId)) {
      return false;
    }

    seen.add(entry.studyId);
    return true;
  });
};

const findStudiesDueOnDate = async ({ referenceDate = DateTime.now(), zone = DEFAULT_TIMEZONE } = {}) => {
  const window = getDayWindow(referenceDate, zone);
  const dueEntries = [];

  for (const config of studyConfigs) {
    if (typeof config.model?.find !== 'function') {
      continue;
    }

    const query = buildDueTodayQuery(config, window);
    if (!query) {
      continue;
    }

    const docs = await config.model
      .find(query)
      .populate('cliente establecimiento')
      .lean();

    for (const doc of docs) {
      if (!isDateWithinWindow(resolveStudyDueDate(config, doc), window)) {
        continue;
      }

      const entry = buildStudyEntry(config, doc);
      if (!entry.assignmentIds.length) {
        continue;
      }

      dueEntries.push(entry);
    }
  }

  return {
    window,
    dueEntries,
  };
};

const sendDueTodayNotifications = async ({ referenceDate = DateTime.now(), zone = DEFAULT_TIMEZONE } = {}) => {
  const { window, dueEntries } = await findStudiesDueOnDate({ referenceDate, zone });

  if (!dueEntries.length) {
    return {
      window,
      studies: 0,
      notifiedUsers: 0,
    };
  }

  const assignedProfessionalIds = [...new Set(dueEntries.flatMap((entry) => entry.assignmentIds))];
  const users = await User.find({
    profesional: { $in: assignedProfessionalIds },
  }).select('nombreyapellido correo profesional pushSubscriptions');

  let notifiedUsers = 0;

  for (const userDoc of users) {
    const professionalIds = normalizeReferenceIds(userDoc.profesional);
    const userEntries = dedupeEntriesByStudy(
      dueEntries.filter((entry) =>
        entry.assignmentIds.some((assignmentId) => professionalIds.includes(assignmentId))
      )
    );

    if (!userEntries.length) {
      continue;
    }

    const payload = buildDueTodayNotificationContent(userEntries);
    await sendPushToUser(userDoc, payload, { realtimeEvent: 'study:dueToday' });
    notifiedUsers += 1;
  }

  return {
    window,
    studies: dueEntries.length,
    notifiedUsers,
  };
};

module.exports = {
  buildDueTodayNotificationContent,
  findStudiesDueOnDate,
  getAssignedProfessionalIds,
  getDayWindow,
  isDateWithinWindow,
  sendDueTodayNotifications,
};
