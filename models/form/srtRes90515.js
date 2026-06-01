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
  cotizacion: {
    type: String,
  },
  fechaCotizacion: {
    type: Date,
  },
  estadoCotizacion: {
    type: String,
  },
  incluido: {
    type: String,
  },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
};

const srtRes90515Schema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(srtRes90515Schema);
srtRes90515Schema.plugin(autopopulate);
srtRes90515Schema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'la SRT Res. 905/15',
});

const srtRes90515HistSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(srtRes90515HistSchema);
srtRes90515HistSchema.plugin(autopopulate);

const SrtRes90515 = mongoose.model('srtRes90515', srtRes90515Schema);
const SrtRes90515Hist = mongoose.model(
  'SrtRes90515Hist',
  srtRes90515HistSchema
);

module.exports = { SrtRes90515, SrtRes90515Hist };
