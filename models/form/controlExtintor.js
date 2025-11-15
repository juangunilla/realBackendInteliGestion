const mongoose = require('mongoose');
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
  confeccion: {
    type: Date
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

// Aplica el middleware
setVencimiento(controlExtintorSchema);

// Añade el plugin de autopopulación
controlExtintorSchema.plugin(require('mongoose-autopopulate'));

// Exporta el modelo
const controlExtintor = mongoose.model("controlExtintor", controlExtintorSchema);

module.exports = controlExtintor;
