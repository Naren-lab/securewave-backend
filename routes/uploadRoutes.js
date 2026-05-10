const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

// Multer upload setup
const upload = multer({
  storage: storage
});

// Upload route
router.post(
  "/",
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }

      console.log("Uploaded File:", req.file);

      res.status(200).json({
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype
      });

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: error.message
      });
    }
  }
);

module.exports = router;