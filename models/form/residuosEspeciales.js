const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

const addTenYears = (value) => {
  if (!value) return null;

  const baseDate = new Date(value);
  if (Number.isNaN(baseDate.getTime())) return null;

  const vencimiento = new Date(baseDate);
  vencimiento.setFullYear(vencimiento.getFullYear() + 10);

  return vencimiento;
};

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

const syncObservaciones = (data) => {
  const observacion = data.observacion || data.observaciones || data.comentarios || '';

  data.observacion = observacion;
  data.observaciones = observacion;
  data.comentarios = observacion;
};

const syncResiduosEspecialesFields = (target) => {
  if (!target || typeof target !== 'object') {
    return target;
  }

  const data = target;

  ['fechaDerivado', 'fechaCotizacion', 'fechaEstudio', 'vencimiento', 'fechaVencimiento'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = normalizeDateValue(data[field]);
    }
  });

  ['derivado', 'cotizacion', 'estadoCotizacion', 'incluido', 'estado', 'observacion', 'observaciones', 'comentarios'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = normalizeValue(data[field]) || '';
    }
  });

  if (Object.prototype.hasOwnProperty.call(data, 'fechaVencimiento')) {
    data.vencimiento = data.fechaVencimiento;
    delete data.fechaVencimiento;
  }

  if (!data.vencimiento && data.fechaEstudio) {
    const vencimientoCalculado = addTenYears(data.fechaEstudio);
    if (vencimientoCalculado) {
      data.vencimiento = vencimientoCalculado;
    }
  }

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
  derivado: {
    type: String,
    default: '',
    trim: true,
  },
  profesional: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profesionales',
    autopopulate: true,
  }],
  fechaDerivado: {
    type: Date,
    default: null,
  },
  cotizacion: {
    type: String,
    default: '',
    trim: true,
  },
  fechaCotizacion: {
    type: Date,
    default: null,
  },
  estadoCotizacion: {
    type: String,
    enum: ['Pendiente', 'Aprobada', 'Rechazada', 'En proceso', ''],
    default: '',
  },
  incluido: {
    type: String,
    default: '',
    trim: true,
  },
  fechaEstudio: {
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

const residuosEspecialesSchema = new mongoose.Schema(
  baseSchema,
  {
    timestamps: true,
  }
);

residuosEspecialesSchema.pre('validate', function residuosEspecialesPreValidate(next) {
  syncResiduosEspecialesFields(this);
  next();
});

residuosEspecialesSchema.pre('findOneAndUpdate', function residuosEspecialesPreUpdate(next) {
  const update = this.getUpdate() || {};
  const updatePayload = update.$set || update;

  syncResiduosEspecialesFields(updatePayload);

  if (update.$set) {
    update.$set = updatePayload;
  } else {
    Object.assign(update, updatePayload);
  }

  this.setUpdate(update);
  next();
});

residuosEspecialesSchema.plugin(autopopulate);
residuosEspecialesSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'el estudio de Residuos Especiales',
});

const residuosEspecialesHistSchema = new mongoose.Schema(
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

residuosEspecialesHistSchema.pre('validate', function residuosEspecialesHistPreValidate(next) {
  syncResiduosEspecialesFields(this);
  next();
});

residuosEspecialesHistSchema.plugin(autopopulate);

const ResiduosEspeciales =
  mongoose.models.ResiduosEspeciales ||
  mongoose.model('ResiduosEspeciales', residuosEspecialesSchema);
const ResiduosEspecialesHist =
  mongoose.models.ResiduosEspecialesHist ||
  mongoose.model('ResiduosEspecialesHist', residuosEspecialesHistSchema);

module.exports = {
  ResiduosEspeciales,
  ResiduosEspecialesHist,
  syncResiduosEspecialesFields,
};
