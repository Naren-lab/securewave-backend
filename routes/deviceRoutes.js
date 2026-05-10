const express = require("express");
const router = express.Router();

const {
  linkDevice,
  getDevices,
  removeDevice,
  forceLogoutDevice,
  approveDevice,
  grantPrivateAccess,
  removePrivateAccess
} = require("../controllers/deviceController");

router.post("/link", linkDevice);

router.get("/:userId", getDevices);

router.put("/approve/:deviceId", approveDevice);

router.put(
  "/private-access/:deviceId",
  grantPrivateAccess
);

router.put(
  "/remove-private/:deviceId",
  removePrivateAccess
);

router.put(
  "/logout/:deviceId",
  forceLogoutDevice
);

router.delete(
  "/:deviceId",
  removeDevice
);

module.exports = router;