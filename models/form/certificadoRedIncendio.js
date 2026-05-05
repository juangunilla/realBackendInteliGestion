const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

const normalizeValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const normalizeDateValue = (value) => {
  const normalized = normalizeValue(value);

  if (normalized === null || normalized instanceof Date) {
    return normalized;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? normalized : parsed;
};

const normalizeSiNoValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? 'Si' : 'No';
  }

  if (typeof value === 'number') {
    if (value === 1) return 'Si';
    if (value === 0) return 'No';
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['si', 'sí', 'true', '1'].includes(normalized)) {
      return 'Si';
    }

    if (['no', 'false', '0'].includes(normalized)) {
      return 'No';
    }
  }

  return undefined;
};

const syncObservaciones = (data) => {
  const observacion = data.observacion || data.observaciones || data.comentarios || '';

  data.observacion = observacion;
  data.observaciones = observacion;
  data.comentarios = observacion;
};

const syncCotizado = (data) => {
  const normalizedFlag = normalizeSiNoValue(
    Object.prototype.hasOwnProperty.call(data, 'cotizado') ? data.cotizado : data.cotizacion
  );

  if (normalizedFlag !== undefined) {
    data.cotizado = normalizedFlag;
    data.cotizacion = normalizedFlag;
    return;
  }

  if (Object.prototype.hasOwnProperty.call(data, 'cotizado')) {
    data.cotizado = '';
  }

  if (Object.prototype.hasOwnProperty.call(data, 'cotizacion')) {
    data.cotizacion = normalizeValue(data.cotizacion) || '';
  }
};

const syncCertificadoRedIncendioFields = (target) => {
  if (!target || typeof target !== 'object') {
    return target;
  }

  const data = target;

  ['fechaDerivado', 'fechaRevision', 'fechaInforme', 'vencimiento'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = normalizeDateValue(data[field]);
    }
  });

  ['derivado', 'estado', 'observacion', 'observaciones', 'comentarios'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = normalizeValue(data[field]) || '';
    }
  });

  syncCotizado(data);
  syncObservaciones(data);

  return data;
};

const baseSchema = {
  cliente: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clientes',
    autopopulate: true,
  }],
  establecimiento: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'establecimientos',
    autopopulate: true,
  }],
  profesional: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profesionales',
    autopopulate: true,
  }],
  fechaDerivado: {
    type: Date,
    default: null,
  },
  derivado: {
    type: String,
    default: '',
    trim: true,
  },
  profesionalCargo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profesionales',
    autopopulate: true,
  }],
  fechaRevision: {
    type: Date,
    default: null,
  },
  fechaInforme: {
    type: Date,
    default: null,
  },
  vencimiento: {
    type: Date,
    default: null,
  },
  estado: {
    type: String,
    enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Antiguo', 'Sin fecha', ''],
    default: '',
  },
  cotizado: {
    type: String,
    enum: ['Si', 'No', ''],
    default: '',
  },
  cotizacion: {
    type: String,
    default: '',
    trim: true,
  },
  observacion: {
    type: String,
    default: '',
    trim: true,
  },
  observaciones: {
    type: String,
    default: '',
    trim: true,
  },
  comentarios: {
    type: String,
    default: '',
    trim: true,
  },
};

const certificadoRedIncendioSchema = new mongoose.Schema(
  baseSchema,
  {
    timestamps: true,
  }
);

certificadoRedIncendioSchema.pre(
  'validate',
  function certificadoRedIncendioPreValidate(next) {
    syncCertificadoRedIncendioFields(this);
    next();
  }
);

certificadoRedIncendioSchema.pre(
  'findOneAndUpdate',
  function certificadoRedIncendioPreUpdate(next) {
    const update = this.getUpdate() || {};
    const updatePayload = update.$set || update;

    syncCertificadoRedIncendioFields(updatePayload);

    if (update.$set) {
      update.$set = updatePayload;
    } else {
      Object.assign(update, updatePayload);
    }

    this.setUpdate(update);
    next();
  }
);

certificadoRedIncendioSchema.plugin(autopopulate);
certificadoRedIncendioSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'el Certificado de Red de Incendio',
});

const certificadoRedIncendioHistSchema = new mongoose.Schema(
  {
    ...baseSchema,
    archivadoEn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

certificadoRedIncendioHistSchema.pre(
  'validate',
  function certificadoRedIncendioHistPreValidate(next) {
    syncCertificadoRedIncendioFields(this);
    next();
  }
);

certificadoRedIncendioHistSchema.plugin(autopopulate);

const CertificadoRedIncendio =
  mongoose.models.CertificadoRedIncendio ||
  mongoose.model('CertificadoRedIncendio', certificadoRedIncendioSchema);
const CertificadoRedIncendioHist =
  mongoose.models.CertificadoRedIncendioHist ||
  mongoose.model('CertificadoRedIncendioHist', certificadoRedIncendioHistSchema);

module.exports = {
  CertificadoRedIncendio,
  CertificadoRedIncendioHist,
  syncCertificadoRedIncendioFields,
};
