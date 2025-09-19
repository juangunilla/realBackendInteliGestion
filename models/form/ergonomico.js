const { create } = require('express-handlebars')
const mongoose = require('mongoose')

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
    }
}
)
ergonomicoSheme.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("ergonomico", ergonomicoSheme)