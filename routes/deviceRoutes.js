const express = require("express");
const router = express.Router();

const {
  linkDevice,
  getDevices,
  removeDevice,
  forceLogoutDevice
} = require("../controllers/deviceController");

router.post("/link", linkDevice);
router.get("/:userId", getDevices);
router.delete("/:deviceId", removeDevice);
router.put("/logout/:deviceId", forceLogoutDevice);

module.exports = router;