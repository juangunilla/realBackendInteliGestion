const { create } = require('express-handlebars')
const mongoose = require('mongoose')
const { studyProfessionalAssignmentPlugin } = require('../../helpers/studyProfessionalAssignment');

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
    profesional: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesionales',
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
        type:String
    },
  entregaDocumentacion: {
    type: Boolean,
    default: false,
  }
}
)
artClientSheme.plugin(require('mongoose-autopopulate'));
artClientSheme.plugin(studyProfessionalAssignmentPlugin, {
    studyLabel: 'el estudio ART Client'
});

module.exports = mongoose.model("artclient", artClientSheme)
