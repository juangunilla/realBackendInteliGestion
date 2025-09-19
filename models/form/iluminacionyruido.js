const mongoose = require('mongoose')

const iluminacionyruidoSheme = new mongoose.Schema({
    //datos del cliente

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

    //datos del profesional derivado 

    profesional: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesionales',
        autopopulate: true
    }],
    fechaDerivado: {
        type: Date
    },
    profesionalCargo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesionales',
        autopopulate: true
    }],

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
    //datos del estudio
    tipo:{
        type:String,
        enum:["iluminacion","ruido"]
    },
    fecha:{
        type:Date
    },
    vencimiento:{
        type:Date
    },
    estado:{
        type:String,
        enum: ['Vencido', 'Por vencer', 'Vigente', 'Pendiente', 'Antiguo', 'Sin  fecha']
    },
    comentario:{
        type:String
    },

}
)
iluminacionyruidoSheme.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("iluminacionyruido", iluminacionyruidoSheme)