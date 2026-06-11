const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "ecosafe-secret";

function verifyToken(req, res, next) {
  // Get token from Authorization header (Format: Bearer <token>)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, SECRET);
    req.user = verified; // Attaches { id, role } to the request object
    next(); // Pass control to the next route handler
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
}

module.exports = verifyToken;
