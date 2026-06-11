/**
 * Advanced AI Intelligence Service Layer for EcoSafe AI
 */

const db = require("../db");

// Dict mapping categories to direct responding agencies
const ASSIGNED_AGENCIES = {
  "Oil Spill": "National Oil Spill Detection and Response Agency (NOSDRA)",
  "Gas Leak": "National Emergency Management Agency (NEMA)",
  "Flooding": "State Emergency Management Agency (SEMA)",
  "Fire Outbreak": "Federal Fire Service",
  "Water Pollution": "State Ministry of Environment",
  "Waste Dumping": "National Environmental Standards and Regulations Enforcement Agency (NESREA)",
  "Hazardous Waste": "National Environmental Standards and Regulations Enforcement Agency (NESREA)",
  "Erosion": "Ministry of Works / Ecological Project Office",
  "Air Pollution": "State Environmental Protection Agency (SEPA)",
  "Soil Contamination": "NESREA",
  "Drainage Blockage": "Municipal Waste Management Authority",
  "Illegal Logging": "State Forestry Division",
  "Dead Fish Event": "NOSDRA / Ministry of Fisheries",
  "Environmental Emergency": "NEMA"
};

/**
 * FEATURE 1 & 3: AI Report Analysis & Incident Prioritization Engine
 * Resolves hazard details and urgency levels based on inputs.
 */
function analyzeAndPrioritizeAI(category, title = "", description = "", image = "", location = "") {
  const normCategory = Object.keys(ASSIGNED_AGENCIES).find(
    (cat) => cat.toLowerCase() === category?.trim().toLowerCase()
  ) || "Environmental Emergency";

  const text = (title + " " + description + " " + location).toLowerCase();
  
  let severity = "Medium";
  let riskLevel = "Medium";
  let confidence = 85 + Math.floor(Math.random() * 12); // Simulated confidence score 85-97%
  let recommendation = "Standard monitoring and local cleanup advisory recommended.";
  let responseTime = "Within 24 hours";
  let alertRequired = false;

  // Prioritization and Severity Rules
  if (normCategory === "Oil Spill") {
    if (text.includes("water") || text.includes("river") || text.includes("creek") || text.includes("stream") || text.includes("ocean")) {
      severity = "Critical";
      riskLevel = "Critical";
      recommendation = "🚨 CRITICAL: High contamination risk to aquatic life. Deploy boom barriers and oil containment systems immediately.";
      responseTime = "Immediate (Under 2 hours)";
      alertRequired = true;
    } else {
      severity = "High";
      riskLevel = "High";
      recommendation = "Oil soil penetration active. Excavation and soil remediation teams required.";
      responseTime = "Within 6 hours";
      alertRequired = true;
    }
  } else if (normCategory === "Fire Outbreak") {
    if (text.includes("house") || text.includes("residential") || text.includes("school") || text.includes("hospital") || text.includes("market")) {
      severity = "Critical";
      riskLevel = "Critical";
      recommendation = "🚨 CRITICAL: Fire outbreak in close proximity to human settlements. Dispatch fire fighters and evacuate residents immediately.";
      responseTime = "Immediate (Under 30 mins)";
      alertRequired = true;
    } else {
      severity = "High";
      riskLevel = "High";
      recommendation = "Bush/forest fire active. Clear firewall perimeters and deploy wildland fire units.";
      responseTime = "Within 2 hours";
      alertRequired = true;
    }
  } else if (normCategory === "Gas Leak") {
    severity = "Critical";
    riskLevel = "Critical";
    recommendation = "🚨 CRITICAL: Flammable/toxic gas concentrations. Isolate regional electrical circuits, establish a safety perimeter, and evacuate area.";
    responseTime = "Immediate (Under 1 hour)";
    alertRequired = true;
  } else if (normCategory === "Flooding" && (text.includes("rain") || text.includes("drainage") || text.includes("blocked"))) {
    severity = "High";
    riskLevel = "High";
    recommendation = "High water levels threatening structures. Clear major drainage channels and issue flood evacuation alerts.";
    responseTime = "Within 4 hours";
    alertRequired = true;
  } else if (normCategory === "Dead Fish Event" || normCategory === "Water Pollution") {
    severity = "High";
    riskLevel = "High";
    recommendation = "Contaminated water body. Restrict local water fetching and fishing; collect samples for lab toxicity analysis.";
    responseTime = "Within 6 hours";
    alertRequired = true;
  } else if (text.includes("critical") || text.includes("emergency") || text.includes("injury") || text.includes("death")) {
    severity = "Critical";
    riskLevel = "High";
    recommendation = "Safety emergency reported with physical threat. Dispatch NEMA responders.";
    responseTime = "Immediate (Under 2 hours)";
    alertRequired = true;
  }

  // Recommendation refinement based on category
  if (severity === "Medium" && normCategory.includes("Waste")) {
    recommendation = "Illegal dump detected. Dispatch municipal waste collectors and place illegal-dumping warning signs.";
  }

  return {
    hazardType: normCategory,
    severity,
    confidence,
    riskLevel,
    recommendation,
    assignedAgency: ASSIGNED_AGENCIES[normCategory] || "State Environmental Task Force",
    priority: severity.toUpperCase(), // Match priority level
    responseTime,
    alertRequired
  };
}

