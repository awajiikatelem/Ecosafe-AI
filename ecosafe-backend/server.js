const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");
const nodemailer = require("nodemailer");

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
  getAIRecommendations,
  generateBroadcastAI
} = require("./ai/aiServices");

const app = express();
const SECRET = process.env.JWT_SECRET || "ecosafe-secret";

// Configure cors and JSON size limits
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// Configure multer for memory storage (for Fire Outbreak multipart form uploads)
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });

// Create HTTP Server and Socket.IO Instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Mount socket io instance onto request objects
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Track Socket connections
io.on("connection", (socket) => {
  console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);
  
  // Custom room joining for user targeted notifications
  socket.on("join-user", (userId) => {
    socket.join(userId);
    console.log(`👤 Client ${socket.id} joined user room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected from Socket.IO: ${socket.id}`);
  });
});

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

  // 1. Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address format" });
  }

  // 2. Password strength validation (min 8 chars, at least one letter and one number)
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return res.status(400).json({ error: "Password must contain both letters and numbers" });
  }

  try {
    // 3. Duplicate email prevention
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        name,
        email,
        password: hash,
        role: "user"
      }
    });
    res.json({ message: "User created successfully" });
  } catch (err) {
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

// Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Missing email or new password" });
  }

  // Password strength validation
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
  }
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  if (!hasLetter || !hasNumber) {
    return res.status(400).json({ error: "Password must contain both letters and numbers" });
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "No account found with that email address" });

    const hash = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { email },
      data: { password: hash }
    });

    res.json({ message: "Password updated successfully" });
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

