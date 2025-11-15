const mongoose= require('mongoose')

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
