const express = require("express");
const router = express.Router();

const {
  registerMainDevice,
  linkDevice,
  getDevices,
  removeDevice,
  forceLogoutDevice,
  approveDevice,
  grantPrivateAccess,
  removePrivateAccess,
  makeDeviceMain
} = require("../controllers/deviceController");


/* -----------------------------------
   Register Main Device
----------------------------------- */
router.post(
  "/register-main",
  registerMainDevice
);


/* -----------------------------------
   Link New Device
----------------------------------- */
router.post(
  "/link",
  linkDevice
);


/* -----------------------------------
   Get All Devices
----------------------------------- */
router.get(
  "/:userId",
  getDevices
);


/* -----------------------------------
   Approve Device
----------------------------------- */
router.put(
  "/approve/:deviceId",
  approveDevice
);


/* -----------------------------------
   Grant Private Access
----------------------------------- */
router.put(
  "/private-access/:deviceId",
  grantPrivateAccess
);


/* -----------------------------------
   Remove Private Access
----------------------------------- */
router.put(
  "/remove-private/:deviceId",
  removePrivateAccess
);


/* -----------------------------------
   Force Logout Device
----------------------------------- */
router.put(
  "/logout/:deviceId",
  forceLogoutDevice
);


/* -----------------------------------
   Remove Device
----------------------------------- */
router.delete(
  "/:deviceId",
  removeDevice
);


/* -----------------------------------
   Make New Device Main
----------------------------------- */
router.post(
  "/make-main",
  makeDeviceMain
);

module.exports = router;