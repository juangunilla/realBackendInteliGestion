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

const controlEstiabsSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(controlEstiabsSchema);
controlEstiabsSchema.plugin(autopopulate);
controlEstiabsSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'el control de estiabs',
});

const controlEstiabsHistSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(controlEstiabsHistSchema);
controlEstiabsHistSchema.plugin(autopopulate);

const ControlEstiabs = mongoose.model(
  'controlEstiabs',
  controlEstiabsSchema
);
const ControlEstiabsHist = mongoose.model(
  'ControlEstiabsHist',
  controlEstiabsHistSchema
);

module.exports = { ControlEstiabs, ControlEstiabsHist };
