const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

// Esquema base (reutilizable)
const artrgrglBase = {
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
};

// Esquema principal
const artrgrglSchema = new mongoose.Schema(artrgrglBase, { timestamps: true });
artrgrglSchema.plugin(autopopulate);

// Esquema historial (idéntico + campo archivadoEn)
const artrgrglHistSchema = new mongoose.Schema(
  { ...artrgrglBase, archivadoEn: { type: Date, default: Date.now } },
  { timestamps: true }
);
artrgrglHistSchema.plugin(autopopulate);

// Exporta ambos modelos con nombre Artrgrgl
const Artrgrgl = mongoose.model('Artrgrgl', artrgrglSchema);
const ArtrgrglHist = mongoose.model('ArtrgrglHist', artrgrglHistSchema);

module.exports = { Artrgrgl, ArtrgrglHist };
