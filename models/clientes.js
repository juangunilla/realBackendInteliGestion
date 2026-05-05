const mongoose= require('mongoose')

const establecimientoResumenSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Types.ObjectId,
            ref: 'establecimientos',
            autopopulate: false,
        },
        nombre: {
            type: String,
            trim: true,
        },
        direccion: {
            type: String,
            trim: true,
        },
        localidad: {
            type: String,
            trim: true,
        },
        frecuencia: {
            type: String,
            trim: true,
        },
        responsable: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const clientesSheme= new mongoose.Schema({
    rozonSocial:{
        type:String,
        trim: true,
        alias: 'razonSocial',
    },
    nombreFantasia:{
        type:String,
        trim: true,
    },
    domicilio:{
        type:String,
        trim: true,
    },
    cuit:{
        type:String,
        trim: true,
    },
    establecimientos:[establecimientoResumenSchema],
},
{
    timestamps:true,
    versionKey:false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
}
)

clientesSheme.virtual('razonSocial')
    .get(function() {
        return this.rozonSocial;
    })
    .set(function(value) {
        this.rozonSocial = value;
    });

clientesSheme.plugin(require('mongoose-autopopulate'));
module.exports=mongoose.model("clientes",clientesSheme)
