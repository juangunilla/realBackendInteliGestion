const mongoose = require('mongoose');

const clientPortalAccountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    clienteIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clientes',
        required: true,
      },
    ],
    allowedEstablecimientoIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'establecimientos',
      },
    ],
    contactName: {
      type: String,
      trim: true,
      default: '',
    },
    permissions: {
      canViewStudies: {
        type: Boolean,
        default: true,
      },
      canViewDocuments: {
        type: Boolean,
        default: false,
      },
      canViewMetrics: {
        type: Boolean,
        default: false,
      },
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports =
  mongoose.models.ClientPortalAccount ||
  mongoose.model('ClientPortalAccount', clientPortalAccountSchema);
