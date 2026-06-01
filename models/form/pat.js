const mongoose = require('mongoose')
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

const patSheme = new mongoose.Schema({
    //datos del cliente

    tipoEstudio: {
        type: String,
        enum: ['PAT', 'Proteccion catodica'],
        default: 'PAT'
    },
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
        enum: ['true', 'false']
    },
    profesional: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesionales',
        autopopulate: true
    }],
    fechaDerivado: {
        type: Date,
        default: null,
    },

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

    fechaMed:{
        type:Date
    },
    vencimiento:{
        type:Date
    },
    estado:{
        type:String,
        enum:['Vencido','Por vencer','Vigente','Pendiente','Antiguo','Sin  fecha']
    },
    cumplimiento:{
        type:String,
        enum:['Cumple','No cumple']
    },
    entrega:{
        type:String,
        enum:['Si','No']
    },
    observacion:{
        type:String
    },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
}
)
patSheme.plugin(require('mongoose-autopopulate'));
patSheme.plugin(studyProfessionalAssignmentPlugin, { studyLabel: 'el estudio PAT' });

module.exports = mongoose.model("pat", patSheme)
