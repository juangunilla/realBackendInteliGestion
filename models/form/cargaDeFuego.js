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
    comentario: {
        type: String
    },

}
)
cargaFuegoSheme.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("cargaDeFuego", cargaFuegoSheme)