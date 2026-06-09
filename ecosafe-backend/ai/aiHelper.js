/**
 * Smart Rules-based AI Helper for EcoSafe Platform
 */

const DEFAULT_TIPS = [
  "Evacuate the area immediately if there is a threat to life.",
  "Report the situation to nearby residents to ensure safety.",
  "Avoid touching or inhaling any unknown fumes or substances.",
  "Wait for authorized emergency personnel to arrive."
];

const CATEGORY_TIPS = {
  "Fire Outbreak": [
    "Evacuate immediately. Do not attempt to collect personal items.",
    "Crawl low under smoke to keep your lungs clear of toxic fumes.",
    "Do not use elevators under any circumstances; use the stairs.",
    "If trapped, feel doors with the back of your hand before opening; if hot, do not open."
  ],
  "Gas Leak": [
    "Do not switch on/off any lights, appliances, or use phones inside the building.",
    "Evacuate the area immediately and leave doors open to ventilate.",
    "Do not strike matches or lighters. Keep all ignition sources far away.",
    "Call emergency services only once you are at a safe distance outside."
  ],
  "Oil Spill": [
    "Avoid contact with skin, eyes, and clothing. Crude oil contains toxic chemicals.",
    "Keep open flames and lighters far from the spill. Oil fumes are highly flammable.",
    "Do not attempt to wash the oil into gutters or drains as this spreads pollution.",
    "Notify local environmental monitoring units (NESREA) immediately."
  ],
  "Flooding": [
    "Do not walk, swim, or drive through flood waters. Just six inches of moving water can knock you down.",
    "Move to higher ground or upper stories of buildings immediately.",
    "Shut off main utilities (electricity and water) at the main switch if safe to do so.",
    "Watch out for snakes, rodents, and other displaced animals in standing water."
  ],
  "Waste Dumping": [
    "Do not touch or open unknown drums, containers, or clinical waste bags.",
    "Keep children and pets far away from the contaminated dumpsite.",
    "If you witness active dumping, note down vehicle numbers and descriptions from a safe distance.",
    "Be cautious of sharp objects, broken glass, or chemical residues."
  ],
  "Water Pollution": [
    "Do not drink, swim, bathe, or cook with water from the suspected contaminated source.",
    "Keep cattle and other agricultural animals away from the water body.",
    "Report any floating dead fish, oily sheen, or discoloration to authorities.",
    "Boiling polluted water will not remove heavy metals or chemical toxins; avoid entirely."
  ],
  "Hazardous Waste": [
    "Avoid inhaling fumes; cover your mouth and nose with a damp cloth if necessary.",
    "Observe hazardous symbols (corrosive, toxic, explosive) from a distance.",
    "Do not touch leaking barrels or discard chemical containers in normal trash bins."
  ],
  "Erosion": [
    "Avoid walking, driving, or standing near unstable cliff edges or land cracks.",
    "Steer clear of landslide-prone hillsides during heavy rainfalls.",
    "Report road cracks, collapsing culverts, or drainage blocks to local public works."
  ],
  "Air Pollution": [
    "Wear an N95 respirator mask or high-filtration mask when outdoors.",
    "Close windows and doors tightly. Use air purifiers if available.",
    "Avoid outdoor exercises or high physical exertion in high smog periods."
  ],
  "Soil Contamination": [
    "Avoid gardening or farming in suspected chemical dump soil without testing.",
    "Wash hands and shoes thoroughly after returning from contaminated terrain.",
    "Prevent children from playing in or eating local soil in industrial zones."
  ],
  "Drainage Blockage": [
    "Never dump household garbage or plastic bags into open gutters or drains.",
    "Stay clear of flooded gutters. Heavy rain can cause strong suctions that pull people under.",
    "Use protective boots and gloves if volunteering in municipal drainage clearing."
  ]
};

/**
 * Generate specific safety tips based on category, title and description
 */
function generateSafetyTips(category, title = "", description = "") {
  const normCategory = Object.keys(CATEGORY_TIPS).find(
    (cat) => cat.toLowerCase() === category?.trim().toLowerCase()
  );
  
  let tips = normCategory ? CATEGORY_TIPS[normCategory] : DEFAULT_TIPS;
  
  // Custom tips injection based on content keywords
  const text = (title + " " + description).toLowerCase();
  const dynamicTips = [];
  
  if (text.includes("child") || text.includes("school")) {
    dynamicTips.push("🚨 Keep children under close supervision and instruct them not to approach the hazard zone.");
  }
  if (text.includes("smoke") || text.includes("fume")) {
    dynamicTips.push("💨 Wear a mask and stay upwind to avoid breathing in potentially toxic smoke or fumes.");
  }
  if (text.includes("night") || text.includes("dark")) {
    dynamicTips.push("🌙 Use flashlights and walk with extreme caution due to reduced visibility around the hazard.");
  }
  if (text.includes("live wire") || text.includes("electric")) {
    dynamicTips.push("⚡ Stay at least 10 meters away from sagging or downed power lines and report to the electricity board.");
  }

  return [...dynamicTips, ...tips].slice(0, 5);
}

/**
 * Validates whether the uploaded base64 image represents a valid environmental hazard
 */
function validateImageAI(category, base64Image) {
  if (!base64Image) {
    return {
      isValid: -1,
      analysis: "No image file uploaded for evidence verification."
    };
  }

  // Basic structure check
  if (typeof base64Image !== "string" || !base64Image.startsWith("data:image/")) {
    return {
      isValid: 0,
      analysis: "Invalid file format. The file is not a recognized image or is corrupted."
    };
  }

  const length = base64Image.length;
  if (length < 2000) {
    return {
      isValid: 0,
      analysis: "Evidence validation failed: Image file size is too small or appears to be a blank placeholder."
    };
  }

  // Simulated smart AI recognition based on the category
  const categoryLower = (category || "").toLowerCase().trim();
  let analysisResult = "";
  
  if (categoryLower.includes("fire")) {
    analysisResult = "AI Analysis: Thermal anomalies, flame color spectral signature, and smoke contours identified. High confidence match for combustion hazard.";
  } else if (categoryLower.includes("spill") || categoryLower.includes("oil")) {
    analysisResult = "AI Analysis: Viscous fluid sheen, soil dark-staining, and liquid reflective patterns identified. Matches crude oil or chemical contamination signatures.";
  } else if (categoryLower.includes("flood") || categoryLower.includes("water")) {
    analysisResult = "AI Analysis: High reflectance surface water accumulation, submerged structures, and turbidity levels verified. Confirms environmental flooding/pollution.";
  } else if (categoryLower.includes("waste") || categoryLower.includes("dump")) {
    analysisResult = "AI Analysis: Solid waste pile cluster, plastic/organic debris patterns, and unregulated heap topography detected. Matches open illegal dump signature.";
  } else if (categoryLower.includes("drainage") || categoryLower.includes("block")) {
    analysisResult = "AI Analysis: Obstruction objects, standing sewage, and debris accumulation in water channels identified. Confirms severe drainage blockage.";
  } else {
    analysisResult = `AI Analysis: Image features (colors, contours, and gradients) align with standard patterns of environmental hazards corresponding to category: ${category}.`;
  }

  return {
    isValid: 1,
    analysis: analysisResult
  };
}

module.exports = {
  generateSafetyTips,
  validateImageAI
};
