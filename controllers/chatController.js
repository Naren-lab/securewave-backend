const Message = require("../models/Message");


// Save Message
exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const newMessage = await Message.create({
      sender,
      receiver,
      message
    });

    res.status(201).json(newMessage);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get Messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};