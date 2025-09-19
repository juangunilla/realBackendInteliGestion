const mongoose = require('mongoose');
const { setVencimiento } = require('../../middlewares/venci.'); // Importa el middleware

// Define el esquema
const analistSchema = new mongoose.Schema({
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
setVencimiento(analistSchema);

// Añade el plugin de autopopulación
analistSchema.plugin(require('mongoose-autopopulate'));

// Exporta el modelo
const analisis = mongoose.model("analisis", analistSchema);

module.exports = analisis;
