const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');
const { setVencimiento } = require('../../middlewares/venci.');

const baseSchema = {
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
  profesional: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'profesionales',
      autopopulate: true,
    },
  ],
  confeccion: {
    type: Date,
  },
  vencimiento: {
    type: Date,
  },
  observacion: {
    type: String,
  },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
};

const ventilacionSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(ventilacionSchema);
ventilacionSchema.plugin(autopopulate);
ventilacionSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'la ventilación',
});

const ventilacionHistSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(ventilacionHistSchema);
ventilacionHistSchema.plugin(autopopulate);

const Ventilacion = mongoose.model('ventilacion', ventilacionSchema);
const VentilacionHist = mongoose.model(
  'VentilacionHist',
  ventilacionHistSchema
);

module.exports = { Ventilacion, VentilacionHist };
