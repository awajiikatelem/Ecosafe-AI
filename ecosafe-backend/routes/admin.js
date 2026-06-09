const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");

const SECRET = "ecosafe-secret";

/* ================= ADMIN LOGIN ================= */

router.post("/login", (req, res) => {
  const { organization, email, password, accessCode } = req.body;

  db.get(
    `SELECT * FROM admins
     WHERE organization = ?
     AND email = ?
     AND access_code = ?`,
    [organization, email, accessCode],
    async (err, admin) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!admin) {
        return res.status(401).json({
          error: "Unauthorized organization",
        });
      }

      const valid = await bcrypt.compare(password, admin.password);

      if (!valid) {
        return res.status(401).json({
          error: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          id: admin.id,
          role: "admin",
        },
        SECRET
      );

      res.json({
        token,
        admin,
      });
    }
  );
});

module.exports = router;