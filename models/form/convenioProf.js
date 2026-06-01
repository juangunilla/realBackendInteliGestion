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

const convenioProfSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(convenioProfSchema);
convenioProfSchema.plugin(autopopulate);
convenioProfSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'el convenio profesional',
});

const convenioProfHistSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(convenioProfHistSchema);
convenioProfHistSchema.plugin(autopopulate);

const ConvenioProf = mongoose.model('convenioProf', convenioProfSchema);
const ConvenioProfHist = mongoose.model(
  'ConvenioProfHist',
  convenioProfHistSchema
);

module.exports = { ConvenioProf, ConvenioProfHist };
