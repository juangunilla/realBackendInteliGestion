const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

const referenceConfig = (collection) => ({
  type: mongoose.Schema.Types.ObjectId,
  ref: collection,
  autopopulate: true,
});

const capacitacionRiesgoEspecificoSchema = new mongoose.Schema(
  {
    cliente: [referenceConfig('clientes')],
    establecimiento: [referenceConfig('establecimientos')],
    profesional: [referenceConfig('profesionales')],
    profesionalCapacitador: [referenceConfig('profesionales')],
    fechaCapacitacion: {
      type: Date,
    },
    vencimientoCapacitacion: {
      type: Date,
    },
    estadoVigencia: {
      type: String,
      enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Sin estado'],
      default: 'Vigente',
    },
    entregaProcedimientos: {
      type: Boolean,
    },
    entregaMaterialDidactico: {
      type: Boolean,
    },
    tiempoCapacitacion: {
      type: String,
    },
    temas: {
      type: String,
    },
    comentarios: {
      type: String,
    },
    cotizacion: {
      type: String,
    },
    fechaCotizacion: {
      type: Date,
    },
    estadoCotizacion: {
      type: String,
      enum: ['Aceptado', 'Rechazado', 'Baja', 'Postergado', 'Pendiente', ''],
      default: '',
    },
    incluido: {
      type: String,
    },
  },
  { timestamps: true }
);

capacitacionRiesgoEspecificoSchema.plugin(autopopulate);

const CapacitacionRiesgoEspecifico = mongoose.model(
  'CapacitacionRiesgoEspecifico',
  capacitacionRiesgoEspecificoSchema
);

const capacitacionRiesgoEspecificoHistSchema =
  capacitacionRiesgoEspecificoSchema.clone();
capacitacionRiesgoEspecificoHistSchema.add({
  archivadoEn: { type: Date, default: Date.now },
});

const CapacitacionRiesgoEspecificoHist = mongoose.model(
  'CapacitacionRiesgoEspecificoHist',
  capacitacionRiesgoEspecificoHistSchema
);

module.exports = {
  CapacitacionRiesgoEspecifico,
  CapacitacionRiesgoEspecificoHist,
};
