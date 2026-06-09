const express = require("express");
const router = express.Router();
const db = require("../database");
const multer = require("multer");
const path = require("path");

// IMAGE STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST FIRE REPORT
router.post("/report-fire", upload.single("image"), (req, res) => {
  const { fullname, phone, location, description } = req.body;
  const image = req.file ? req.file.filename : null;

  db.run(
    `INSERT INTO fire_reports (fullname, phone, location, description, image)
     VALUES (?, ?, ?, ?, ?)`,
    [fullname, phone, location, description, image],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ message: "Fire report saved successfully" });
    }
  );
});

module.exports = router;