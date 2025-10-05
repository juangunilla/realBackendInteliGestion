const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

// Esquema base (compartido)
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
  dirivado: {
    type: String,
  },
  fechaDerivado: {
    type: Date,
  },
  profesional: [{
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
  },
  incluido: {
    type: String,
  },
  muestra: {
    type: String,
  },
  protocolo: {
    type: String,
  },
  fechaMuestra: {
    type: Date,
  },
  vencimiento: {
    type: Date,
  },
  resultado: {
    type: String,
    enum: ['Apto', 'No apto', 'N/A'],
  },
  estado: {
    type: String,
    enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Antiguo', 'Sin fecha'],
  },
  comentarios: {
    type: String,
  },
};

// Esquema principal
const aguaFisicoQuimicoSchema = new mongoose.Schema(baseSchema);
aguaFisicoQuimicoSchema.plugin(autopopulate);

// Esquema historial (idéntico, pero en otra colección)
const aguaFisicoQuimicoHistSchema = new mongoose.Schema(baseSchema);
aguaFisicoQuimicoHistSchema.plugin(autopopulate);

// Modelos
const AguaFisicoQuimico = mongoose.model('AguaFisicoQuimico', aguaFisicoQuimicoSchema);
const AguaFisicoQuimicoHist = mongoose.model('AguaFisicoQuimicoHist', aguaFisicoQuimicoHistSchema);

module.exports = { AguaFisicoQuimico, AguaFisicoQuimicoHist };
