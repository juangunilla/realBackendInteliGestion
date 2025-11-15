const mongoose = require('mongoose');
const { setVencimiento } = require('../../middlewares/venci.'); // Importa el middleware

// Define el esquema
const leysapSchema = new mongoose.Schema({
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
  nexpediente: {
    type: String
  },
  aprobacion: {
    type: Date
  },
  vencimiento:{
    type:Date
  },
  observacion:{
    type:String
  }
}, {
  timestamps: true  // Habilita las marcas de tiempo automáticas
});

// Aplica el middleware
setVencimiento(leysapSchema);

// Añade el plugin de autopopulación
leysapSchema.plugin(require('mongoose-autopopulate'));

// Exporta el modelo
const leysap = mongoose.model("leysap", leysapSchema);

module.exports = leysap;
