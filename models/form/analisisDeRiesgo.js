const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');
const { setVencimiento } = require('../../middlewares/venci.');

// Esquema base reutilizable
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
  checklist: {
    mapa: {
      type: Boolean,
      default: false,
    },
    rar: {
      type: Boolean,
      default: false,
    },
    matriz: {
      type: Boolean,
      default: false,
    },
  },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
};

// Esquema principal
const analisisDeRiesgoSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(analisisDeRiesgoSchema);
analisisDeRiesgoSchema.plugin(autopopulate);
analisisDeRiesgoSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'el análisis de riesgo',
});

// Esquema historial
const analisisHistSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});

setVencimiento(analisisHistSchema);
analisisHistSchema.plugin(autopopulate);

// Modelos
const AnalisisDeRiesgo = mongoose.model(
  'analisisDeRiesgo',
  analisisDeRiesgoSchema
);

const AnalisisDeRiesgoHist = mongoose.model(
  'AnalisisDeRiesgoHist',
  analisisHistSchema
);

module.exports = { AnalisisDeRiesgo, AnalisisDeRiesgoHist };
