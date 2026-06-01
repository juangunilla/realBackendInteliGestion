const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

const referenceConfig = (collection) => ({
  type: mongoose.Schema.Types.ObjectId,
  ref: collection,
  autopopulate: true,
});

const capacitacionAutoelevadorRes96015Schema = new mongoose.Schema(
  {
    cliente: [referenceConfig('clientes')],
    establecimiento: [referenceConfig('establecimientos')],
    profesional: [referenceConfig('profesionales')],
    fechaDerivado: {
      type: Date,
      default: null,
    },
    fechaCapacitacion: {
      type: Date,
    },
    fechaCapacitacionAceptadaClienteAt: {
      type: Date,
      default: null,
    },
    fechaCapacitacionAceptadaClienteEmail: {
      type: String,
      trim: true,
      default: null,
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
      default: false,
    },
    entregaMaterialDidactico: {
      type: Boolean,
      default: false,
    },
    cantidadPersonasCap: {
      type: Number,
      min: 0,
      default: 0,
    },
    tiempoCapacitacion: {
      type: String,
      trim: true,
    },
    temas: {
      type: String,
      trim: true,
    },
    profesionalCapacitador: [referenceConfig('profesionales')],
    comentarios: {
      type: String,
      trim: true,
      default: '',
    },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
},
  { timestamps: true }
);

capacitacionAutoelevadorRes96015Schema.plugin(autopopulate);
capacitacionAutoelevadorRes96015Schema.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'la Capacitación Autoelevador Res. 960/15' });

const CapacitacionAutoelevadorRes96015 =
  mongoose.models.CapacitacionAutoelevadorRes96015 ||
  mongoose.model(
    'CapacitacionAutoelevadorRes96015',
    capacitacionAutoelevadorRes96015Schema
  );

const capacitacionAutoelevadorRes96015HistSchema =
  capacitacionAutoelevadorRes96015Schema.clone();
capacitacionAutoelevadorRes96015HistSchema.add({
  archivadoEn: { type: Date, default: Date.now },
});

const CapacitacionAutoelevadorRes96015Hist =
  mongoose.models.CapacitacionAutoelevadorRes96015Hist ||
  mongoose.model(
    'CapacitacionAutoelevadorRes96015Hist',
    capacitacionAutoelevadorRes96015HistSchema
  );

module.exports = {
  CapacitacionAutoelevadorRes96015,
  CapacitacionAutoelevadorRes96015Hist,
};
