const express = require("express");
const router = express.Router();
const db = require("../database");
const verifyToken = require("../Middleware/verifyToken");

// GET USER REPORTS
router.get("/MyReport", verifyToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    "SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;

