const Device = require("../models/Device");
const User = require("../models/User");
const bcrypt = require("bcryptjs");


/* -----------------------------------
   Register Main Device
----------------------------------- */
const registerMainDevice = async (req, res) => {
  try {
    const { userId, deviceName, deviceType } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID required"
      });
    }

    const existingMain = await Device.findOne({
      userId,
      isMainDevice: true
    });

    if (existingMain) {
      return res.status(200).json({
        message: "Main device already exists",
        device: existingMain
      });
    }

    const device = await Device.create({
      userId,
      deviceName,
      deviceType,
      isPrimary: true,
      isMainDevice: true,
      isApproved: true,
      hasPrivateAccess: true,
      status: "active",
      sessionExpiresAt: null
    });

    res.status(201).json({
      message: "Main device registered successfully",
      device
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Link New Device
----------------------------------- */
const linkDevice = async (req, res) => {
  try {
    const { userId, deviceName, deviceType } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID required"
      });
    }

    const existingPending = await Device.findOne({
      userId,
      deviceName,
      status: "pending"
    });

    if (existingPending) {
      return res.status(400).json({
        message: "Device request already pending"
      });
    }

    const existingActive = await Device.findOne({
      userId,
      deviceName,
      status: "active"
    });

    if (existingActive) {
      return res.status(400).json({
        message: "Device already linked"
      });
    }

    const device = await Device.create({
      userId,
      deviceName,
      deviceType,
      isPrimary: false,
      isMainDevice: false,
      isApproved: false,
      hasPrivateAccess: false,
      sessionExpiresAt: new Date(
        Date.now() + 10 * 60 * 1000
      ),
      status: "pending"
    });

    res.status(201).json({
      message: "Device request sent successfully",
      device
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Approve Device
----------------------------------- */
const approveDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await Device.findById(deviceId);

    if (!device) {
      return res.status(404).json({
        message: "Device not found"
      });
    }

    device.status = "active";
    device.isApproved = true;

    await device.save();

    res.json({
      message: "Device approved successfully",
      device
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Grant Private Access
----------------------------------- */
const grantPrivateAccess = async (req, res) => {
  try {
    const device = await Device.findById(
      req.params.deviceId
    );

    if (!device) {
      return res.status(404).json({
        message: "Device not found"
      });
    }

    device.hasPrivateAccess = true;
    device.sessionExpiresAt = null;

    await device.save();

    res.json({
      message: "Private access granted",
      device
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Remove Private Access
----------------------------------- */
const removePrivateAccess = async (req, res) => {
  try {
    const device = await Device.findById(
      req.params.deviceId
    );

    if (!device) {
      return res.status(404).json({
        message: "Device not found"
      });
    }

    device.hasPrivateAccess = false;
    device.sessionExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await device.save();

    res.json({
      message: "Private access removed",
      device
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Get Devices
----------------------------------- */
const getDevices = async (req, res) => {
  try {
    const devices = await Device.find({
      userId: req.params.userId
    });

    res.json(devices);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Remove Device
----------------------------------- */
const removeDevice = async (req, res) => {
  try {
    const device = await Device.findById(
      req.params.deviceId
    );

    if (!device) {
      return res.status(404).json({
        message: "Device not found"
      });
    }

    if (device.isMainDevice) {
      return res.status(400).json({
        message: "Main device cannot be removed"
      });
    }

    await Device.findByIdAndDelete(
      req.params.deviceId
    );

    res.json({
      message: "Device removed successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Force Logout
----------------------------------- */
const forceLogoutDevice = async (req, res) => {
  try {
    const device = await Device.findById(
      req.params.deviceId
    );

    if (!device) {
      return res.status(404).json({
        message: "Device not found"
      });
    }

    device.status = "logged_out";

    await device.save();

    res.json({
      message: "Device logged out successfully",
      device
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Make New Device Main
----------------------------------- */
const makeDeviceMain = async (req, res) => {
  try {
    const {
      userId,
      deviceId,
      password,
      otp
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password"
      });
    }

    // Demo OTP
    if (otp !== "123456") {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // Remove old main device
    await Device.updateMany(
      {
        userId,
        isMainDevice: true
      },
      {
        isMainDevice: false
      }
    );

    // Make new device main
    const newMainDevice =
      await Device.findByIdAndUpdate(
        deviceId,
        {
          isMainDevice: true,
          isPrimary: true,
          hasPrivateAccess: true,
          status: "active"
        },
        { new: true }
      );

    res.json({
      message: "New device is now main device",
      device: newMainDevice
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
  registerMainDevice,
  linkDevice,
  approveDevice,
  grantPrivateAccess,
  removePrivateAccess,
  getDevices,
  removeDevice,
  forceLogoutDevice,
  makeDeviceMain
};