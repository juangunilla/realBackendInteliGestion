
const { create } = require('express-handlebars');
const mongoose= require('mongoose');
const Schema= mongoose.Schema;
const profesionalesSheme= new mongoose.Schema({
    nombreyapellido:{
        type:String,
    },
    telefono:{
        type:String,
    },
    celular:{
        type:String
    },
    correo:{
        type:String
    },
    especialidades:{
        type:String
    },
    colegiado:{
        type:String
    },
    matricula:{
        type:String
    },
    sepa:{
        type:String
    },
    domicilio:{
        type:String
    },
    departamento:{
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
    comentario:{
        type:String
    },
},
{
    timestamps:true,
    versionKey:false
}
)
module.exports=mongoose.model("profesionales",profesionalesSheme)