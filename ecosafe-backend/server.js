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
const SECRET = "ecosafe-secret";

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

function updateUserPointsAndBadge(userId, pointsToAdd, callback) {
  if (!userId) {
    if (callback) callback(null, null);
    return;
  }
  db.get("SELECT points FROM users WHERE id = ?", [userId], (err, row) => {
    if (err || !row) {
      if (callback) callback(err || new Error("User not found"));
      return;
    }
    const currentPoints = row.points || 0;
    const newPoints = currentPoints + pointsToAdd;
    const newBadge = getBadge(newPoints);

    db.run(
      "UPDATE users SET points = ?, badge = ? WHERE id = ?",
      [newPoints, newBadge, userId],
      (err) => {
        if (err) {
          if (callback) callback(err);
        } else {
          console.log(`User ${userId} awarded ${pointsToAdd} points. New total: ${newPoints} (${newBadge})`);
          if (callback) callback(null, { points: newPoints, badge: newBadge });
        }
      }
    );
  });
}

/* ================= SEED ADMIN USER ================= */
const seedAdmin = async () => {
  const adminEmail = "admin@ecosafe.ng";
  db.get("SELECT * FROM users WHERE email = ?", [adminEmail], async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash("admin323", 10);
      db.run(
        "INSERT INTO users (name, email, password, role, points, badge) VALUES (?, ?, ?, ?, ?, ?)",
        ["NESREA Admin Officer", adminEmail, hash, "admin", 1000, "Planet Guardian 🌎"],
        (err) => {
          if (err) console.error("Error seeding admin user:", err);
          else console.log("Seeded admin user: admin@ecosafe.ng / admin323");
        }
      );
    }
  });
};
seedAdmin();

/* ================= AUTHENTICATION ================= */

// Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, hash],
      (err) => {
        if (err) return res.status(400).json({ error: "Email already exists" });
        res.json({ message: "User created" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email/password" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
    res.json({ token });
  });
});

// User Profile Info
app.get("/profile", verifyToken, (req, res) => {
  db.get("SELECT id, name, email, role, points, badge FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });
});

// Leaderboard
app.get("/leaderboard", (req, res) => {
  db.all(
    "SELECT name, points, badge FROM users WHERE role = 'user' ORDER BY points DESC, name ASC LIMIT 15",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

/* ================= REPORT SUBMISSIONS ================= */

// Create standard hazard report
app.post("/report", verifyToken, (req, res) => {
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

  // AI Report Analysis and Prioritization
  const aiAnalysis = analyzeAndPrioritizeAI(category, title, description, image, location);
  
  // AI Verification and Moderation
  const aiVerify = verifyReportAI(category, description, image, location);

  const priority = aiAnalysis.priority || detectPriority(title + " " + description);
  const aiTipsList = generateSafetyTips(category, title, description);
  const aiTips = JSON.stringify(aiTipsList);

  // AI Evidence Verification (legacy compatibility compatibility)
  const imageVerification = validateImageAI(category, image);
  const aiImageValid = imageVerification.isValid;
  const aiImageAnalysis = imageVerification.analysis;

  db.run(
    `INSERT INTO reports 
    (user_id, title, description, category, location, latitude, longitude, priority, image, ai_tips, ai_image_valid, ai_image_analysis,
     ai_hazard_type, ai_severity, ai_confidence, ai_risk_level, ai_recommendation, ai_assigned_agency, ai_verification_status, ai_verification_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      title,
      description,
      category,
      location,
      latitude ? String(latitude) : null,
      longitude ? String(longitude) : null,
      priority,
      image,
      aiTips,
      aiImageValid,
      aiImageAnalysis,
      aiAnalysis.hazardType,
      aiAnalysis.severity,
      aiAnalysis.confidence,
      aiAnalysis.riskLevel,
      aiAnalysis.recommendation,
      aiAnalysis.assignedAgency,
      aiVerify.status,
      aiVerify.reason
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const reportId = this.lastID;

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
    }
  );
});

// Fetch my reports
app.get("/myreports", verifyToken, (req, res) => {
  db.all("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
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
  });
});

// Delete report
app.delete("/report/:id", verifyToken, (req, res) => {
  db.run("DELETE FROM reports WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(403).json({ error: "Unauthorized or not found" });
    res.json({ message: "Report deleted successfully" });
  });
});

// Get all reports (Public - Map and Dashboard)
app.get("/reports", (req, res) => {
  db.all("SELECT * FROM reports ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const parsedRows = rows.map(row => {
      try {
        row.ai_tips = row.ai_tips ? JSON.parse(row.ai_tips) : [];
      } catch (e) {
        row.ai_tips = [];
      }
      return row;
    });
    res.json(parsedRows);
  });
});

// Alias for dashboard GET /report
app.get("/report", (req, res) => {
  db.all("SELECT * FROM reports ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const parsedRows = rows.map(row => {
      try {
        row.ai_tips = row.ai_tips ? JSON.parse(row.ai_tips) : [];
      } catch (e) {
        row.ai_tips = [];
      }
      return row;
    });
    res.json(parsedRows);
  });
});

// Alias for Map (all-reports)
app.get("/all-reports", (req, res) => {
  db.all("SELECT * FROM reports ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const parsedRows = rows.map(row => {
      try {
        row.ai_tips = row.ai_tips ? JSON.parse(row.ai_tips) : [];
      } catch (e) {
        row.ai_tips = [];
      }
      return row;
    });
    res.json(parsedRows);
  });
});

// Fire Outbreak Multi-Part Form Endpoint
app.post("/api/FireOutbreak", upload.single("image"), (req, res) => {
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

  db.run(
    `INSERT INTO reports 
    (user_id, title, description, category, location, priority, image, ai_tips, ai_image_valid, ai_image_analysis,
     ai_hazard_type, ai_severity, ai_confidence, ai_risk_level, ai_recommendation, ai_assigned_agency, ai_verification_status, ai_verification_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      title,
      descWithContact,
      category,
      location,
      priority,
      imageBase64,
      aiTips,
      aiImageValid,
      aiImageAnalysis,
      aiAnalysis.hazardType,
      aiAnalysis.severity,
      aiAnalysis.confidence,
      aiAnalysis.riskLevel,
      aiAnalysis.recommendation,
      aiAnalysis.assignedAgency,
      aiVerify.status,
      aiVerify.reason
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const reportId = this.lastID;

      // Update community risk statistics in the background
      updateCommunityRisk(location, (riskErr) => {
        if (riskErr) console.error("Error updating community risk:", riskErr);
      });

      // Automatically create a public alert for fire outbreaks
      db.run(
        "INSERT INTO alerts (title, message, level, target) VALUES (?, ?, 'Critical', 'All Residents')",
        [
          `🚨 IMMEDIATE FIRE ALERT: ${location}`,
          `A critical fire outbreak has been reported at ${location}. Description: ${description}. Evacuate the area immediately and steer clear.`
        ],
        (alertErr) => {
          if (alertErr) console.error("Error broadcasting automated fire alert:", alertErr);
        }
      );

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
    }
  );
});

/* ================= ADMIN INTERFACES ================= */

// Admin Login
app.post("/admin/login", (req, res) => {
  const { organization, email, password, accessCode } = req.body;

  if (!organization || !email || !password || !accessCode) {
    return res.status(400).json({ error: "Missing admin login credentials" });
  }

  if (accessCode !== "ECO-SECURE-001") {
    return res.status(403).json({ error: "Invalid Admin Access Code" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: "Account not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong credentials" });

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Account is not registered as an authorized administrator" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, organization }, SECRET);
    res.json({ token });
  });
});

// Admin get all reports
app.get("/admin/reports", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  db.all("SELECT * FROM reports ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Admin stats
app.get("/admin/stats", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  db.get(
    `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN priority='Critical' THEN 1 ELSE 0 END) as critical
    FROM reports
    `,
    [],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        total: row.total || 0,
        pending: row.pending || 0,
        resolved: row.resolved || 0,
        critical: row.critical || 0
      });
    }
  );
});

// Legacy Endpoint for status updates (updates report by any user/admin)
app.put("/report/:id", verifyToken, (req, res) => {
  const { status } = req.body;

  db.run("UPDATE reports SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Updated" });
  });
});

