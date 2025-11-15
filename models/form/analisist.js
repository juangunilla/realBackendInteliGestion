const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { setVencimiento } = require('../../middlewares/venci.'); // Middleware

// Esquema base (se reutiliza en ambos modelos)
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
  confeccion: {
    type: Date,
  },
  vencimiento: {
    type: Date,
  },
  observacion: {
    type: String,
  },
};

// Esquema principal
const analisisSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});
setVencimiento(analisisSchema);
analisisSchema.plugin(autopopulate);

// Esquema historial (idéntico, también con middleware)
const analisisHistSchema = new mongoose.Schema(baseSchema, {
  timestamps: true,
});
setVencimiento(analisisHistSchema);
analisisHistSchema.plugin(autopopulate);

// Modelos
const Analisis = mongoose.model('Analisis', analisisSchema);
const AnalisisHist = mongoose.model('AnalisisHist', analisisHistSchema);

module.exports = { Analisis, AnalisisHist };
