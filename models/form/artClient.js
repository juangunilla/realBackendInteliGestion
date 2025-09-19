const { create } = require('express-handlebars')
const mongoose = require('mongoose')

const artClientSheme = new mongoose.Schema({

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
    nombre:{
        type:String
    },
    ncontrato:{
        type:Number
    },
    fechaAlta: {
        type: Date
    },
    fechaBaja: {
        type: Date
    },
    declarado:{
        type:Number
    }
}
)
artClientSheme.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("artclient", artClientSheme)