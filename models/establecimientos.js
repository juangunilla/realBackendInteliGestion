const { create } = require('express-handlebars');
const mongoose= require('mongoose');
const Schema= mongoose.Schema;
const establecimientosSheme= new mongoose.Schema({

    calle:{
        type:String
    },
    numero:{
        type:Number
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
    codigoPostal:{
        type:String
    },
    georeferencia:{
        type:String
    },
    horarioDeTrabajo:{
        type:String
    },
    profesionalAsignado:[{
        type:mongoose.Types.ObjectId,
            ref:"profesionales",
            autopopulate: true
    }],
    telefono:{
        type:String
    },
    interno:{
        type:String
    },
    telSecundario:{
        type:String
    },
    eMail:{
        type:String

    },
    visitaMin:{
        type:Number
    },
    visitaMax:{
        type:Number
    },
    ciiu1:
        [{
            type:mongoose.Types.ObjectId,
                ref:"ciuu",
                autopopulate: true
        }],
    ciiu2:
        [{
            type:mongoose.Types.ObjectId,
                ref:"ciuu",
                autopopulate: true
    }],
    
    hs1:{
        type:String
    },
    hs2:{
        type:String
    },
    SHS:{
        type:String
    },
    comentarios:{
        type:String
    },
    historialProfesionales:[
        {
            profesional:{
                type:mongoose.Types.ObjectId,
                ref:"profesionales",
                autopopulate:true
            },
            desde:{
                type:Date,
                default:Date.now
            },
            hasta:{
                type:Date
            },
            comentario:{
                type:String
            }
        }
    ]
},
{
    timestamps:true,
    versionKey:false
}
)
establecimientosSheme.plugin(require('mongoose-autopopulate'));
module.exports=mongoose.model("establecimientos",establecimientosSheme)
