function detectPriority(text = "") {
  const msg = text.toLowerCase();

  const critical = ["fire", "explosion", "gas leak", "oil spill", "dead", "pipeline", "collapse"];
  const high = ["flood", "smoke", "chemical", "pollution", "injury"];
  const medium = ["waste", "dirty", "blocked", "drainage", "smell"];

  if (critical.some((w) => msg.includes(w))) return "Critical";
  if (high.some((w) => msg.includes(w))) return "High";
  if (medium.some((w) => msg.includes(w))) return "Medium";

  return "Low";
}

module.exports = detectPriority;