// AI analysis and image diagnostics preview endpoint (called before submission)
app.post("/report/analyze-preview", async (req, res) => {
  const { title, description, category, location, image } = req.body;
  if (!category || !title || !description || !location) {
    return res.status(400).json({ error: "Provide title, description, category and location for AI preview" });
  }

  try {
    const aiAnalysis = analyzeAndPrioritizeAI(category, title, description, image, location);
    res.json({
      hazardType: aiAnalysis.hazardType,
      severity: aiAnalysis.severity,
      confidence: aiAnalysis.confidence,
      assignedAgency: aiAnalysis.assignedAgency,
      recommendation: aiAnalysis.recommendation,
      severityExplanation: aiAnalysis.severityExplanation,
      detectedHazards: aiAnalysis.detectedHazards
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

    const priority = aiAnalysis.severity;
    const aiTipsList = generateSafetyTips(category, title, description);
    const aiTips = JSON.stringify(aiTipsList);

    // AI Evidence Verification
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
        ai_verification_reason: aiVerify.reason,
        ai_severity_explanation: aiAnalysis.severityExplanation,
        ai_detected_hazards: aiAnalysis.detectedHazards
      }
    });

    const reportId = report.id;

    // Real-Time Emit to all dashboard/map panels
    if (req.io) {
      req.io.emit("new-report", report);
    }

    // Update community risk statistics in the background
    updateCommunityRisk(location, (riskErr) => {
      if (riskErr) console.error("Error updating community risk:", riskErr);
      db.communityRisk.findMany({ orderBy: { risk_score: "desc" } })
        .then(risks => {
          if (req.io) req.io.emit("community-risks-updated", risks);
        }).catch(() => {});
    });

    // Smart AI Broadcast Agent logic: Trigger alerts automatically on critical/high severity
    if (aiAnalysis.alertRequired || aiAnalysis.severity === "Critical" || aiAnalysis.severity === "High") {
      const alertTitle = `🚨 AI ALERT: Critical ${aiAnalysis.hazardType} hazard in ${location}`;
      const alertMsg = `AI Alert: Critical flood/environmental risk detected around ${location}. Residents should avoid the area immediately. Safety Recommendation: ${aiAnalysis.recommendation}`;
      
      const newAlert = await db.alert.create({
        data: {
          title: alertTitle,
          message: alertMsg,
          level: aiAnalysis.severity,
          target: "All Residents"
        }
      });

      if (req.io) {
        req.io.emit("new-alert", newAlert);
      }

      // Create a global notification entry for the warning
      const smartNotif = await db.notification.create({
        data: {
          title: alertTitle,
          message: alertMsg,
          type: "AI_WARNING"
        }
      });

      if (req.io) {
        req.io.emit("new-notification", smartNotif);
      }

      broadcastSMSAI(reportId, location, aiAnalysis.hazardType, aiAnalysis.severity, location, (smsErr) => {
        if (smsErr) console.error("Error broadcasting automated SMS:", smsErr);
      });
    }

    // Create confirmation notification for reporter
    const reporterNotif = await db.notification.create({
      data: {
        user_id: req.user.id,
        title: "Report Filed",
        message: `Your report '${title}' has been submitted and is pending verification.`,
        type: "REPORT_SUBMITTED"
      }
    });

    if (req.io) {
      req.io.to(req.user.id).emit("new-notification", reporterNotif);
      req.io.emit("new-notification", reporterNotif);
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
        ai_verification_reason: aiVerify.reason,
        ai_severity_explanation: aiAnalysis.severityExplanation,
        ai_detected_hazards: aiAnalysis.detectedHazards
      }
    });

    const reportId = report.id;

    // Socket Emit
    if (req.io) {
      req.io.emit("new-report", report);
    }

    // Update community risk statistics in the background
    updateCommunityRisk(location, (riskErr) => {
      if (riskErr) console.error("Error updating community risk:", riskErr);
      db.communityRisk.findMany({ orderBy: { risk_score: "desc" } })
        .then(risks => {
          if (req.io) req.io.emit("community-risks-updated", risks);
        }).catch(() => {});
    });

    // Automatically create a public alert for fire outbreaks
    const newAlert = await db.alert.create({
      data: {
        title: `🚨 IMMEDIATE FIRE ALERT: ${location}`,
        message: `A critical fire outbreak has been reported at ${location}. Description: ${description}. Evacuate the area immediately and steer clear.`,
        level: "Critical",
        target: "All Residents"
      }
    });

    if (req.io) {
      req.io.emit("new-alert", newAlert);
    }

    // Generate Smart Notification for this alert
    const smartNotif = await db.notification.create({
      data: {
        title: `🚨 IMMEDIATE FIRE ALERT: ${location}`,
        message: `Critical fire outbreak reported at ${location}. Evacuate immediately.`,
        type: "AI_WARNING"
      }
    });

    if (req.io) {
      req.io.emit("new-notification", smartNotif);
    }

    // Trigger SMS dispatch for the fire outbreak
    broadcastSMSAI(reportId, location, category, "Critical", location, (smsErr) => {
      if (smsErr) console.error("Error broadcasting automated SMS for fire outbreak:", smsErr);
    });

    // Reward points if user was logged in (+15 points)
    if (userId) {
      const uNotif = await db.notification.create({
        data: {
          user_id: userId,
          title: "Fire Emergency Submitted",
          message: `Your fire report at '${location}' was submitted. +15 points rewarded.`,
          type: "REPORT_SUBMITTED"
        }
      });
      if (req.io) {
        req.io.to(userId).emit("new-notification", uNotif);
        req.io.emit("new-notification", uNotif);
      }

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
    // Include user details of the reporter
    const rows = await db.report.findMany({
      orderBy: { created_at: "desc" }
    });

    // Populate user profile info for frontend Command Center mapping
    const populated = await Promise.all(rows.map(async (row) => {
      let reporterInfo = null;
      if (row.user_id) {
        reporterInfo = await db.user.findUnique({
          where: { id: row.user_id },
          select: { name: true, email: true, points: true, badge: true }
        });
      }
      return { ...row, reporter: reporterInfo };
    }));

    res.json(populated || []);
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
    const resolved = await db.report.count({ where: { status: "Resolved" } });
    const critical = await db.report.count({ where: { priority: "Critical" } });

    res.json({ total, pending, resolved, critical });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Deep Analytics
app.get("/admin/analytics-deep", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  try {
    const allReports = await db.report.findMany({ orderBy: { created_at: "desc" } });
    const allUsers = await db.user.findMany({ where: { role: "user" }, select: { id: true, name: true, points: true, badge: true, created_at: true } });
    const communityRisks = await db.communityRisk.findMany({ orderBy: { risk_score: "desc" } });

    // --- Category Breakdown ---
    const categoryMap = {};
    allReports.forEach(r => {
      const cat = r.category || "Unknown";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // --- Status Breakdown ---
    const statusMap = { Pending: 0, Approved: 0, Resolved: 0, Rejected: 0 };
    allReports.forEach(r => {
      const s = r.status || "Pending";
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusMap).map(([name, count]) => ({ name, count }));

    // --- Priority Breakdown ---
    const priorityMap = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    allReports.forEach(r => {
      const p = r.priority || "Medium";
      priorityMap[p] = (priorityMap[p] || 0) + 1;
    });
    const priorityBreakdown = Object.entries(priorityMap).map(([name, count]) => ({ name, count }));

    // --- Agency Performance ---
    const agencyMap = {};
    allReports.forEach(r => {
      const ag = r.ai_assigned_agency || "General Response";
      if (!agencyMap[ag]) agencyMap[ag] = { total: 0, resolved: 0 };
      agencyMap[ag].total++;
      if (r.status === "Resolved") agencyMap[ag].resolved++;
    });
    const agencyPerformance = Object.entries(agencyMap)
      .map(([agency, data]) => ({
        agency,
        total: data.total,
        resolved: data.resolved,
        rate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // --- Daily Trend (last 14 days) ---
    const trendMap = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap[key] = { date: key, incidents: 0, resolved: 0 };
    }
    allReports.forEach(r => {
      const key = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (trendMap[key]) {
        trendMap[key].incidents++;
        if (r.status === "Resolved") trendMap[key].resolved++;
      }
    });
    const dailyTrend = Object.values(trendMap);

    // --- Top Hotspot Locations ---
    const locationMap = {};
    allReports.forEach(r => {
      if (r.location) {
        locationMap[r.location] = (locationMap[r.location] || 0) + 1;
      }
    });
    const topHotspots = Object.entries(locationMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // --- Key Metrics ---
    const total = allReports.length;
    const resolved = allReports.filter(r => r.status === "Resolved").length;
    const critical = allReports.filter(r => r.priority === "Critical").length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const avgConfidence = allReports.length > 0
      ? Math.round(allReports.reduce((acc, r) => acc + (r.ai_confidence || 0), 0) / allReports.length)
      : 0;

    res.json({
      summary: { total, resolved, critical, resolutionRate, avgConfidence, totalUsers: allUsers.length },
      categoryBreakdown,
      statusBreakdown,
      priorityBreakdown,
      agencyPerformance,
      dailyTrend,
      topHotspots,
      communityRisks: communityRisks.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy Endpoint for status updates
app.put("/report/:id", verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    const reportId = req.params.id;
    const report = await db.report.update({
      where: { id: reportId },
      data: { status }
    });

    if (req.io) {
      req.io.emit("report-updated", report);
    }

    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update report status (and award points to reporter)
app.put("/admin/report/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const { status } = req.body; // Can be Approved, Rejected, Resolved
  const reportId = req.params.id;

  try {
    const report = await db.report.findUnique({
      where: { id: reportId }
    });
    if (!report) return res.status(404).json({ error: "Report not found" });

    const oldStatus = report.status;
    const updated = await db.report.update({
      where: { id: reportId },
      data: { status }
    });

    // Real-Time sync notification
    if (req.io) {
      req.io.emit("report-updated", updated);
    }

    // Recalculate community risk in background
    if (report.location) {
      updateCommunityRisk(report.location, (riskErr) => {
        if (riskErr) console.error("Error updating community risk on admin status change:", riskErr);
        db.communityRisk.findMany({ orderBy: { risk_score: "desc" } })
          .then(risks => {
            if (req.io) req.io.emit("community-risks-updated", risks);
          }).catch(() => {});
      });
    }

    // Create Notification and reward logic
    if (status === "Approved" && oldStatus !== "Approved") {
      if (report.user_id) {
        const notif = await db.notification.create({
          data: {
            user_id: report.user_id,
            title: "Report Approved",
            message: `Your environmental report '${report.title}' has been APPROVED! +50 points rewarded.`,
            type: "REPORT_APPROVED"
          }
        });
        if (req.io) {
          req.io.to(report.user_id).emit("new-notification", notif);
          req.io.emit("new-notification", notif);
        }
        
        updateUserPointsAndBadge(report.user_id, 50, (err) => {
          if (err) console.error("Error awarding points to reporter:", err);
          res.json({ message: "Report approved, reporter rewarded 50 points." });
        });
        return;
      }
    } else if (status === "Rejected" && oldStatus !== "Rejected") {
      if (report.user_id) {
        const notif = await db.notification.create({
          data: {
            user_id: report.user_id,
            title: "Report Rejected",
            message: `Your report '${report.title}' was marked rejected. Reason: ${report.ai_verification_reason || "Verification failure"}`,
            type: "REPORT_REJECTED"
          }
        });
        if (req.io) {
          req.io.to(report.user_id).emit("new-notification", notif);
          req.io.emit("new-notification", notif);
        }
      }
    } else if (status === "Resolved" && oldStatus !== "Resolved") {
      if (report.user_id) {
        const notif = await db.notification.create({
          data: {
            user_id: report.user_id,
            title: "Incident Resolved",
            message: `The incident at '${report.location}' is officially resolved! Thank you for keeping our community safe.`,
            type: "REPORT_RESOLVED"
          }
        });
        if (req.io) {
          req.io.to(report.user_id).emit("new-notification", notif);
          req.io.emit("new-notification", notif);
        }
      }
    }

    res.json({ message: "Report status updated to: " + status });
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

    if (req.io) {
      req.io.emit("new-alert", newAlert);
    }

    // Trigger Notification center event
    const smartNotif = await db.notification.create({
      data: {
        title: `🚨 BULLETIN: ${title}`,
        message: message,
        type: "ALERT_ISSUED"
      }
    });

    if (req.io) {
      req.io.emit("new-notification", smartNotif);
    }

    res.json({ message: "Alert broadcasted successfully", id: newAlert.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= SMART NOTIFICATION FEEDS ================= */

// Retrieve notifications for authenticated user
app.get("/notifications", verifyToken, async (req, res) => {
  try {
    const list = await db.notification.findMany({
      where: {
        OR: [
          { user_id: req.user.id },
          { user_id: null } // Include public alerts
        ]
      },
      orderBy: { created_at: "desc" },
      take: 25
    });
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
app.put("/notifications/:id/read", verifyToken, async (req, res) => {
  try {
    await db.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json({ message: "Notification marked as read successfully" });
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
  const { community, message } = req.body;

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

    if (req.io) {
      req.io.emit("sms-broadcasted", broadcast);
    }

    console.log(`[ADMIN SMS BROADCAST via ${provider}] to residents of ${community}: "${message}"`);
    res.json({ message: "SMS broadcast sent successfully", id: broadcast.id, provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/broadcast-email: broadcast Email to all users
app.post("/admin/broadcast-email", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: "Missing subject or message content" });
  }

  try {
    const users = await db.user.findMany({ select: { email: true, name: true } });
    const userEmails = users.map(u => u.email).filter(Boolean);

    if (userEmails.length === 0) {
      return res.status(400).json({ error: "No registered users found to broadcast to." });
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">🌿 EcoSafe Environmental Alert</h1>
          <p style="margin: 8px 0 0; opacity: 0.85; font-size: 13px;">National Environmental Safety Response Agency (NESREA)</p>
        </div>
        <div style="padding: 28px 24px; color: #1f2937; background: #fff;">
          <p style="font-size: 15px; line-height: 1.7; margin: 0;">${message.replace(/\n/g, "<br/>")}</p>
        </div>
        <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 24px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">Automated safety broadcast from <strong>EcoSafe Hazard Monitoring Network</strong>.</p>
        </div>
      </div>
    `;

    let transporter;
    let provider;
    let previewUrl = null;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      provider = `Gmail (${process.env.SMTP_USER})`;
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
    } else {
      // Use persistent Ethereal credentials from .env
      provider = "Ethereal Test Mail";
      const etherealUser = process.env.ETHEREAL_USER;
      const etherealPass = process.env.ETHEREAL_PASS;
      if (etherealUser && etherealPass) {
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: { user: etherealUser, pass: etherealPass }
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass }
        });
      }
    }

    const fromAddress = (process.env.SMTP_USER && process.env.SMTP_PASS)
      ? `"EcoSafe Command Center" <${process.env.SMTP_USER}>`
      : '"EcoSafe Command Center" <admin@ecosafe.ng>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to: userEmails.join(","),
      subject: `[EcoSafe Alert] ${subject}`,
      html: htmlBody
    });

    previewUrl = nodemailer.getTestMessageUrl(info) || null;

    const broadcast = await db.smsBroadcast.create({
      data: {
        incident_id: null,
        community: "All Users",
        message: `[Email: ${subject}] ${message.substring(0, 300)}`,
        status: previewUrl ? `SENT — Preview: ${previewUrl}` : "SENT",
        provider: `Email via ${provider}`
      }
    });

    if (req.io) req.io.emit("sms-broadcasted", broadcast);

    console.log(`[EMAIL BROADCAST] Provider: ${provider} | Subject: "${subject}" | Recipients: ${userEmails.length}`);
    if (previewUrl) console.log("📧 View email at:", previewUrl);

    res.json({
      message: `Email broadcast sent to ${userEmails.length} user(s) successfully.`,
      id: broadcast.id,
      provider,
      previewUrl,
      recipientCount: userEmails.length,
      etherealLogin: provider.includes("Ethereal") ? "https://ethereal.email/login" : null,
      etherealCredentials: provider.includes("Ethereal") ? {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
      } : null
    });
  } catch (err) {
    console.error("[EMAIL BROADCAST ERROR]", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/ai-generate-broadcast: generate AI message for email or SMS broadcast
app.post("/admin/ai-generate-broadcast", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const { prompt, method, severity, location } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Incident context or prompt is required for AI generation" });
  }

  try {
    const result = await generateBroadcastAI(prompt, method, severity, location);
    res.json(result);
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
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EcoSafe backend running on http://localhost:${PORT}`);
  seedAdmin();
});