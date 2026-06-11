const BASE_URL = "https://ecosafe-ai-2.onrender.com";

/* ================= AUTH ================= */
export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

/* ================= REPORT ================= */
export const submitReport = async (data, token) => {
  const res = await fetch(`${BASE_URL}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMyReports = async (token) => {
  const res = await fetch(`${BASE_URL}/my-reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

/* ================= ADMIN ================= */
export const loginAdmin = async (data) => {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getAdminReports = async (token) => {
  const res = await fetch(`${BASE_URL}/admin/reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const getStats = async (token) => {
  const res = await fetch(`${BASE_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

/* ================= ALERTS ================= */
export const getAlerts = async () => {
  const res = await fetch(`${BASE_URL}/alerts`);
  return res.json();
};

/* ================= AI CHATBOT ================= */
export const queryChatbot = async (query) => {
  const res = await fetch(`${BASE_URL}/chatbot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
};

/* ================= COMMUNITY RISK ================= */
export const getCommunityRisks = async () => {
  const res = await fetch(`${BASE_URL}/community-risks`);
  return res.json();
};

/* ================= SMS BROADCAST ================= */
export const broadcastSMS = async (data, token) => {
  const res = await fetch(`${BASE_URL}/admin/broadcast-sms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getSMSLogs = async (token) => {
  const res = await fetch(`${BASE_URL}/admin/sms-logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

/* ================= AI RECOMMENDATIONS ================= */
export const getAIRecommendations = async (token) => {
  const res = await fetch(`${BASE_URL}/admin/ai-recommendations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};