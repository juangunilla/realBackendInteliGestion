const mongoose = require('mongoose');
const { setVencimiento } = require('./../../middlewares/venci.'); // Importa el middleware

// Define el esquema
const entregaeppSchema = new mongoose.Schema({
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
 
// Aplica el middleware

// Añade el plugin de autopopulación
entregaeppSchema.plugin(require('mongoose-autopopulate'));

// Exporta el modelo
const Entregaepp = mongoose.model("entregaepp", entregaeppSchema);

module.exports = Entregaepp;