/**
 * FEATURE 2: AI Report Verification and Moderation
 * Auto-checks descriptions and images.
 */
function verifyReportAI(category, description = "", image = "", location = "") {
  const descLower = description.toLowerCase().trim();
  const locationLower = location.toLowerCase().trim();

  // Spam / malicious keywords check
  const spamKeywords = ["buy cheap", "bitcoin", "casino", "pills", "weight loss", "subscribe", "viagra", "advertisement"];
  if (spamKeywords.some(w => descLower.includes(w))) {
    return {
      status: "REJECTED",
      confidence: 99,
      reason: "Spam content or commercial advertisement detected."
    };
  }

  // Minimum length check
  if (descLower.length < 10) {
    return {
      status: "REJECTED",
      confidence: 90,
      reason: "Insufficient evidence: Report description is too short to be meaningful."
    };
  }

  // Mock duplicate check (based on matching strings in text)
  if (descLower === "test report duplicate check text") {
    return {
      status: "REJECTED",
      confidence: 95,
      reason: "Duplicate report: An identical incident has already been submitted."
    };
  }

  // Location check
  if (locationLower.length < 4) {
    return {
      status: "PENDING REVIEW",
      confidence: 80,
      reason: "Suspicious activity: Reported location is too vague or invalid."
    };
  }

  // Image verification check
  if (image) {
    if (!image.startsWith("data:image/")) {
      return {
        status: "REJECTED",
        confidence: 92,
        reason: "Irrelevant image: The uploaded file is corrupted or not a valid image format."
      };
    }
    if (image.length < 2000) {
      return {
        status: "PENDING REVIEW",
        confidence: 85,
        reason: "Insufficient evidence: Uploaded image size is too small, likely a blank placeholder."
      };
    }
  }

  return {
    status: "APPROVED",
    confidence: 90 + Math.floor(Math.random() * 8),
    reason: "Verified environmental hazard matching standard description patterns."
  };
}

/**
 * FEATURE 5: SMS Broadcast Engine
 * Simulates Twilio / Africa's Talking dispatches and writes to sms_broadcasts logs.
 */
async function broadcastSMSAI(incidentId, community, hazardType, severity, location, callback) {
  const alertMsg = `🚨 ECOSAFE AI CRITICAL ALERT: ${hazardType} detected in ${community} (${location}). Risk Level: ${severity}. Avoid affected zones and stay alert.`;
  
  // Choose SMS provider simulation based on availability (defaults to Twilio mock)
  const provider = process.env.SMS_PROVIDER || "Twilio";

  try {
    const result = await db.smsBroadcast.create({
      data: {
        incident_id: incidentId,
        community,
        message: alertMsg,
        status: "SENT (SIMULATED)",
        provider
      }
    });
    console.log(`[SMS BROADCAST via ${provider}] to residents of ${community}: "${alertMsg}"`);
    if (callback) callback(null, { id: result.id, message: alertMsg, provider });
  } catch (err) {
    console.error("Failed to log SMS broadcast:", err);
    if (callback) callback(err);
  }
}

