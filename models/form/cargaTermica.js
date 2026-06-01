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

const cargaTermicaSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(cargaTermicaSchema);
cargaTermicaSchema.plugin(autopopulate);
cargaTermicaSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'la carga térmica',
});

const cargaTermicaHistSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(cargaTermicaHistSchema);
cargaTermicaHistSchema.plugin(autopopulate);

const CargaTermica = mongoose.model('cargaTermica', cargaTermicaSchema);
const CargaTermicaHist = mongoose.model(
  'CargaTermicaHist',
  cargaTermicaHistSchema
);

module.exports = { CargaTermica, CargaTermicaHist };
