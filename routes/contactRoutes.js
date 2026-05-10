const express =
  require("express");

const router =
  express.Router();

const {
  addContact,
  getContacts,
} = require(
  "../controllers/contactController"
);

/* Add new contact */
router.post(
  "/add",
  addContact
);

/* Get all contacts for user */
router.get(
  "/:userId",
  getContacts
);

module.exports =
  router;