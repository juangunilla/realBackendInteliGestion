const mongoose = require('mongoose');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

const aguabacteriologicoSchema = new mongoose.Schema({
  cliente: [{ type: mongoose.Schema.Types.ObjectId, ref: 'clientes', autopopulate: true }],
  establecimiento: [{ type: mongoose.Schema.Types.ObjectId, ref: 'establecimientos', autopopulate: true }],
  dirivado: String,
  profesional: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profesionales', autopopulate:true }],
  fechaDerivado: Date,
  cotizacion: String,
  fechaCotizacion: Date,
  estadoCotizacion: String,
  incluido: String,
  muestra: String,
  protocolo: String,
  fechaMuestra: Date,
  fechaMuestraAceptadaClienteAt: {
    type: Date,
    default: null,
  },
  fechaMuestraAceptadaClienteEmail: {
    type: String,
    trim: true,
    default: null,
  },
  vencimiento: Date,
  resultado: { type: String, enum: ['Apto', 'No apto', 'N/A'] },
  estado: { type: String, enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Antiguo', 'Sin fecha'] },
  comentarios: String,
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
});

aguabacteriologicoSchema.plugin(require('mongoose-autopopulate'));
aguabacteriologicoSchema.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'el estudio de Agua Bacteriológico' });

// Activo
const AguaBacteriologico = mongoose.model("aguabacteriologico", aguabacteriologicoSchema);

// Historial (clon + archivadoEn)
const aguabacteriologicoHistSchema = aguabacteriologicoSchema.clone();
aguabacteriologicoHistSchema.add({
  archivadoEn: { type: Date, default: Date.now }
});
const AguaBacteriologicoHist = mongoose.model("aguabacteriologico_historial", aguabacteriologicoHistSchema);

module.exports = { AguaBacteriologico, AguaBacteriologicoHist };
