const mongoose = require('mongoose')

const aspSheme = new mongoose.Schema({
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

    dirivado: {
        type: String,
    },
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
    },
    otro:{
        type:String
    },
    tipoEstudio:{
        type:String,
        enum:['Ensayo periodico anual','Prueba Hidraulica']
    },
    litros:{
        type:Number,
    },
    opds:{
        type:String,
        enum:['si','no']
    },
    fechaMed: {
        type: Date
    },
    vencimiento: {
        type: Date
    },
    estado: {
        type: String,
        enum: ['Vencido', 'Por vencer', 'Vigente', 'Pendiente', 'Antiguo', 'Sin  fecha']
    },
    entrega: {
        type: String,
        enum: ['Si', 'No']
    },
    observacion: {
        type: String
    },

}
)
aspSheme.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("asp", aspSheme)