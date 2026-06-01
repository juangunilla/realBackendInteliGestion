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

const ddjjCancerigenosSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(ddjjCancerigenosSchema);
ddjjCancerigenosSchema.plugin(autopopulate);
ddjjCancerigenosSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'la DDJJ de cancerígenos',
});

const ddjjCancerigenosHistSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(ddjjCancerigenosHistSchema);
ddjjCancerigenosHistSchema.plugin(autopopulate);

const DdjjCancerigenos = mongoose.model(
  'ddjjCancerigenos',
  ddjjCancerigenosSchema
);
const DdjjCancerigenosHist = mongoose.model(
  'DdjjCancerigenosHist',
  ddjjCancerigenosHistSchema
);

module.exports = { DdjjCancerigenos, DdjjCancerigenosHist };
