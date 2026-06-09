const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./ecosafe.db", (err) => {
  if (err) console.log(err);
  else console.log("SQLite connected");
});

/* ================= TABLES ================= */

db.serialize(() => {
  // 1. Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      points INTEGER DEFAULT 0,
      badge TEXT DEFAULT 'Eco Novice'
    )
  `);

  // 2. Reports Table (updated with all AI diagnostic columns)
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      category TEXT,
      location TEXT,
      priority TEXT,
      latitude TEXT,
      longitude TEXT,
      image TEXT,
      status TEXT DEFAULT 'Pending',
      ai_tips TEXT,
      ai_image_valid INTEGER DEFAULT -1,
      ai_image_analysis TEXT,
      
      ai_hazard_type TEXT,
      ai_severity TEXT,
      ai_confidence INTEGER,
      ai_risk_level TEXT,
      ai_recommendation TEXT,
      ai_assigned_agency TEXT,
      ai_verification_status TEXT DEFAULT 'PENDING REVIEW',
      ai_verification_reason TEXT,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Alerts Table
  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      message TEXT,
      level TEXT,
      target TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Community Risk Table
  db.run(`
    CREATE TABLE IF NOT EXISTS community_risk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      community TEXT UNIQUE,
      risk_score INTEGER DEFAULT 10,
      status TEXT DEFAULT 'Low Risk',
      total_incidents INTEGER DEFAULT 0,
      resolved_incidents INTEGER DEFAULT 0
    )
  `);

  // 5. SMS Broadcast Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS sms_broadcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER,
      community TEXT,
      message TEXT,
      status TEXT,
      provider TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Chatbot Dialogue History Table
  db.run(`
    CREATE TABLE IF NOT EXISTS chatbot_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      query TEXT,
      response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /* ================= DYNAMIC SCHEMA MIGRATIONS ================= */
  
  db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) return console.error("Error migrating users:", err);
    const names = columns.map(c => c.name);
    
    if (!names.includes("role")) {
      db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    }
    if (!names.includes("points")) {
      db.run("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0");
    }
    if (!names.includes("badge")) {
      db.run("ALTER TABLE users ADD COLUMN badge TEXT DEFAULT 'Eco Novice'");
    }
  });

  db.all("PRAGMA table_info(reports)", [], (err, columns) => {
    if (err) return console.error("Error migrating reports:", err);
    const names = columns.map(c => c.name);

    if (!names.includes("ai_tips")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_tips TEXT");
    }
    if (!names.includes("ai_image_valid")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_image_valid INTEGER DEFAULT -1");
    }
    if (!names.includes("ai_image_analysis")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_image_analysis TEXT");
    }
    if (!names.includes("ai_hazard_type")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_hazard_type TEXT");
    }
    if (!names.includes("ai_severity")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_severity TEXT");
    }
    if (!names.includes("ai_confidence")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_confidence INTEGER");
    }
    if (!names.includes("ai_risk_level")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_risk_level TEXT");
    }
    if (!names.includes("ai_recommendation")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_recommendation TEXT");
    }
    if (!names.includes("ai_assigned_agency")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_assigned_agency TEXT");
    }
    if (!names.includes("ai_verification_status")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_verification_status TEXT DEFAULT 'PENDING REVIEW'");
    }
    if (!names.includes("ai_verification_reason")) {
      db.run("ALTER TABLE reports ADD COLUMN ai_verification_reason TEXT");
    }
  });
});

module.exports = db;