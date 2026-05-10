const Contact = require("../models/Contact");

/* ---------------- ADD CONTACT ---------------- */
exports.addContact = async (req, res) => {
  try {
    const { userId, contactId } = req.body;

    // Prevent adding yourself
    if (userId === contactId) {
      return res.status(400).json({
        message: "You cannot add yourself",
      });
    }

    // Prevent duplicate contacts
    const existingContact =
      await Contact.findOne({
        userId,
        contactId,
      });

    if (existingContact) {
      return res.status(400).json({
        message:
          "Contact already added",
      });
    }

    const newContact =
      await Contact.create({
        userId,
        contactId,
      });

    res.status(201).json({
      message:
        "Contact added successfully",
      contact: newContact,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

/* ---------------- GET CONTACTS ---------------- */
exports.getContacts = async (req, res) => {
  try {
    const contacts =
      await Contact.find({
        userId:
          req.params.userId,
      }).populate(
        "contactId",
        "name email"
      );

    res.status(200).json(
      contacts
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};