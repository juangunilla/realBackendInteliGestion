const mongoose = require('mongoose');

const artSchema = new mongoose.Schema({
  cliente: [{ type: mongoose.Schema.Types.ObjectId, ref: 'clientes', autopopulate: true }],
  establecimiento: [{ type: mongoose.Schema.Types.ObjectId, ref: 'establecimientos', autopopulate: true }],
  profesional: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profesionales', autopopulate: true }],
  profesionalCargo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profesionales', autopopulate: true }],
  tipoFormulario: String,
  fecha: Date,
  vencimiento: Date,
  estado: { type: String, enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Antiguo', 'Sin fecha'] },
  comentarios: String,
  cotizacion: String,
  fechaCotizacion: Date,
  estadoCotizacion: String,
  incluido: String
});

artSchema.plugin(require('mongoose-autopopulate'));

// Activo
const Art = mongoose.model("art", artSchema);

// Historial (clon + archivadoEn)
const artHistSchema = artSchema.clone();
artHistSchema.add({
  archivadoEn: { type: Date, default: Date.now }
});
const ArtHist = mongoose.model("art_historial", artHistSchema);

module.exports = { Art, ArtHist };
