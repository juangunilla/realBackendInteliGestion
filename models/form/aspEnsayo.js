const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

const aspBase = {
  cliente: [{ type: mongoose.Schema.Types.ObjectId, ref: 'clientes', autopopulate: true }],
  establecimiento: [{ type: mongoose.Schema.Types.ObjectId, ref: 'establecimientos', autopopulate: true }],
  profesional: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profesionales', autopopulate: true }],
  fechaDerivado: { type: Date, default: null },
  fechaMedicion: { type: Date },
  fechaEstudio: { type: Date },
  vencimiento: { type: Date },
  estado: { type: String, enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Antiguo', 'Sin fecha'] },
  cumplimiento: { type: String },
  entrega: { type: String, enum: ['Si', 'No'] },
  fechaEntregaCliente: { type: Date },
  proveedor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'proveedores', autopopulate: true }],
  proveedorProfesional: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profesionales', autopopulate: true }],
  fechaDerivadoProveedor: { type: Date, default: null },
  comentarios: { type: String },
  tipoEstudio: { type: String, default: 'Ensayo periódico anual' },
};

const aspSchema = new mongoose.Schema(aspBase, { timestamps: true });
aspSchema.plugin(autopopulate);
aspSchema.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'el estudio ASP Ensayo Periódico' });

const aspHistSchema = new mongoose.Schema({ ...aspBase, archivadoEn: { type: Date, default: Date.now },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });
aspHistSchema.plugin(autopopulate);

const AspEnsayo = mongoose.model('AspEnsayo', aspSchema);
const AspEnsayoHist = mongoose.model('AspEnsayoHist', aspHistSchema);

module.exports = { AspEnsayo, AspEnsayoHist };
