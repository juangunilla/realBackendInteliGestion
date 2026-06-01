const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

// Esquema base (reutilizable)
const baseSchema = {
  cliente: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clientes',
    autopopulate: true,
  }],
  establecimiento: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'establecimientos',
    autopopulate: true,
  }],
  profesional: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profesionales',
    autopopulate: true,
  }],
  profesionalCargo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profesionales',
    autopopulate: true,
  }],

  fecha: {
    type: Date,
  },
  vencimiento: {
    type: Date,
  },
  estado: {
    type: String,
    enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Antiguo', 'Sin fecha'],
  },
  comentarios: {
    type: String,
  },
  // Datos de cotización
  cotizacion: {
    type: String,
  },
  fechaCotizacion: {
    type: Date,
  },
  estadoCotizacion: {
    type: String,
    enum: ['Pendiente', 'Aprobada', 'Rechazada', 'En proceso', ''],
  },
  incluido: {
    type: String,
  },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
};

// Modelo principal
const artSchema = new mongoose.Schema(baseSchema, { timestamps: true });
artSchema.plugin(autopopulate);
artSchema.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'el estudio ART' });

// Modelo historial (clonado + fecha de archivo)
const artHistSchema = new mongoose.Schema(
  { ...baseSchema, archivadoEn: { type: Date, default: Date.now } },
  { timestamps: true }
);
artHistSchema.plugin(autopopulate);

// Exporta ambos modelos
const Art = mongoose.model('Art', artSchema);
const ArtHist = mongoose.model('ArtHist', artHistSchema);

module.exports = { Art, ArtHist };
