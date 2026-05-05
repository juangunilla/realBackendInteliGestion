const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

const addOneYear = (value) => {
  if (!value) return null;

  const baseDate = new Date(value);
  if (Number.isNaN(baseDate.getTime())) return null;

  const vencimiento = new Date(baseDate);
  vencimiento.setFullYear(vencimiento.getFullYear() + 1);

  return vencimiento;
};

const normalizeValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const normalizeNumber = (value) => {
  const normalized = normalizeValue(value);

  if (normalized === null || typeof normalized === 'number') {
    return normalized;
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? normalized : parsed;
};

const syncTermografiaFields = (target) => {
  if (!target || typeof target !== 'object') {
    return target;
  }

  const data = target;

  if (Object.prototype.hasOwnProperty.call(data, 'fechaEmision')) {
    data.fechaEmision = normalizeValue(data.fechaEmision);
  }

  if (Object.prototype.hasOwnProperty.call(data, 'vencimiento')) {
    data.vencimiento = normalizeValue(data.vencimiento);
  }

  if (Object.prototype.hasOwnProperty.call(data, 'fechaVencimiento')) {
    data.vencimiento = normalizeValue(data.fechaVencimiento);
    delete data.fechaVencimiento;
  }

  if (Object.prototype.hasOwnProperty.call(data, 'numeroTableros')) {
    data.numeroTableros = normalizeNumber(data.numeroTableros);
  }

  if (data.fechaEmision) {
    const vencimientoCalculado = addOneYear(data.fechaEmision);
    if (vencimientoCalculado) {
      data.vencimiento = vencimientoCalculado;
    }
  }

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
  numeroTableros: {
    type: Number,
    default: null,
  },
  fechaEmision: {
    type: Date,
    default: null,
  },
  vencimiento: {
    type: Date,
    default: null,
  },
  observacion: {
    type: String,
    default: '',
    trim: true,
  },
  cotizacion: {
    type: String,
    default: '',
    trim: true,
  },
};

const termografiaSchema = new mongoose.Schema(
  baseSchema,
  {
    timestamps: true,
  }
);

termografiaSchema.pre('validate', function termografiaPreValidate(next) {
  syncTermografiaFields(this);
  next();
});

termografiaSchema.pre('findOneAndUpdate', function termografiaPreUpdate(next) {
  const update = this.getUpdate() || {};
  const updatePayload = update.$set || update;

  syncTermografiaFields(updatePayload);

  if (update.$set) {
    update.$set = updatePayload;
  } else {
    Object.assign(update, updatePayload);
  }

  this.setUpdate(update);
  next();
});

termografiaSchema.plugin(autopopulate);

const termografiaHistSchema = new mongoose.Schema(
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

termografiaHistSchema.pre('validate', function termografiaHistPreValidate(next) {
  syncTermografiaFields(this);
  next();
});

termografiaHistSchema.plugin(autopopulate);

const Termografia =
  mongoose.models.termografia || mongoose.model('termografia', termografiaSchema);
const TermografiaHist =
  mongoose.models.TermografiaHist || mongoose.model('TermografiaHist', termografiaHistSchema);

module.exports = {
  Termografia,
  TermografiaHist,
  syncTermografiaFields,
};
