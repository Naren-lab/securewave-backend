const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    deviceName: String,
    deviceType: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    sessionExpiresAt: Date,
    status: {
      type: String,
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Device", deviceSchema);