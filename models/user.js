const { create } = require('express-handlebars');
const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        correo: {
            type: String,
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        },
        nombreyapellido: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        rol: {
            type: String,
            enum: ["admin", "seguidor", "profe"],
            required: true,
        },
        image: {
            type: String,
            default: "default.png",
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        profesional: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'profesionales',
            },
        ],
        pushSubscriptions: {
            type: [
              {
                endpoint: { type: String },
                keys: {
                  auth: { type: String },
                  p256dh: { type: String },
                },
              },
            ],
            default: [], // Define un array vacío por defecto
          },
          
        
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("user", userSchema);
