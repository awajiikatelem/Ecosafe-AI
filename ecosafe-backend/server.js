const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const db = require("./db");
const verifyToken = require("./middleware/verifyToken");
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EcoSafe backend running on http://localhost:${PORT}`)
}); 

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

// Fetch my reports
app.get("/myreports", verifyToken, async (req, res) => {
  try {
    const rows = await db.report.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" }
    });
    
    // Parse JSON string of ai_tips for frontend convenience
    const parsedRows = rows.map(row => {
      try {
        row.ai_tips = row.ai_tips ? JSON.parse(row.ai_tips) : [];
      } catch (e) {
        row.ai_tips = [];
      }
      return row;
    });

    res.json(parsedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete report
app.delete("/report/:id", verifyToken, async (req, res) => {
  try {
    const reportId = req.params.id;
    const result = await db.report.deleteMany({
      where: {
        id: reportId,
        user_id: req.user.id
      }
    });
    
    if (result.count === 0) return res.status(403).json({ error: "Unauthorized or not found" });
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all reports (Public - Map and Dashboard)
app.get("/reports", async (req, res) => {
  try {
    const rows = await db.report.findMany({
      orderBy: { created_at: "desc" }
    });
    
    const parsedRows = rows.map(row => {
      try {
        row.ai_tips = row.ai_tips ? JSON.parse(row.ai_tips) : [];
      } catch (e) {
        row.ai_tips = [];
      }
      return row;
    });
    res.json(parsedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alias for dashboard GET /report
app.get("/report", async (req, res) => {
  try {
    const rows = await db.report.findMany({
      orderBy: { created_at: "desc" }
    });
    
    const parsedRows = rows.map(row => {
      try {
        row.ai_tips = row.ai_tips ? JSON.parse(row.ai_tips) : [];
      } catch (e) {
        row.ai_tips = [];
      }
      return row;
    });
    res.json(parsedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alias for Map (all-reports)
app.get("/all-reports", async (req, res) => {
  try {
    const rows = await db.report.findMany({
      orderBy: { created_at: "desc" }
    });
    
    const parsedRows = rows.map(row => {
      try {
        row.ai_tips = row.ai_tips ? JSON.parse(row.ai_tips) : [];
      } catch (e) {
        row.ai_tips = [];
      }
      return row;
    });
    res.json(parsedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fire Outbreak Multi-Part Form Endpoint
app.post("/api/FireOutbreak", upload.single("image"), async (req, res) => {
  const { fullname, phone, location, description } = req.body;

  if (!fullname || !phone || !location || !description) {
    return res.status(400).json({ error: "Missing required fire emergency fields" });
  }

  // Convert buffer to Base64 data URI if uploaded
  let imageBase64 = null;
  if (req.file) {
    imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  }

  const priority = "Critical";
  const category = "Fire Outbreak";
  const title = `🚨 Fire outbreak reported by ${fullname}`;
  const descWithContact = `${description} [Reporter contact: ${phone}]`;

  try {
    // AI Analysis and Verification
    const aiAnalysis = analyzeAndPrioritizeAI(category, title, descWithContact, imageBase64, location);
    const aiVerify = verifyReportAI(category, descWithContact, imageBase64, location);

    const aiTipsList = generateSafetyTips(category, title, descWithContact);
    const aiTips = JSON.stringify(aiTipsList);

    // Image verification
    const imageVerification = validateImageAI(category, imageBase64);
    const aiImageValid = imageVerification.isValid;
    const aiImageAnalysis = imageVerification.analysis;

    // Extract optional Authorization token to reward users
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, SECRET);
        userId = decoded.id;
      } catch (e) {
        console.log("Guest fire outbreak report (invalid or missing auth token)");
      }
    }

    const report = await db.report.create({
      data: {
        user_id: userId,
        title,
        description: descWithContact,
        category,
        location,
        priority,
        image: imageBase64,
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

    // Automatically create a public alert for fire outbreaks
    await db.alert.create({
      data: {
        title: `🚨 IMMEDIATE FIRE ALERT: ${location}`,
        message: `A critical fire outbreak has been reported at ${location}. Description: ${description}. Evacuate the area immediately and steer clear.`,
        level: "Critical",
        target: "All Residents"
      }
    });

    // Trigger SMS dispatch for the fire outbreak
    broadcastSMSAI(reportId, location, category, "Critical", location, (smsErr) => {
      if (smsErr) console.error("Error broadcasting automated SMS for fire outbreak:", smsErr);
    });

    // Reward points if user was logged in (+15 points)
    if (userId) {
      updateUserPointsAndBadge(userId, 15, () => {
        res.json({ message: "Fire report submitted, public alerts broadcasted.", priority, pointsAwarded: 15 });
      });
    } else {
      res.json({ message: "Fire report submitted successfully as guest.", priority });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= ADMIN INTERFACES ================= */

// Admin Login
app.post("/admin/login", async (req, res) => {
  const { organization, email, password, accessCode } = req.body;

  if (!organization || !email || !password || !accessCode) {
    return res.status(400).json({ error: "Missing admin login credentials" });
  }

  if (accessCode !== "ECO-SECURE-001") {
    return res.status(403).json({ error: "Invalid Admin Access Code" });
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Account not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong credentials" });

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Account is not registered as an authorized administrator" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, organization }, SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin get all reports
app.get("/admin/reports", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  try {
    const rows = await db.report.findMany({
      orderBy: { created_at: "desc" }
    });
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin stats
app.get("/admin/stats", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  try {
    const total = await db.report.count();
    const pending = await db.report.count({ where: { status: "Pending" } });
    const resolved = await db.report.count({ where: { status: "Approved" } });
    const critical = await db.report.count({ where: { priority: "Critical" } });

    res.json({ total, pending, resolved, critical });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy Endpoint for status updates
app.put("/report/:id", verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    const reportId = req.params.id;
    await db.report.update({
      where: { id: reportId },
      data: { status }
    });
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update report status (and award points to reporter)
app.put("/admin/report/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const { status } = req.body;
  const reportId = req.params.id;

  try {
    const report = await db.report.findUnique({
      where: { id: reportId }
    });
    if (!report) return res.status(404).json({ error: "Report not found" });

    await db.report.update({
      where: { id: reportId },
      data: { status }
    });

    // Recalculate community risk in background
    if (report.location) {
      updateCommunityRisk(report.location, (riskErr) => {
        if (riskErr) console.error("Error updating community risk on admin status change:", riskErr);
      });
    }

    // If the report is newly approved, reward the reporter!
    if (status === "Approved" && report.status !== "Approved" && report.user_id) {
      updateUserPointsAndBadge(report.user_id, 50, (err) => {
        if (err) console.error("Error awarding points to reporter:", err);
        res.json({ message: "Report approved, reporter rewarded 50 points." });
      });
    } else {
      res.json({ message: "Report status updated to: " + status });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= ALERTS SYSTEMS ================= */

// Legacy Get alerts
app.get("/alerts", async (req, res) => {
  try {
    const rows = await db.alert.findMany({
      orderBy: { created_at: "desc" }
    });
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Alerts feed
app.get("/public/alerts", async (req, res) => {
  try {
    const rows = await db.alert.findMany({
      orderBy: { created_at: "desc" }
    });
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Alerts get
app.get("/admin/alerts", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  try {
    const rows = await db.alert.findMany({
      orderBy: { created_at: "desc" }
    });
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Alerts broadcast create
app.post("/admin/alerts", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const { title, message, level, target } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  try {
    const newAlert = await db.alert.create({
      data: {
        title,
        message,
        level: level || "Medium",
        target: target || "All Residents"
      }
    });
    res.json({ message: "Alert broadcasted successfully", id: newAlert.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= AI LAYER API ROUTES ================= */

// POST /chatbot: user endpoint for environmental assistant
app.post("/chatbot", (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  handleChatbotQuery(query, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ response });
  });
});

// GET /community-risks: retrieve calculated community safety risks
app.get("/community-risks", async (req, res) => {
  try {
    const rows = await db.communityRisk.findMany({
      orderBy: { risk_score: "desc" }
    });
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/broadcast-sms: broadcast SMS to users/communities using simulated or direct Twilio configurations
app.post("/admin/broadcast-sms", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const { community, hazardType, severity, message } = req.body;

  if (!community || !message) {
    return res.status(400).json({ error: "Missing community or message content" });
  }

  try {
    const provider = process.env.SMS_PROVIDER || "Twilio";
    const broadcast = await db.smsBroadcast.create({
      data: {
        incident_id: null,
        community,
        message,
        status: "SENT (ADMIN BROADCAST)",
        provider
      }
    });
    console.log(`[ADMIN SMS BROADCAST via ${provider}] to residents of ${community}: "${message}"`);
    res.json({ message: "SMS broadcast sent successfully", id: broadcast.id, provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/ai-recommendations: fetch auto-generated hazard remediation lists
app.get("/admin/ai-recommendations", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  getAIRecommendations((err, recommendations) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(recommendations || []);
  });
});

// GET /admin/sms-logs: display all sent SMS logs
app.get("/admin/sms-logs", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  try {
    const rows = await db.smsBroadcast.findMany({
      orderBy: { created_at: "desc" }
    });
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EcoSafe backend running on http://localhost:${PORT}`);
  seedAdmin();
});