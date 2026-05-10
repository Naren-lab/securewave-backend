const Device = require("../models/Device");


/* -----------------------------------
   Register Main Device
----------------------------------- */
const registerMainDevice = async (
  req,
  res
) => {
  try {
    const {
      userId,
      deviceName,
      deviceType
    } = req.body;

    const existingMain =
      await Device.findOne({
        userId,
        isMainDevice: true
      });

    if (existingMain) {
      return res.status(400).json({
        message:
          "Main device already exists"
      });
    }

    const device =
      await Device.create({
        userId,
        deviceName,
        deviceType,
        isPrimary: true,
        isMainDevice: true,
        isApproved: true,
        hasPrivateAccess: true,
        status: "active"
      });

    res.status(201).json(device);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Request Link New Device
----------------------------------- */
const linkDevice = async (
  req,
  res
) => {
  try {
    const {
      userId,
      deviceName,
      deviceType
    } = req.body;

    const device =
      await Device.create({
        userId,
        deviceName,
        deviceType,
        isPrimary: false,
        isMainDevice: false,
        isApproved: false,
        hasPrivateAccess: false,

        // Auto logout after 10 mins
        sessionExpiresAt:
          new Date(
            Date.now() +
              10 *
                60 *
                1000
          ),

        status: "pending"
      });

    res.status(201).json({
      message:
        "Device request sent to main device",
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
const approveDevice = async (
  req,
  res
) => {
  try {
    const { deviceId } =
      req.params;

    const updatedDevice =
      await Device.findByIdAndUpdate(
        deviceId,
        {
          isApproved: true,
          status: "active"
        },
        { new: true }
      );

    res.json({
      message:
        "Device approved successfully",
      updatedDevice
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Grant Private Space Access
----------------------------------- */
const grantPrivateAccess =
  async (req, res) => {
    try {
      const { deviceId } =
        req.params;

      const updatedDevice =
        await Device.findByIdAndUpdate(
          deviceId,
          {
            hasPrivateAccess: true,

            // Remove auto logout
            sessionExpiresAt:
              null
          },
          { new: true }
        );

      res.json({
        message:
          "Private Space access granted",
        updatedDevice
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };


/* -----------------------------------
   Remove Private Space Access
----------------------------------- */
const removePrivateAccess =
  async (req, res) => {
    try {
      const { deviceId } =
        req.params;

      const updatedDevice =
        await Device.findByIdAndUpdate(
          deviceId,
          {
            hasPrivateAccess: false,

            sessionExpiresAt:
              new Date(
                Date.now() +
                  10 *
                    60 *
                    1000
              )
          },
          { new: true }
        );

      res.json({
        message:
          "Private access removed",
        updatedDevice
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };


/* -----------------------------------
   View Devices
----------------------------------- */
const getDevices = async (
  req,
  res
) => {
  try {
    const devices =
      await Device.find({
        userId:
          req.params.userId
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
const removeDevice = async (
  req,
  res
) => {
  try {
    await Device.findByIdAndDelete(
      req.params.deviceId
    );

    res.json({
      message:
        "Device removed successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* -----------------------------------
   Force Logout Device
----------------------------------- */
const forceLogoutDevice =
  async (req, res) => {
    try {
      await Device.findByIdAndUpdate(
        req.params.deviceId,
        {
          status: "logged_out"
        }
      );

      res.json({
        message:
          "Device logged out remotely"
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
  forceLogoutDevice
};