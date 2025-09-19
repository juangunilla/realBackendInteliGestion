const { create } = require('express-handlebars')
const mongoose= require('mongoose')

const clientesSheme= new mongoose.Schema({
    rozonSocial:{
        type:String
    },
    nombreFantasia:{
        type:String
    },
    domicilio:{
        type:String
    },
    cuit:{
        type:Number
    },
    establecimientos:[{
        type:mongoose.Types.ObjectId,
        ref: 'establecimientos',
        autopopulate: false,
    }],
},
{
    timestamps:true,
    versionKey:false
}
)
clientesSheme.plugin(require('mongoose-autopopulate'));
module.exports=mongoose.model("clientes",clientesSheme)