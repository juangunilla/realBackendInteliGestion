const mongoose = require('mongoose');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');
const { setVencimiento } = require('../../middlewares/venci.');

// Define el esquema
const contaminantelabSchema = new mongoose.Schema({
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
  observacion: {
    type: String
  },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true  // Habilita las marcas de tiempo automáticas
});

// Aplica el middleware
setVencimiento(contaminantelabSchema);

// Añade el plugin de autopopulación
contaminantelabSchema.plugin(require('mongoose-autopopulate'));
contaminantelabSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'el estudio de contaminante laboral',
});

// Exporta el modelo
const contaminantelab = mongoose.model("contaminantelab", contaminantelabSchema);

module.exports = contaminantelab;
