const mongoose = require('mongoose');
const { setVencimiento } = require('../../middlewares/venci.'); // Importa el middleware

// Define el esquema
const cronocSchema = new mongoose.Schema({
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
setVencimiento(cronocSchema);

// Añade el plugin de autopopulación
cronocSchema.plugin(require('mongoose-autopopulate'));

// Exporta el modelo
const Cronoc = mongoose.model("cronoc", cronocSchema);

module.exports = Cronoc;
