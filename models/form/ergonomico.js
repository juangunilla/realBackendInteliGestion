const { create } = require('express-handlebars')
const mongoose = require('mongoose')
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

const ergonomicoSheme = new mongoose.Schema({

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
    tipoPlanilla: {
        type: String
    },
    fecha: {
        type: Date
    },
    vencimiento: {
        type: Date
    },
    estado: {
        type: String,
        enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Antiguo', 'Sin fecha']
    },
    profesional: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesionales',
        autopopulate: true
    }],
    fechaDerivado: {
        type: Date,
        default: null,
    },
    profesionalCargo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesionales',
        autopopulate: true
    }],
    comentarios: {
        type: String
    },
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
    },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
}
)
ergonomicoSheme.plugin(require('mongoose-autopopulate'));
ergonomicoSheme.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'el estudio Ergonómico' });

module.exports = mongoose.model("ergonomico", ergonomicoSheme)
