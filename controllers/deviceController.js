const Device = require("../models/Device");

// Link new device
const linkDevice = async (req, res) => {
  try {
    const { userId, deviceName, deviceType } = req.body;

    const device = await Device.create({
      userId,
      deviceName,
      deviceType,
      isPrimary: false,
      sessionExpiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    res.status(201).json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View linked devices
const getDevices = async (req, res) => {
  try {
    const devices = await Device.find({
      userId: req.params.userId
    });

    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove device
const removeDevice = async (req, res) => {
  try {
    await Device.findByIdAndDelete(req.params.deviceId);

    res.json({
      message: "Device removed successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Force logout
const forceLogoutDevice = async (req, res) => {
  try {
    await Device.findByIdAndUpdate(
      req.params.deviceId,
      {
        status: "logged_out"
      }
    );

    res.json({
      message: "Device logged out remotely"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  linkDevice,
  getDevices,
  removeDevice,
  forceLogoutDevice
};