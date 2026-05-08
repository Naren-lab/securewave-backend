const Contact = require("../models/Contact");

const addContact = async (req, res) => {
  try {
    const { userId, contactId } = req.body;

    const existing = await Contact.findOne({
      userId,
      contactId
    });

    if (existing) {
      return res.status(400).json({
        message: "Contact already added"
      });
    }

    const contact = await Contact.create({
      userId,
      contactId
    });

    res.status(201).json(contact);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = { addContact };