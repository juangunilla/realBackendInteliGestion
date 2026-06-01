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

const certifMaqHerramSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(certifMaqHerramSchema);
certifMaqHerramSchema.plugin(autopopulate);
certifMaqHerramSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'la certificación de máquinas y herramientas',
});

const certifMaqHerramHistSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(certifMaqHerramHistSchema);
certifMaqHerramHistSchema.plugin(autopopulate);

const CertifMaqHerram = mongoose.model(
  'certifMaqHerram',
  certifMaqHerramSchema
);
const CertifMaqHerramHist = mongoose.model(
  'CertifMaqHerramHist',
  certifMaqHerramHistSchema
);

module.exports = { CertifMaqHerram, CertifMaqHerramHist };
