const mongoose = require("mongoose");

const vibracionesSheme = new mongoose.Schema({
  //datos del cliente

  cliente: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clientes",
      autopopulate: true,
    },
  ],
  establecimiento: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "establecimientos",
      autopopulate: true,
    },
  ],

  //datos del profesional derivado

  profesional: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profesionales",
      autopopulate: true,
    },
  ],

  profesionalCargo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profesionales",
      autopopulate: true,
    },
  ],

  //datos de las vibraciones
  tipo: {
    type: String,
    enum: ["Autoelevadores", "Estaciones de servicios"],
  },
  fecha: {
    type: Date,
  },
  vencimiento: {
    type: Date,
  },
  estado: {
    type: String,
  },
  comentario: {
    type: String,
  },
  // datos de cotización

  cotizacion: {
    type: String,
  },
  fechaCotizacion: {
    type: Date,
  },
  estadoCotizacion: {
    type: String,
  },
  incluido: {
    type: String,
  },
});
vibracionesSheme.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("vibraciones", vibracionesSheme);
