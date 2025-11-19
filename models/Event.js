const mongoose = require('mongoose');

const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'company' },
    role: { type: String },
    feature: { type: String, required: true },
    action: { type: String, required: true },
    extra: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Event', eventSchema);
