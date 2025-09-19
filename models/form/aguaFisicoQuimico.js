const { create } = require('express-handlebars')
const mongoose = require('mongoose')

const aguafisicoquimicoSheme = new mongoose.Schema({

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
    dirivado:{
        type:String,
    },
     fechaDerivado:{
        type:Date
    },

    profesional: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesionales',
        autopopulate:true
    }],
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
    muestra: {
        type: String,
    },
    protocolo: {
        type: String,
    },
    fechaMuestra: {
        type: Date,
    },
    vencimiento: {
        type: Date
    },
    resultado: {
        type: String,
        enum: ['Apto', 'No apto', 'N/A']
    },
    estado: {
        type: String,
        enum: ['Vigente', 'Vencido', 'Por vencer', 'Pendiente', 'Antiguo', 'Sin fecha']
    },
    comentarios:{
        type:String
    }


}
)
aguafisicoquimicoSheme.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("aguafisicoquimico", aguafisicoquimicoSheme)