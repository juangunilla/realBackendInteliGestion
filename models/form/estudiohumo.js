const mongoose = require('mongoose');
const { setVencimiento } = require('./../../middlewares/venci.'); // Importa el middleware
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

// Define el esquema
const estudiohSchema = new mongoose.Schema({
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
    autopopulate: true
}],
  fechaDerivado: {
    type: Date,
    default: null,
  },
  confeccion: {
    type: Date
  },
  periodo:{
    type:String
  },
  vencimiento: {
    type: Date
  },
  observacion:{
    type:String
  }
}, {
  timestamps: true  // Habilita las marcas de tiempo automáticas
});
 
// Añade el plugin de autopopulación
estudiohSchema.plugin(require('mongoose-autopopulate'));
estudiohSchema.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'el Estudio de Humo' });

// Exporta el modelo
const estudioh = mongoose.model("estudioh", estudiohSchema);

module.exports = estudioh;
