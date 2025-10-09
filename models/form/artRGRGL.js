const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

// Esquema base (reutilizable)
const ArtrgrglSchema = {
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

// Modelo principal
const artSchema = new mongoose.Schema(ArtrgrglSchema, { timestamps: true });
artSchema.plugin(autopopulate);

// Modelo historial (clonado + fecha de archivo)
const artHistSchema = new mongoose.Schema(
  { ...ArtrgrglSchema, archivadoEn: { type: Date, default: Date.now } },
  { timestamps: true }
);
artHistSchema.plugin(autopopulate);

// Exporta ambos modelos
const Artrgrgl = mongoose.model('Artrgrgl', artSchema);
const ArtrgrglHist = mongoose.model('ArtrgrglHist', artHistSchema);


module.exports = { Artrgrgl, ArtrgrglHist };
