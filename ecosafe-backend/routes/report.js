const express = require("express");
const router = express.Router();
const db = require("../database");
const verifyToken = require("../Middleware/verifyToken");

router.post("/report", verifyToken, (req, res) => {
  const {
  title,
  description,
  category,
  location,
  latitude,
  longitude,
  image,
} = req.body;

/* AI DETECTS PRIORITY */
const priority = detectPriority(description);

if (priority === "Critical") {
  console.log("🚨 AI CRITICAL ALERT DETECTED");
}

  const userId = req.user.id;

  const sql = `
    INSERT INTO reports (
    user_id,
    title,
    description,
    category,
    location,
    priority,
    latitude,
    longitude,
    image,
    status
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

  db.run(
    sql,
    [
       req.user.id,
    title,
    description,
    category,
    location,
    priority,
    latitude,
    longitude,
    image,
    "Pending",
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json({
        message: "Report submitted successfully",
      });
    }
  );
});

/* GET MY REPORTS */
router.get("/my", verifyToken, (req, res) => {
  db.all(
    "SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

/* DELETE REPORT */
router.delete("/:id", verifyToken, (req, res) => {
  db.run(
    "DELETE FROM reports WHERE id=? AND user_id=?",
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json(err);
      if (this.changes === 0)
        return res.status(403).json({ message: "Not allowed" });

      res.json({ message: "Deleted" });
    }
  );
});

module.exports = router;