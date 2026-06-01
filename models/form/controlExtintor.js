const mongoose = require('mongoose');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');
const { setVencimiento } = require('./../../middlewares/vencitrimestral'); // Importa el middleware

// Define el esquema
const controlExtintorSchema = new mongoose.Schema({
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
  confeccion: {
    type: Date
  },
  vencimiento: {
    type: Date
  },
  observacion:{
    type:String
  },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true  // Habilita las marcas de tiempo automáticas
});

// Aplica el middleware con un mes extra para control de extintores
setVencimiento(controlExtintorSchema, { monthsToAdd: 4 });

// Añade el plugin de autopopulación
controlExtintorSchema.plugin(require('mongoose-autopopulate'));
controlExtintorSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'el control de extintor',
});

// Exporta el modelo
const controlExtintor = mongoose.model("controlExtintor", controlExtintorSchema);

module.exports = controlExtintor;
