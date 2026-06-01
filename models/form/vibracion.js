const mongoose = require("mongoose");
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

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
  fechaDerivado: {
    type: Date,
    default: null,
  },

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
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
});
vibracionesSheme.plugin(require("mongoose-autopopulate"));
vibracionesSheme.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'el estudio de Vibraciones' });

module.exports = mongoose.model("vibraciones", vibracionesSheme);
