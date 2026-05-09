const Contact = require("../models/Contact");


// Add new contact
exports.addContact = async (req, res) => {
  try {
    const { userId, contactId } = req.body;

    // Prevent duplicate contacts
    const existingContact =
      await Contact.findOne({
        userId,
        contactId
      });

    if (existingContact) {
      return res.json({
        message: "Contact already added"
      });
    }

    const newContact =
      await Contact.create({
        userId,
        contactId
      });

    res.status(201).json(newContact);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get all saved contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts =
      await Contact.find({
        userId: req.params.userId
      }).populate("contactId");

    res.status(200).json(contacts);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};