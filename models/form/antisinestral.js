const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

// Esquema base (reutilizable)
const baseSchema = {
  // Datos del cliente
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

  // Datos del profesional derivado
  profesional: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profesionales',
    autopopulate: true,
  }],

  // Datos de las vibraciones / estudio
  entidad: {
    type: String,
  },
  fecha: {
    type: Date,
  },
  comentario: {
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
    enum: ['Pendiente', 'Aprobada', 'Rechazada', 'En proceso'],
  },
  incluido: {
    type: String,
  },
};

// Esquema principal
const antisinestralSchema = new mongoose.Schema(baseSchema, { timestamps: true });
antisinestralSchema.plugin(autopopulate);

// Esquema historial
const antisinestralHistSchema = new mongoose.Schema(baseSchema, { timestamps: true });
antisinestralHistSchema.plugin(autopopulate);

// Modelos
const Antisinestral = mongoose.model('Antisinestral', antisinestralSchema);
const AntisinestralHist = mongoose.model('AntisinestralHist', antisinestralHistSchema);

module.exports = { Antisinestral, AntisinestralHist };
