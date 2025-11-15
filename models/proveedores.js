
const { create } = require('express-handlebars');
const mongoose= require('mongoose');
const Schema= mongoose.Schema;
const proveedoresSheme= new mongoose.Schema({
    razonsocial:{
        type:String,
    },
    calle:{
        type:String
    },
    numero:{
        type:Number
    },
    dpto:{
        type:String
    },
    entreCalles:{
        type:String
    },

   provincia:{
        type:String
    },
    localidad:{
        type:String
    },
    partido:{
        type:String
    },

    georeferencia:{
        type:String
    },
    telefonos:{
        type:String
    },
    contacto:{
        type:String
    },
    rubroActividad:{
        type:String
    }
},
{
    timestamps:true,
    versionKey:false
}
)
module.exports=mongoose.model("proveedores",proveedoresSheme)