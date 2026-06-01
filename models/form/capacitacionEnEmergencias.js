const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

const referenceConfig = (collection) => ({
  type: mongoose.Schema.Types.ObjectId,
  ref: collection,
  autopopulate: true,
});

const planillaRolSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true },
    responsable: { type: String, trim: true },
    sector: { type: String, trim: true },
    telefono: { type: String, trim: true },
    email: { type: String, trim: true },
    funciones: [{ type: String, trim: true }],
  },
  { _id: true }
);

const organigramaNodoSchema = new mongoose.Schema(
  {
    nodeId: { type: String, required: true, trim: true },
    label: { type: String, trim: true },
    rolId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { _id: false }
);

const organigramaRelacionSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    tipo: { type: String, trim: true },
  },
  { _id: false }
);

const checklistItemSchema = new mongoose.Schema(
  {
    item: { type: String, required: true, trim: true },
    ok: { type: Boolean, default: false },
    observacion: { type: String, default: '' },
  },
  { _id: false }
);

const evidenciaSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const accionCorrectivaSchema = new mongoose.Schema(
  {
    accion: { type: String, trim: true },
    responsable: { type: String, trim: true },
    fechaCompromiso: { type: Date },
    estado: {
      type: String,
      enum: ['Pendiente', 'En curso', 'Completada'],
      default: 'Pendiente',
    },
  },
  { _id: false }
);

const simulacroSchema = new mongoose.Schema(
  {
    fecha: { type: Date, default: Date.now },
    tipo: { type: String, trim: true, default: 'Evacuacion' },
    responsable: { type: String, trim: true, default: null },
    horaInicio: { type: String, trim: true, default: '' },
    horaFin: { type: String, trim: true, default: '' },
    tiempoTotalMin: { type: Number, default: null },
    participantesCantidad: { type: Number, min: 0, default: null },
    recuentoFinalOk: { type: Boolean, default: true },
    comentarios: { type: String, default: '' },
    checklist: { type: [checklistItemSchema], default: [] },
    evidencias: { type: [evidenciaSchema], default: [] },
    accionesCorrectivas: { type: [accionCorrectivaSchema], default: [] },
  },
  { _id: true }
);

const capacitacionEnEmergenciasSchema = new mongoose.Schema(
  {
    cliente: [referenceConfig('clientes')],
    establecimiento: [referenceConfig('establecimientos')],
    profesional: [referenceConfig('profesionales')],
    fechaDerivado: { type: Date, default: null },
    profesionalCapacitador: [referenceConfig('profesionales')],
    fechaCapacitacion: { type: Date },
    fechaCapacitacionAceptadaClienteAt: { type: Date, default: null },
    fechaCapacitacionAceptadaClienteEmail: { type: String, trim: true, default: null },
    vencimientoCapacitacion: { type: Date },
    estadoVigencia: {
      type: String,
      enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Sin estado'],
      default: 'Vigente',
    },
    planillaRoles: { type: [planillaRolSchema], default: [] },
    organigramaRoles: {
      nodos: { type: [organigramaNodoSchema], default: [] },
      relaciones: { type: [organigramaRelacionSchema], default: [] },
    },
    informesSimulacro: { type: [simulacroSchema], default: [] },
    comentarios: { type: String, default: '' },
    entregaDocumentacion: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

capacitacionEnEmergenciasSchema.plugin(autopopulate);
capacitacionEnEmergenciasSchema.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'la Capacitación en Emergencias' });

const capacitacionesEnEmergencias =
  mongoose.models.capacitacionesEnEmergencias ||
  mongoose.model('capacitacionesEnEmergencias', capacitacionEnEmergenciasSchema);

module.exports = { capacitacionesEnEmergencias };
