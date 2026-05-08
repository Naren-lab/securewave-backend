const User = require("../models/User");


// Set password
exports.setProtectionPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    await User.findByIdAndUpdate(userId, {
      protectionEnabled: true,
      protectionPassword: password
    });

    res.json({
      message: "Protection enabled"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Verify password
exports.verifyProtectionPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findById(userId);

    if (user.protectionPassword !== password) {
      return res.status(400).json({
        message: "Wrong password"
      });
    }

    res.json({
      message: "Access granted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Disable protection
exports.disableProtection = async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, {
      protectionEnabled: false,
      protectionPassword: ""
    });

    res.json({
      message: "Protection disabled"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};