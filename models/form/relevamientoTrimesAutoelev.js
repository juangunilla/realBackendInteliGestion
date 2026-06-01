const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');
const { setVencimiento } = require('../../middlewares/vencitrimestral');

const relevamientoTrimesAutoelevSchema = new mongoose.Schema(
  {
    cliente: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clientes',
        autopopulate: true,
      },
    ],
    establecimiento: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'establecimientos',
        autopopulate: true,
      },
    ],
    profesional: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesionales',
        autopopulate: true,
      },
    ],
    confeccion: {
      type: Date,
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
    timestamps: true,
  }
);

setVencimiento(relevamientoTrimesAutoelevSchema);
relevamientoTrimesAutoelevSchema.plugin(autopopulate);
relevamientoTrimesAutoelevSchema.plugin(studyProfessionalAssignmentPlugin, {
  studyLabel: 'el relevamiento trimestral de autoelevador',
});

const RelevamientoTrimesAutoelev = mongoose.model(
  'relevamientoTrimesAutoelev',
  relevamientoTrimesAutoelevSchema
);

module.exports = RelevamientoTrimesAutoelev;