/**
 * FEATURE 6: AI Environmental Chatbot
 * Returns conversational safety tips and guidance.
 */
async function handleChatbotQuery(query, callback) {
  const q = (query || "").toLowerCase();
  let reply = "";

  if (q.includes("oil spill")) {
    reply = "📌 **Oil Spill Safety Response:**\n1. Move upwind immediately to avoid breathing toxic crude fumes.\n2. Extinguish all nearby open flames, matches, or smoking materials (crude oil is highly flammable).\n3. Avoid touching or wading through the liquid.\n4. Secure children and livestock away from the spill site.\n5. Click 'Report Hazard' on the dashboard to log this directly with NESREA.";
  } else if (q.includes("gas leak")) {
    reply = "🚨 **Gas Leak Emergency Protocol:**\n1. Do NOT touch any light switches, electrical outlets, or use matchsticks (even static electricity can ignite natural gas).\n2. Evacuate all occupants from the building/zone immediately.\n3. Keep doors and windows wide open on your way out to let the gas ventilate.\n4. Call emergency responders once you are at a safe distance outside.\n5. If the leak is outside, stay upwind and evacuate nearby structures.";
  } else if (q.includes("flood") || q.includes("rain")) {
    reply = "🌊 **Flood Risk Mitigation & Safety:**\n1. Elevate electrical appliances and valuable belongings to higher shelves.\n2. Do NOT walk, swim, or drive through moving floodwaters. Just 6 inches of water can sweep a car away.\n3. Disconnect power lines at the main breaker if your house is entering a flooded state.\n4. Clear plastic trash and debris out of open neighborhood gutters to let rain discharge freely.\n5. Keep children away from open sewer channels.";
  } else if (q.includes("waste") || q.includes("dump") || q.includes("trash")) {
    reply = "♻️ **Waste Management & Disposal Tips:**\n1. Never discard batteries, electronics, or medical packaging in domestic trash. Take them to designated e-waste recycling points.\n2. Separate organic compostable materials from recyclable plastics.\n3. Do not engage in open trash burning, as it releases toxic heavy metal fumes into the neighborhood.\n4. Log any illegal dumping site on EcoSafe to notify environmental officers.";
  } else if (q.includes("water pollution") || q.includes("dirty water")) {
    reply = "💧 **Water Contamination Safety advice:**\n1. Do not use local creek or well water for cooking, drinking, or washing if you notice an oily sheen or dead fish.\n2. Keep livestock away from contaminated water sources.\n3. Standard home boiling will NOT destroy chemical toxins or crude residues; use bottled water until verified clean.\n4. Report contaminated water bodies on the portal immediately.";
  } else if (q.includes("logging") || q.includes("cutting trees")) {
    reply = "🌳 **Protecting Forest Cover:**\nIllegal tree cutting accelerates soil erosion and ruins the local ecosystem. Note down the location, take a picture, and report under the 'Illegal Logging' category to NESREA.";
  } else {
    reply = "👋 **Hello! I'm EcoSafe AI, your environmental protection assistant.**\n\nI can help you with:\n• Safety protocols for oil spills, gas leaks, and floods\n• Proper electronic and solid waste disposal guidelines\n• Advice on identifying water/air pollution hazards\n• Reporting instructions\n\nWhat environmental safety topic can I help you with today?";
  }

  // Record dialogue log
  try {
    await db.chatbotHistory.create({
      data: {
        query,
        response: reply
      }
    });
    if (callback) callback(null, reply);
  } catch (err) {
    console.error("Error logging chatbot query:", err);
    if (callback) callback(null, reply);
  }
}

/**
 * FEATURE 7: Community Risk Score Aggregation
 * Re-evaluates risk metrics for a community based on current database logs.
 */
