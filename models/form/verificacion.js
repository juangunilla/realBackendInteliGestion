const mongoose = require("mongoose");
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

// Define el esquema
const verificacionhSchema = new mongoose.Schema(
  {
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
    verificar: {
      type: String,
    },
    confeccion: {
      type: Date,
    },
    periodo: {
      type: String,
    },

    vencimiento: {
      type: Date,
    },
    observacion: {
      type: String,
    },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
},
  {
    timestamps: true, // Habilita las marcas de tiempo automáticas
  }
);

// Aplica el middleware

// Añade el plugin de autopopulación
verificacionhSchema.plugin(require("mongoose-autopopulate"));
verificacionhSchema.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'el estudio de Verificación' });

// Exporta el modelo
const verificacion = mongoose.model("verificacion", verificacionhSchema);

module.exports = verificacion;
