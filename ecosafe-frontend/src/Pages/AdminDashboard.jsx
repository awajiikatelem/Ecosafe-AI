import {
  LayoutDashboard,
  FileText,
  Map,
  Bell,
  Users,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Moon,
  Sun,
  Menu,
  User,
  ShieldAlert,
  X,
  Clock,
} from "lucide-react";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getCommunityRisks, 
  getAIRecommendations, 
  broadcastSMS, 
  getSMSLogs 
} from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    critical: 0,
  });

  const [adminTab, setAdminTab] = useState("incidents");
  const [communityRisks, setCommunityRisks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);

  // SMS Broadcast form state
  const [smsCommunity, setSmsCommunity] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsError, setSmsError] = useState("");
  const [smsSuccess, setSmsSuccess] = useState("");

  const token = localStorage.getItem("adminToken");

  /* ================= FETCH REPORTS ================= */
  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setReports(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  /* ================= FETCH STATS ================= */
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setStats(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  /* ================= FETCH COMMUNITY RISKS ================= */
  const fetchCommunityRisks = useCallback(async () => {
    try {
      const data = await getCommunityRisks();
      if (Array.isArray(data)) {
        setCommunityRisks(data);
      }
    } catch (e) {
      console.error("Error fetching community risks:", e);
    }
  }, []);

  /* ================= FETCH RECOMMENDATIONS ================= */
  const fetchRecommendations = useCallback(async () => {
    try {
      const data = await getAIRecommendations(token);
      if (Array.isArray(data)) {
        setRecommendations(data);
      }
    } catch (e) {
      console.error("Error fetching AI recommendations:", e);
    }
  }, [token]);

  /* ================= FETCH SMS LOGS ================= */
  const fetchSmsLogs = useCallback(async () => {
    try {
      const data = await getSMSLogs(token);
      if (Array.isArray(data)) {
        setSmsLogs(data);
      }
    } catch (e) {
      console.error("Error fetching SMS logs:", e);
    }
  }, [token]);

  /* ================= SEND SMS BROADCAST ================= */
  const handleSendSMS = async (e) => {
    e.preventDefault();
    if (!smsCommunity.trim() || !smsMessage.trim()) {
      setSmsError("Target community and message content are required");
      return;
    }

    setSmsLoading(true);
    setSmsError("");
    setSmsSuccess("");

    try {
      const res = await broadcastSMS(
        {
          community: smsCommunity,
          message: smsMessage
        },
        token
      );

      if (res && res.message) {
        setSmsSuccess(res.message);
        setSmsCommunity("");
        setSmsMessage("");
        fetchSmsLogs();
      } else {
        setSmsError(res.error || "Failed to broadcast alert message");
      }
    } catch (err) {
      setSmsError("Server communication error occurred");
    } finally {
      setSmsLoading(false);
    }
  };

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!token) {
      navigate("/AdminLogin");
      return;
    }

    const runFetch = () => {
      fetchReports();
      fetchStats();
      fetchCommunityRisks();
      fetchRecommendations();
      fetchSmsLogs();
    };

    // defer initial fetch to avoid synchronous setState inside the effect
    const initTimeout = setTimeout(runFetch, 0);

    const interval = setInterval(() => {
      runFetch();
    }, 5000);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(interval);
    };
  }, [token, navigate, fetchReports, fetchStats, fetchCommunityRisks, fetchRecommendations, fetchSmsLogs]);

  /* ================= APPROVE REPORT ================= */
  const approve = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/admin/report/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "Approved",
        }),
      });

      fetchReports();
      fetchStats();
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= REJECT REPORT ================= */
  const reject = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/admin/report/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "Rejected",
        }),
      });

      fetchReports();
      fetchStats();
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/AdminLogin");
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
        >
          <Menu />
        </button>

        {/* SIDEBAR */}
        <aside
          className={`fixed md:fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-6">

            {/* CLOSE BUTTON */}
            <div className="flex justify-between items-center md:hidden mb-6">
              <h2 className="text-xl font-bold">
                Eco<span className="text-green-600">Safe</span>
              </h2>

              <button onClick={() => setMenuOpen(false)}>
                <X />
              </button>
            </div>

            {/* LOGO */}
            <h2 className="hidden md:block text-2xl font-bold mb-10 dark:text-white">
              Eco<span className="text-green-600">Safe</span> Admin
            </h2>

            {/* NAVIGATION */}
            <nav className="space-y-3 text-sm">

              <NavItem
                text="Control Room"
                icon={<LayoutDashboard size={18} />}
                active
              />

              <NavItem
                text="Incident Reports"
                icon={<FileText size={18} />}
                onClick={() => navigate("/IncidentReports")}
              />

              <NavItem
                text="Live Map"
                icon={<Map size={18} />}
                onClick={() => navigate("/Maps")}
              />

              <NavItem
                text="Agency Users"
                icon={<Users size={18} />}
                onClick={() => navigate("/AgencyUsers")}
              />

              <NavItem
                text="Alert Broadcast"
                icon={<Bell size={18} />}
                onClick={() => navigate("/users")}
              />

              <NavItem
                text="System Settings"
                icon={<Settings size={18} />}
                onClick={() => navigate("/setting")}
              />
            </nav>

            {/* LOGOUT */}
            <button
              onClick={() => setLogoutPopup(true)}
              className="mt-10 flex items-center gap-2 text-red-500"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 md:ml-64 p-6 md:p-10">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">
                Environmental Monitoring Center
              </h1>

              <p className="text-gray-500 text-sm">
                Real-time hazard monitoring and emergency response
              </p>
            </div>
            
            <div className="flex items-center gap-4">

              {/* DARK MODE */}
              <button
                onClick={() => setDark(!dark)}
                className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* ADMIN */}
              <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow">
                <User size={16} />
                <span className="text-sm dark:text-white">
                  Control Officer
                </span>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            <Card
              title="Total Reports"
              value={stats.total}
              icon={<FileText size={18} />}
              color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            />

            <Card
              title="Pending"
              value={stats.pending}
              icon={<Clock size={18} />}
              color="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
            />

            <Card
              title="Resolved"
              value={stats.resolved}
              icon={<CheckCircle size={18} />}
              color="bg-green-500/10 text-green-600 dark:text-green-400"
            />

            <Card
              title="Critical Alerts"
              value={stats.critical}
              icon={<ShieldAlert size={18} />}
              color="bg-red-500/10 text-red-600 dark:text-red-400"
            />
          </div>

          {/* CONTROL ROOM TABS */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 mb-6 text-sm">
            <button
              onClick={() => setAdminTab("incidents")}
              className={`pb-3 px-4 font-bold border-b-2 transition cursor-pointer ${
                adminTab === "incidents"
                  ? "border-green-600 text-green-600 dark:text-green-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              Incident Queue
            </button>
            <button
              onClick={() => setAdminTab("risks")}
              className={`pb-3 px-4 font-bold border-b-2 transition cursor-pointer ${
                adminTab === "risks"
                  ? "border-green-600 text-green-600 dark:text-green-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              Community Hazards ({communityRisks.length})
            </button>
            <button
              onClick={() => setAdminTab("recommendations")}
              className={`pb-3 px-4 font-bold border-b-2 transition cursor-pointer ${
                adminTab === "recommendations"
                  ? "border-green-600 text-green-600 dark:text-green-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              AI Recommendations ({recommendations.length})
            </button>
            <button
              onClick={() => setAdminTab("sms")}
              className={`pb-3 px-4 font-bold border-b-2 transition cursor-pointer ${
                adminTab === "sms"
                  ? "border-green-600 text-green-600 dark:text-green-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              SMS Alerts Broadcast
            </button>
          </div>

          {/* TAB 1: INCIDENTS QUEUE */}
          {adminTab === "incidents" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="text-red-500" />
                <h2 className="font-semibold text-lg dark:text-white">
                  Incident Command Panel
                </h2>
              </div>

              {reports.length === 0 ? (
                <p className="text-gray-500">No reports found</p>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="border dark:border-gray-700 rounded-xl p-4 mb-4 bg-slate-50/20 dark:bg-gray-900/10"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between gap-4">
                      {/* LEFT */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-semibold text-base dark:text-white">
                            {report.title}
                          </h3>
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                            report.priority === "Critical"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : report.priority === "High"
                              ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                              : report.priority === "Medium"
                              ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                              : "bg-green-500/10 text-green-600 border-green-500/20"
                          }`}>
                            {report.priority} Urgency
                          </span>
                        </div>

                        <p className="text-sm text-gray-400 font-medium mt-1">
                          Category: {report.category}
                        </p>

                        <p className="text-sm mt-2.5 text-slate-700 dark:text-slate-200 leading-relaxed max-w-2xl">
                          {report.description}
                        </p>

                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>📍 {report.location}</span>
                          {report.latitude && <span>Coordinates: {report.latitude}, {report.longitude}</span>}
                        </div>

                        <div className="flex flex-wrap gap-2.5 mt-3 items-center">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                            report.ai_verification_status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : report.ai_verification_status === "REJECTED"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}>
                            AI Verify: {report.ai_verification_status || "PENDING REVIEW"}
                          </span>
                          
                          {report.ai_verification_reason && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                              ({report.ai_verification_reason})
                            </span>
                          )}

                          <span className="text-xs ml-auto text-slate-400 font-semibold">
                            Verification: <strong className="text-slate-700 dark:text-white font-bold">{report.status || "Pending"}</strong>
                          </span>
                        </div>

                        {/* AI Diagnostic Box */}
                        {report.ai_hazard_type && (
                          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-100 dark:border-gray-700/60 text-xs">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                              🧠 AI Environmental Diagnostics
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
                              <div>
                                <span className="text-slate-400 block">Identified Hazard:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-100">{report.ai_hazard_type}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">AI Confidence Score:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-100">{report.ai_confidence}%</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Urgency/Risk Level:</span>
                                <span className={`font-bold ${
                                  report.ai_severity === "Critical" ? "text-red-500" : report.ai_severity === "High" ? "text-orange-500" : "text-green-500"
                                }`}>{report.ai_severity}</span>
                              </div>
                              <div className="col-span-2 md:col-span-3">
                                <span className="text-slate-400 block">Assigned Response Agency:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{report.ai_assigned_agency}</span>
                              </div>
                              <div className="col-span-2 md:col-span-3 mt-1.5 pt-1.5 border-t border-slate-200/50 dark:border-gray-700/50">
                                <span className="text-slate-400 block">Recommended Action/Intervention:</span>
                                <p className="text-slate-700 dark:text-slate-300 italic font-medium mt-0.5 leading-normal">{report.ai_recommendation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="flex md:flex-col gap-2 shrink-0 justify-end md:justify-start">
                        {report.status !== "Approved" && (
                          <button
                            onClick={() => approve(report.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition shadow-sm cursor-pointer"
                          >
                            <CheckCircle size={15} />
                            Approve Report
                          </button>
                        )}

                        {report.status !== "Rejected" && (
                          <button
                            onClick={() => reject(report.id)}
                            className="bg-red-100 dark:bg-red-950/30 text-red-600 hover:bg-red-200 px-3.5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer"
                          >
                            <XCircle size={15} />
                            Reject Report
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: COMMUNITY RISKS SCORECARD */}
          {adminTab === "risks" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-green-600" />
                <h3 className="font-bold text-lg dark:text-white">Community Hazards & Safety Scorecard</h3>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Real-time hazard indexes and resolution metrics compiled per community.
              </p>

              {communityRisks.length === 0 ? (
                <p className="text-gray-400 text-xs py-4">No community hazard indices computed yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communityRisks.map((cr) => {
                    let badge = "bg-green-500/10 text-green-600 border-green-500/20";
                    if (cr.status === "Critical Risk") badge = "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
                    else if (cr.status === "High Risk") badge = "bg-orange-500/10 text-orange-600 border-orange-500/20";
                    else if (cr.status === "Moderate Risk") badge = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";

                    return (
                      <div key={cr.id} className="p-4 border dark:border-gray-700 rounded-xl bg-slate-50/50 dark:bg-gray-900/30 flex flex-col justify-between hover-lift">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-xs truncate max-w-[60%]">{cr.community}</h4>
                            <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border ${badge}`}>
                              {cr.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 space-y-1">
                            <div>Logged Incidents: {cr.total_incidents}</div>
                            <div>Resolved Cases: {cr.resolved_incidents}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span>Risk Index:</span>
                            <span className="font-bold">{cr.risk_score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${
                                cr.risk_score > 80 ? "bg-red-500" : cr.risk_score > 60 ? "bg-orange-500" : cr.risk_score > 30 ? "bg-yellow-500" : "bg-green-500"
                              }`}
                              style={{ width: `${cr.risk_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI RECOMMENDATIONS */}
          {adminTab === "recommendations" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <LayoutDashboard className="text-emerald-600" />
                <h3 className="font-bold text-lg dark:text-white">AI-Powered Safety Recommendations</h3>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Automated hazard prevention suggestions computed from reports trends.
              </p>

              <div className="space-y-3">
                {recommendations.length === 0 ? (
                  <p className="text-gray-400 text-xs py-4">No recommendations generated yet.</p>
                ) : (
                  recommendations.map((rec, idx) => {
                    let badge = "bg-green-500/10 text-green-600 border-green-500/20";
                    if (rec.priority === "Critical") badge = "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
                    else if (rec.priority === "High") badge = "bg-orange-500/10 text-orange-600 border-orange-500/20";
                    else if (rec.priority === "Medium") badge = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";

                    return (
                      <div key={idx} className="p-4 border dark:border-gray-700 rounded-xl bg-slate-50/50 dark:bg-gray-900/20 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 hover-lift">
                        <div>
                          <div className="flex items-center gap-2.5 mb-1">
                            <span className={`text-[8px] font-extrabold tracking-wider px-2 py-0.5 rounded border ${badge}`}>
                              {rec.priority} PRIORITY
                            </span>
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{rec.title}</h4>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">{rec.desc}</p>
                        </div>
                        <button className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shrink-0 cursor-pointer">
                          Acknowledge Action
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SMS BROADCAST FEED */}
          {adminTab === "sms" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="text-green-600" />
                <h3 className="font-bold text-lg dark:text-white">Emergency SMS Broadcasting Center</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Broadcast Form */}
                <div className="p-5 border dark:border-gray-700 rounded-2xl bg-slate-50/30 dark:bg-gray-900/10">
                  <h3 className="font-bold text-sm mb-4 dark:text-white">Broadcast Emergency Notification</h3>
                  <form onSubmit={handleSendSMS} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Target Community / Location:</label>
                      <input
                        type="text"
                        value={smsCommunity}
                        onChange={(e) => setSmsCommunity(e.target.value)}
                        placeholder="e.g. Obio-Akpor, Port Harcourt"
                        className="w-full bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-green-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Alert Message:</label>
                      <textarea
                        rows="4"
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                        placeholder="🚨 ECOSAFE EMERGENCY ALERT: ..."
                        className="w-full bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-green-600 resize-none font-sans"
                        required
                      ></textarea>
                    </div>

                    {smsError && <p className="text-xs text-red-500 font-bold">{smsError}</p>}
                    {smsSuccess && <p className="text-xs text-green-500 font-bold">{smsSuccess}</p>}

                    <button
                      type="submit"
                      disabled={smsLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer"
                    >
                      {smsLoading ? "Broadcasting Alerts..." : "Dispatch SMS Broadcast"}
                    </button>
                  </form>
                </div>

                {/* Broadcast Logs */}
                <div className="p-5 border dark:border-gray-700 rounded-2xl bg-slate-50/30 dark:bg-gray-900/10 flex flex-col">
                  <h3 className="font-bold text-sm mb-4 dark:text-white">Live SMS Broadcast Logs</h3>
                  <div className="flex-1 overflow-y-auto max-h-72 space-y-3 pr-1">
                    {smsLogs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No SMS dispatches logged yet.</p>
                    ) : (
                      smsLogs.map((log) => (
                        <div key={log.id} className="p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900/50 text-[11px]">
                          <div className="flex justify-between items-center mb-1 text-slate-400">
                            <span>Target: <strong>{log.community}</strong></span>
                            <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-200 font-mono text-[10px] bg-slate-50 dark:bg-slate-800 p-2 rounded leading-relaxed border dark:border-gray-700">{log.message}</p>
                          <div className="flex justify-between items-center mt-1.5 text-[9px] text-gray-400 font-medium">
                            <span>Provider: {log.provider}</span>
                            <span className="text-emerald-500 font-bold">{log.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* LOGOUT POPUP */}
        {logoutPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-80">

              <h2 className="text-lg font-semibold mb-4 dark:text-white">
                Confirm Logout
              </h2>

              <div className="flex justify-end gap-3">

                <button
                  onClick={() => setLogoutPopup(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200"
                >
                  Cancel
                </button>

                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= NAV ITEM ================= */
function NavItem({ text, icon, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition ${
        active
          ? "bg-green-100 text-green-700"
          : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
      }`}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

/* ================= CARD ================= */
function Card({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm flex justify-between items-center transition hover-lift">
      <div>
        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{title}</p>
        <h2 className="text-2xl font-extrabold mt-1.5 dark:text-white">{value}</h2>
      </div>
      <div className={`p-3 rounded-2xl shrink-0 ${color || "bg-green-500/10 text-green-600 dark:text-green-400"}`}>
        {icon}
      </div>
    </div>
  );
}