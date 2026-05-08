const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    eventKey: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    inAppEnabled: {
      type: Boolean,
      default: true,
    },
    emailEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationPreferenceSchema.index({ userId: 1, eventKey: 1 }, { unique: true });

module.exports =
  mongoose.models.NotificationPreference ||
  mongoose.model('NotificationPreference', notificationPreferenceSchema);
