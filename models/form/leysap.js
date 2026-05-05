const mongoose = require('mongoose');

const addYearsMinusOneDay = (value, years) => {
  if (!value) return undefined;

  const baseDate = new Date(value);
  if (Number.isNaN(baseDate.getTime())) return undefined;

  const result = new Date(baseDate);
  result.setFullYear(result.getFullYear() + years);
  result.setDate(result.getDate() - 1);

  return result;
};

const syncSapFields = (target) => {
  if (!target || typeof target !== 'object') return target;

  const data = target;

  if (data.expediente && !data.nexpediente) {
    data.nexpediente = data.expediente;
  }
  if (data.nexpediente && !data.expediente) {
    data.expediente = data.nexpediente;
  }

  if (data.fechaDisposicionAprobado && !data.aprobacion) {
    data.aprobacion = data.fechaDisposicionAprobado;
  }
  if (data.aprobacion && !data.fechaDisposicionAprobado) {
    data.fechaDisposicionAprobado = data.aprobacion;
  }

  if (data.comentarios && !data.observacion) {
    data.observacion = data.comentarios;
  }
  if (data.observacion && !data.comentarios) {
    data.comentarios = data.observacion;
  }

  const fechaBase = data.fechaDisposicionAprobado || data.aprobacion;
  const fechaExtensionSap = addYearsMinusOneDay(fechaBase, 1);
  const fechaVencimiento = addYearsMinusOneDay(fechaBase, 2);

  if (fechaExtensionSap) {
    data.fechaExtensionSap = fechaExtensionSap;
  }

  if (fechaVencimiento) {
    data.fechaVencimiento = fechaVencimiento;
    data.vencimiento = fechaVencimiento;
  }

  return data;
};

const leysapSchema = new mongoose.Schema(
  {
    cliente: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clientes',
        autopopulate: true,
      },
    ],
    establecimiento: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'establecimientos',
        autopopulate: true,
      },
    ],
    expediente: {
      type: String,
      trim: true,
    },
    nexpediente: {
      type: String,
      trim: true,
    },
    fechaDisposicionAprobado: {
      type: Date,
    },
    aprobacion: {
      type: Date,
    },
    fechaExtensionSap: {
      type: Date,
    },
    fechaVencimiento: {
      type: Date,
    },
    vencimiento: {
      type: Date,
    },
    admiteRevalida: {
      type: String,
      enum: ['si', 'no', ''],
      default: '',
    },
    primerSimulacroFecha: {
      type: Date,
    },
    segundoSimulacroFecha: {
      type: Date,
    },
    comentarios: {
      type: String,
      trim: true,
    },
    observacion: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

leysapSchema.pre('validate', function sapPreValidate(next) {
  syncSapFields(this);
  next();
});

leysapSchema.pre('findOneAndUpdate', function sapPreUpdate(next) {
  const update = this.getUpdate() || {};
  const updatePayload = update.$set || update;

  syncSapFields(updatePayload);

  if (update.$set) {
    update.$set = updatePayload;
  } else {
    Object.assign(update, updatePayload);
  }

  this.setUpdate(update);
  next();
});

leysapSchema.plugin(require('mongoose-autopopulate'));

const leysap = mongoose.models.leysap || mongoose.model('leysap', leysapSchema);

module.exports = leysap;
