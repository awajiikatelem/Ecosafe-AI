const express = require("express");
const router = express.Router();
const db = require("../database");
const verifyToken = require("../Middleware/verifyToken");

/* ================= CREATE ALERT ================= */

router.post("/alerts", verifyToken, (req, res) => {
  const { title, message, level, target, method } = req.body;

  const methods = JSON.stringify(method);

  db.run(
    `INSERT INTO alerts (title, message, level, target, methods)
     VALUES (?, ?, ?, ?, ?)`,
    [title, message, level, target, methods],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json({
        message: "Alert broadcasted successfully",
        alertId: this.lastID,
      });
    }
  );
});

/* ================= GET ALERTS ================= */

router.get("/alerts", verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM alerts ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json(rows);
    }
  );
});

module.exports = router;