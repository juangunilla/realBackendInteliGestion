const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

const aspBase = {
  cliente: [{ type: mongoose.Schema.Types.ObjectId, ref: 'clientes', autopopulate: true }],
  establecimiento: [{ type: mongoose.Schema.Types.ObjectId, ref: 'establecimientos', autopopulate: true }],
  profesional: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profesionales', autopopulate: true }],
  fechaMedicion: { type: Date },
  fechaEstudio: { type: Date },
  vencimiento: { type: Date },
  estado: { type: String, enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Antiguo', 'Sin fecha'] },
  cumplimiento: { type: String },
  entrega: { type: String, enum: ['Si', 'No'] },
  fechaEntregaCliente: { type: Date },
  proveedor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'proveedores', autopopulate: true }],
  proveedorProfesional: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profesionales', autopopulate: true }],
  comentarios: { type: String },
  tipoEstudio: { type: String, default: 'Informe Cañerías' },
};

const aspSchema = new mongoose.Schema(aspBase, { timestamps: true });
aspSchema.plugin(autopopulate);

const aspHistSchema = new mongoose.Schema({ ...aspBase, archivadoEn: { type: Date, default: Date.now } }, { timestamps: true });
aspHistSchema.plugin(autopopulate);

const AspCanerias = mongoose.model('AspCanerias', aspSchema);
const AspCaneriasHist = mongoose.model('AspCaneriasHist', aspHistSchema);

module.exports = { AspCanerias, AspCaneriasHist };
