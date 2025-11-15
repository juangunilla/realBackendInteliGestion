const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

// Esquema base reutilizable
const aspBase = {
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

  derivado: {
    type: String,
  },
  profesional: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profesionales',
    autopopulate: true,
  }],
  fechaDerivado: {
    type: Date,
  },
  profesionalCargo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profesionales',
    autopopulate: true,
  }],

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

  tipo: {
    type: String,
  },
  otro: {
    type: String,
  },
  tipoEstudio: {
    type: String,
    enum: ['Ensayo periódico anual', 'Prueba hidráulica'],
  },
  litros: {
    type: Number,
  },
  opds: {
    type: String,
    enum: ['si', 'no'],
  },
  fechaMed: {
    type: Date,
  },
  vencimiento: {
    type: Date,
  },
  estado: {
    type: String,
    enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Antiguo', 'Sin fecha'],
  },
  entrega: {
    type: String,
    enum: ['Si', 'No'],
  },
  observacion: {
    type: String,
  },
};

// Esquema principal
const aspSchema = new mongoose.Schema(aspBase, { timestamps: true });
aspSchema.plugin(autopopulate);

// Esquema historial
const aspHistSchema = new mongoose.Schema(
  { ...aspBase, archivadoEn: { type: Date, default: Date.now } },
  { timestamps: true }
);
aspHistSchema.plugin(autopopulate);

// Exporta ambos modelos
const Asp = mongoose.model('Asp', aspSchema);
const AspHist = mongoose.model('AspHist', aspHistSchema);

module.exports = { Asp, AspHist };
