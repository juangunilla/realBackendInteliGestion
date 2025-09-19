const mongoose = require('mongoose')

const capacitacionesSheme = new mongoose.Schema({
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
    
    profesionalCargo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesionales',
        autopopulate: true
    }],

    //datos de la capacitaciones
    fecha:{
        type:Date
    },
    vencimiento:{
        type:Date
    },
    entregaNormas:{
        type:String,
        enum:["si","no"]
    },
    entregaMaterial:{
        type:String,
        enum:["si","no"]
    },
    tiempo:{
        type:String
    },
    tema:{
        type:String,
        
    },
    estado:{
        type:String,

    }
}
)
capacitacionesSheme.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("capacitacion", capacitacionesSheme)