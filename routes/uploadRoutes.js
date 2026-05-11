const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// ---------------- STORAGE ----------------
const storage = multer.diskStorage({
  destination: function (
    req,
    file,
    cb
  ) {
    cb(
      null,
      "uploads/"
    );
  },

  filename: function (
    req,
    file,
    cb
  ) {
    const uniqueName =
      Date.now() +
      path.extname(
        file.originalname
      );

    cb(
      null,
      uniqueName
    );
  },
});

// ---------------- MULTER ----------------
const upload = multer({
  storage: storage,
});

// ---------------- UPLOAD ROUTE ----------------
router.post(
  "/",
  upload.single("file"),
  (req, res) => {
    try {
      if (
        !req.file
      ) {
        return res
          .status(400)
          .json({
            message:
              "No file uploaded",
          });
      }

      console.log(
        "Uploaded File:",
        req.file
      );

      // Detect file type
      let fileType =
        "document";

      if (
        req.file.mimetype.startsWith(
          "image"
        )
      ) {
        fileType =
          "image";
      }

      res
        .status(200)
        .json({
          fileUrl: `/uploads/${req.file.filename}`,
          fileType:
            fileType,
        });
    } catch (
      error
    ) {
      console.log(
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message,
        });
    }
  }
);

module.exports =
  router;