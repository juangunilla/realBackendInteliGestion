const mongoose = require('mongoose');
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
  confeccion: {
    type: Date
  },
  vencimiento: {
    type: Date
  },
  observacion: {
    type: String
  }
}, {
  timestamps: true  // Habilita las marcas de tiempo automáticas
});

// Aplica el middleware
setVencimiento(contaminantelabSchema);

// Añade el plugin de autopopulación
contaminantelabSchema.plugin(require('mongoose-autopopulate'));

// Exporta el modelo
const contaminantelab = mongoose.model("contaminantelab", contaminantelabSchema);

module.exports = contaminantelab;
