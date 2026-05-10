const User = require("../models/User");
const Device = require("../models/Device");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


/* -----------------------------------
   REGISTER USER
   Registration device becomes MAIN
----------------------------------- */
exports.registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    const existingUser =
      await User.findOne({
        email
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // Create user
    const user =
      await User.create({
        name,
        email,
        password:
          hashedPassword,
        uniqueUserId:
          "SW" +
          Date.now(),
        passKey:
          "PK" +
          Math.floor(
            Math.random() *
              10000
          )
      });

    // Registration device = MAIN DEVICE
    await Device.create({
      userId: user._id,
      deviceName:
        req.headers[
          "user-agent"
        ] ||
        "Unknown Device",
      deviceType:
        "Browser",
      isPrimary: true,
      isMainDevice: true,
      isApproved: true,
      hasPrivateAccess: true,
      status: "active",
      sessionExpiresAt:
        null
    });

    res.status(201).json({
      message:
        "User registered successfully. This device is now your MAIN device.",
      user
    });

  } catch (error) {
    res.status(500).json({
      message:
        error.message
    });
  }
};


/* -----------------------------------
   LOGIN USER
----------------------------------- */
exports.loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password
    } = req.body;

    const user =
      await User.findOne({
        email
      });

    if (!user) {
      return res.status(400).json({
        message:
          "User not found"
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Invalid credentials"
      });
    }

    const currentDeviceName =
      req.headers[
        "user-agent"
      ] ||
      "Unknown Device";

    //-----------------------------------
    // Check existing device
    //-----------------------------------
    const existingDevice =
      await Device.findOne({
        userId: user._id,
        deviceName:
          currentDeviceName
      });

    //-----------------------------------
    // No device found → redirect to link
    //-----------------------------------
    if (!existingDevice) {
      return res.status(200).json({
        message:
          "New device detected. Please link this device first.",
        redirect:
          "/private-space/link",
        user
      });
    }

    //-----------------------------------
    // Device pending approval
    //-----------------------------------
    if (
      existingDevice.status ===
      "pending"
    ) {
      return res.status(200).json({
        message:
          "Your device request is waiting for approval from main device.",
        redirect:
          "/private-space/link",
        user
      });
    }

    //-----------------------------------
    // Device logged out
    //-----------------------------------
    if (
      existingDevice.status ===
      "logged_out"
    ) {
      return res.status(403).json({
        message:
          "This device was logged out by main device."
      });
    }

    //-----------------------------------
    // Device approved → login allowed
    //-----------------------------------
    const token =
      jwt.sign(
        {
          id: user._id
        },
        process.env
          .JWT_SECRET,
        {
          expiresIn:
            "7d"
        }
      );

    res.status(200).json({
      message:
        "Login successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({
      message:
        error.message
    });
  }
};