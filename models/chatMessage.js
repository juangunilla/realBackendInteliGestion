const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      autopopulate: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      autopopulate: true,
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    studyRef: {
      key: String,
      label: String,
      estudioId: mongoose.Schema.Types.ObjectId,
      resumen: {
        cliente: String,
        establecimiento: String,
        estado: String,
        vencimiento: Date,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

chatMessageSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('chatmessages', chatMessageSchema);