// Admin update report status (and award points to reporter)
app.put("/admin/report/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const { status } = req.body;

  db.get("SELECT user_id, status FROM reports WHERE id = ?", [req.params.id], (err, report) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!report) return res.status(404).json({ error: "Report not found" });

    db.run(
      "UPDATE reports SET status = ? WHERE id = ?",
      [status, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Recalculate community risk in background
        db.get("SELECT location FROM reports WHERE id = ?", [req.params.id], (err, repInfo) => {
          if (repInfo && repInfo.location) {
            updateCommunityRisk(repInfo.location, (riskErr) => {
              if (riskErr) console.error("Error updating community risk on admin status change:", riskErr);
            });
          }
        });

        // If the report is newly approved, reward the reporter!
        if (status === "Approved" && report.status !== "Approved" && report.user_id) {
          updateUserPointsAndBadge(report.user_id, 50, (err) => {
            if (err) console.error("Error awarding points to reporter:", err);
            res.json({ message: "Report approved, reporter rewarded 50 points." });
          });
        } else {
          res.json({ message: "Report status updated to: " + status });
        }
      }
    );
  });
});

/* ================= ALERTS SYSTEMS ================= */

// Legacy Get alerts
app.get("/alerts", (req, res) => {
  db.all("SELECT * FROM alerts ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Public Alerts feed
app.get("/public/alerts", (req, res) => {
  db.all("SELECT * FROM alerts ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Admin Alerts get
app.get("/admin/alerts", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  db.all("SELECT * FROM alerts ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Admin Alerts broadcast create
app.post("/admin/alerts", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const { title, message, level, target } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  db.run(
    "INSERT INTO alerts (title, message, level, target) VALUES (?, ?, ?, ?)",
    [title, message, level || "Medium", target || "All Residents"],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Alert broadcasted successfully", id: this.lastID });
    }
  );
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
app.get("/community-risks", (req, res) => {
  db.all("SELECT * FROM community_risk ORDER BY risk_score DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// POST /admin/broadcast-sms: broadcast SMS to users/communities using simulated or direct Twilio configurations
app.post("/admin/broadcast-sms", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const { community, hazardType, severity, message } = req.body;

  if (!community || !message) {
    return res.status(400).json({ error: "Missing community or message content" });
  }

  const provider = process.env.SMS_PROVIDER || "Twilio";
  db.run(
    "INSERT INTO sms_broadcasts (incident_id, community, message, status, provider) VALUES (?, ?, ?, 'SENT (ADMIN BROADCAST)', ?)",
    [null, community, message, provider],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      console.log(`[ADMIN SMS BROADCAST via ${provider}] to residents of ${community}: "${message}"`);
      res.json({ message: "SMS broadcast sent successfully", id: this.lastID, provider });
    }
  );
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
app.get("/admin/sms-logs", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  db.all("SELECT * FROM sms_broadcasts ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

/* ================= SERVER START ================= */
app.listen(5000, () => {
  console.log("🚀 EcoSafe backend running on http://localhost:5000");
});