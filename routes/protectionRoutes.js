const express = require("express");
const router = express.Router();

const {
  setProtectionPassword,
  verifyProtectionPassword,
  disableProtection
} = require("../controllers/protectionController");

router.post("/set", setProtectionPassword);
router.post("/verify", verifyProtectionPassword);
router.post("/disable", disableProtection);

module.exports = router;