async function updateCommunityRisk(community, callback) {
  if (!community) {
    if (callback) callback(null);
    return;
  }

  try {
    const rows = await db.report.findMany({
      where: {
        OR: [
          { location: { contains: community, mode: "insensitive" } },
          { title: { contains: community, mode: "insensitive" } },
          { description: { contains: community, mode: "insensitive" } }
        ]
      },
      select: {
        priority: true,
        status: true
      }
    });

    const total = rows.length;
    if (total === 0) {
      const emptyRes = await db.communityRisk.upsert({
        where: { community },
        update: {
          risk_score: 10,
          status: "Low Risk",
          total_incidents: 0,
          resolved_incidents: 0
        },
        create: {
          community,
          risk_score: 10,
          status: "Low Risk",
          total_incidents: 0,
          resolved_incidents: 0
        }
      });
      if (callback) callback(null, emptyRes);
      return;
    }

    // Risk score math: Critical incidents weight 25, High weight 15, Medium 8, Low 3
    let score = 0;
    let resolvedCount = 0;
    
    rows.forEach(r => {
      if (r.status === "Approved") resolvedCount++; // Count approved/resolved
      
      if (r.priority === "Critical") score += 25;
      else if (r.priority === "High") score += 15;
      else if (r.priority === "Medium") score += 8;
      else score += 3;
    });

    // Deduct score offset based on resolved percentage (resolved reports lower the risk score!)
    const resolveRate = resolvedCount / total;
    score = Math.max(10, Math.min(100, Math.floor(score * (1 - resolveRate * 0.5))));

    let status = "Low Risk";
    if (score > 80) status = "Critical Risk";
    else if (score > 60) status = "High Risk";
    else if (score > 30) status = "Moderate Risk";

    const result = await db.communityRisk.upsert({
      where: { community },
      update: {
        risk_score: score,
        status,
        total_incidents: total,
        resolved_incidents: resolvedCount
      },
      create: {
        community,
        risk_score: score,
        status,
        total_incidents: total,
        resolved_incidents: resolvedCount
      }
    });

    if (callback) callback(null, result);
  } catch (err) {
    console.error("Error saving community risk:", err);
    if (callback) callback(err);
  }
}

/**
 * FEATURE 8: AI Recommendations Engine
 * Summarizes global statistics and triggers hazard prevention suggestions.
 */
async function getAIRecommendations(callback) {
  try {
    const groups = await db.report.groupBy({
      by: ['category', 'location'],
      where: {
        status: {
          notIn: ['Resolved', 'Rejected']
        }
      },
      _count: {
        _all: true
      }
    });

    const recommendations = [];
    const categoryCounts = {};

    groups.forEach(g => {
      const count = g._count._all;
      const category = g.category;
      const location = g.location;

      categoryCounts[category] = (categoryCounts[category] || 0) + count;
      
      if (count >= 2) {
        if (category === "Flooding" || category === "Drainage Blockage") {
          recommendations.push({
            title: `Clear drainage grids in ${location}`,
            desc: `Increasing hazard indicators (${count} reports) suggest high flooding risks. Municipal grid clearing campaigns are strongly recommended.`,
            priority: "High"
          });
        } else if (category === "Waste Dumping" || category === "Hazardous Waste") {
          recommendations.push({
            title: `Enforce waste control in ${location}`,
            desc: `Frequent dump reports (${count} incidents) logged. Placement of security signs and sanitation enforcement teams required.`,
            priority: "Medium"
          });
        } else if (category === "Oil Spill") {
          recommendations.push({
            title: `Pipeline integrity audit in ${location}`,
            desc: `${count} active oil spill reports. Urge operators to conduct emergency pipeline inspections.`,
            priority: "Critical"
          });
        }
      }
    });

    // Global trends recommendation
    if (categoryCounts["Air Pollution"] > 3) {
      recommendations.push({
        title: "Public Air Safety Campaign",
        desc: "Regional smog and particulate matter index elevated. Advise masking and tree planting.",
        priority: "Medium"
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Promote Environmental Stewardship",
        desc: "Current environmental indexes are stable. Continue to monitor reporting feeds.",
        priority: "Low"
      });
    }

    if (callback) callback(null, recommendations);
  } catch (err) {
    if (callback) callback(err);
  }
}

module.exports = {
  analyzeAndPrioritizeAI,
  verifyReportAI,
  broadcastSMSAI,
  handleChatbotQuery,
  updateCommunityRisk,
  getAIRecommendations
};
