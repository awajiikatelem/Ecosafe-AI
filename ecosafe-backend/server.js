const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const db = require("./db");
const verifyToken = require("./Middleware/verifyToken");
const { generateSafetyTips, validateImageAI } = require("./ai/aiHelper");
const detectPriority = require("./ai/detectPriority");
const {
  analyzeAndPrioritizeAI,
  verifyReportAI,
  broadcastSMSAI,
  handleChatbotQuery,
  updateCommunityRisk,
  getAIRecommendations
} = require("./ai/aiServices");

const app = express();
const SECRET = process.env.JWT_SECRET || "ecosafe-secret";

// Configure cors and JSON size limits
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// Configure multer for memory storage (for Fire Outbreak multipart form uploads)
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });

/* ================= BADGES & REWARDS HELPER ================= */
function getBadge(points) {
  if (points < 20) return "Eco Novice 🛡️";
  if (points < 60) return "Green Scout 🌿";
  if (points < 150) return "Hazard Hunter 🔍";
  if (points < 300) return "Eco Warrior ⚔️";
  return "Planet Guardian 🌎";
}

async function updateUserPointsAndBadge(userId, pointsToAdd, callback) {
  if (!userId) {
    if (callback) callback(null, null);
    return;
  }
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      if (callback) callback(new Error("User not found"));
      return;
    }
    const currentPoints = user.points || 0;
    const newPoints = currentPoints + pointsToAdd;
    const newBadge = getBadge(newPoints);

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        points: newPoints,
        badge: newBadge
      }
    });

    console.log(`User ${userId} awarded ${pointsToAdd} points. New total: ${newPoints} (${newBadge})`);
    if (callback) callback(null, updatedUser);
  } catch (err) {
    if (callback) callback(err);
  }
}

/* ================= SEED ADMIN USER ================= */
const seedAdmin = async () => {
  const adminEmail = "admin@ecosafe.ng";
  try {
    const row = await db.user.findUnique({ where: { email: adminEmail } });
    if (!row) {
      const hash = await bcrypt.hash("admin323", 10);
      await db.user.create({
        data: {
          name: "NESREA Admin Officer",
          email: adminEmail,
          password: hash,
          role: "admin",
          points: 1000,
          badge: "Planet Guardian 🌎"
        }
      });
      console.log("Seeded admin user: admin@ecosafe.ng / admin323");
    }
  } catch (err) {
    console.error("Error seeding admin user:", err);
  }
};

/* ================= AUTHENTICATION ================= */

// Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        name,
        email,
        password: hash,
        role: "user"
      }
    });
    res.json({ message: "User created" });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email/password" });
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Profile Info
app.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        badge: true
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const rows = await db.user.findMany({
      where: { role: "user" },
      select: {
        name: true,
        points: true,
        badge: true
      },
      orderBy: [
        { points: "desc" },
        { name: "asc" }
      ],
      take: 15
    });
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= REPORT SUBMISSIONS ================= */

// Create standard hazard report
app.post("/report", verifyToken, async (req, res) => {
  const {
    title,
    description,
    category,
    location,
    latitude,
    longitude,
    image,
  } = req.body;

  if (!title || !description || !category || !location) {
    return res.status(400).json({ error: "Missing required report details" });
  }

  try {
    // AI Report Analysis and Prioritization
    const aiAnalysis = analyzeAndPrioritizeAI(category, title, description, image, location);

    // AI Verification and Moderation
    const aiVerify = verifyReportAI(category, description, image, location);

    const priority = aiAnalysis.priority || detectPriority(title + " " + description);
    const aiTipsList = generateSafetyTips(category, title, description);
    const aiTips = JSON.stringify(aiTipsList);

    // AI Evidence Verification (legacy compatibility)
    const imageVerification = validateImageAI(category, image);
    const aiImageValid = imageVerification.isValid;
    const aiImageAnalysis = imageVerification.analysis;

    const report = await db.report.create({
      data: {
        user_id: req.user.id,
        title,
        description,
        category,
        location,
        latitude: latitude ? String(latitude) : null,
        longitude: longitude ? String(longitude) : null,
        priority,
        image,
        ai_tips: aiTips,
        ai_image_valid: aiImageValid,
        ai_image_analysis: aiImageAnalysis,
        ai_hazard_type: aiAnalysis.hazardType,
        ai_severity: aiAnalysis.severity,
        ai_confidence: aiAnalysis.confidence,
        ai_risk_level: aiAnalysis.riskLevel,
        ai_recommendation: aiAnalysis.recommendation,
        ai_assigned_agency: aiAnalysis.assignedAgency,
        ai_verification_status: aiVerify.status,
        ai_verification_reason: aiVerify.reason
      }
    });

    const reportId = report.id;

    // Update community risk statistics in the background
    updateCommunityRisk(location, (riskErr) => {
      if (riskErr) console.error("Error updating community risk:", riskErr);
    });

    // If critical/high severity or SMS alert required, dispatch automated alert
    if (aiAnalysis.alertRequired || aiAnalysis.severity === "Critical" || aiAnalysis.severity === "High") {
      broadcastSMSAI(reportId, location, aiAnalysis.hazardType, aiAnalysis.severity, location, (smsErr) => {
        if (smsErr) console.error("Error broadcasting automated SMS:", smsErr);
      });
    }

    // Reward points: +10 base points, +5 if valid image evidence uploaded
    const pointsToAward = aiImageValid === 1 ? 15 : 10;
    updateUserPointsAndBadge(req.user.id, pointsToAward, (err, rewardInfo) => {
      res.json({
        message: "Report submitted",
        priority,
        aiTips: aiTipsList,
        aiImageValid,
        aiImageAnalysis,
        pointsAwarded: pointsToAward,
        newBalance: rewardInfo ? rewardInfo.points : 0,
        ai_verification_status: aiVerify.status,
        ai_verification_reason: aiVerify.reason
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= PORT INITIALIZATION ================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EcoSafe backend running on port ${PORT}`);
});
