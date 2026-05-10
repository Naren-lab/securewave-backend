const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Device info
    deviceName: {
      type: String,
      required: true
    },

    deviceType: {
      type: String,
      default: "browser"
    },

    // Unique code used for linking
    deviceCode: {
      type: String,
      default: function () {
        return (
          "SW-LINK-" +
          Math.floor(
            1000 + Math.random() * 9000
          )
        );
      }
    },

    // First registered device
    isPrimary: {
      type: Boolean,
      default: false
    },

    // Main device control access
    isMainDevice: {
      type: Boolean,
      default: false
    },

    // Device approval by main device
    isApproved: {
      type: Boolean,
      default: false
    },

    // Can access private space
    hasPrivateAccess: {
      type: Boolean,
      default: false
    },

    // Temporary session for normal linked devices
    sessionExpiresAt: {
      type: Date,
      default: null
    },

    // active / blocked / removed
    status: {
      type: String,
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Device",
  deviceSchema
);