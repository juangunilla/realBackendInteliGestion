const mongoose = require('mongoose')

const cargaFuegoSheme = new mongoose.Schema({
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


    //datos del estudio
    entidad: {
        type: String
    },
    fecha: {
        type: Date
    },
    vencimiento: {
        type: Date
    },
    estado: {
        type: String,
        default: null
    },
    comentario: {
        type: String
    },
    cheq:{
        type:String
    },
    revalidacionDe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cargaDeFuego',
        default: null
    },
    estudioOrigen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cargaDeFuego',
        default: null
    },
    esRevalidacion: {
        type: Boolean,
        default: false
    },
    numeroRevalidacion: {
        type: Number,
        default: 0
    },
    relevamientoHabilitado: {
        type: Boolean,
        default: false
    },
    fechaHabilitacionRelevamiento: {
        type: Date,
        default: null
    },
    habilitadoRelevamientoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },

}
)
cargaFuegoSheme.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("cargaDeFuego", cargaFuegoSheme)
