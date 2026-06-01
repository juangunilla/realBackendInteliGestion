const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');
const { getStudyDateOrderError } = require('../../helpers/studyDateOrder');

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
  tipoEstudio: { type: String, default: 'Prueba hidráulica' },
};

const aspSchema = new mongoose.Schema(aspBase, { timestamps: true });
aspSchema.pre('validate', function aspHidraulicaPreValidate(next) {
  const errorMessage = getStudyDateOrderError(this);

  if (errorMessage) {
    this.invalidate('fechaEstudio', errorMessage);
  }

  next();
});
aspSchema.plugin(autopopulate);
aspSchema.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'el estudio ASP Hidráulica' });

const aspHistSchema = new mongoose.Schema({ ...aspBase, archivadoEn: { type: Date, default: Date.now },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });
aspHistSchema.pre('validate', function aspHidraulicaHistPreValidate(next) {
  const errorMessage = getStudyDateOrderError(this);

  if (errorMessage) {
    this.invalidate('fechaEstudio', errorMessage);
  }

  next();
});
aspHistSchema.plugin(autopopulate);

const AspHidraulica =
  mongoose.models.AspHidraulica || mongoose.model('AspHidraulica', aspSchema);
const AspHidraulicaHist =
  mongoose.models.AspHidraulicaHist || mongoose.model('AspHidraulicaHist', aspHistSchema);

module.exports = {
  AspHidraulica,
  AspHidraulicaHist,
  getAspHidraulicaDateOrderError: getStudyDateOrderError,
};
