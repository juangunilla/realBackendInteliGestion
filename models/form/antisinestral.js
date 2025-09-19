const mongoose = require('mongoose')

const antisinestralSheme = new mongoose.Schema({
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
    
   

    //datos de las vibraciones
    entidad:{
        type:String,
    },
    fecha:{
        type:Date
    },
    comentario:{
        type:String
    },
    // datos de cotización 

}
)
antisinestralSheme.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("antisinestral", antisinestralSheme)