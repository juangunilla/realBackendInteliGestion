
const { create } = require('express-handlebars');
const mongoose= require('mongoose');
const Schema= mongoose.Schema;
const otSheme= new mongoose.Schema({
    cliente:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'clientes',
        autopopulate:true
    },
    establecimiento:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'establecimientos',
        autopopulate:true
    },
    fecha:{
        type:Date,
    },
    descripcion:{
        type:String
    },
    asignado:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesionales',
        autopopulate:true
    }],
    estado:{
        type:String
    },
    
},
{
    timestamps:true,
    versionKey:false
}
)
otSheme.plugin(require('mongoose-autopopulate'));

module.exports=mongoose.model("ot",otSheme)