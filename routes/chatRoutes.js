const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages
} = require("../controllers/chatController");

// Send message
router.post("/send", sendMessage);

// Get old messages
router.get(
  "/messages/:senderId/:receiverId",
  getMessages
);

module.exports = router;