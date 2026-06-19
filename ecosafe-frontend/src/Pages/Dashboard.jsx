import {
  LayoutDashboard,
  FileText,
  Map,
  Bell,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  PlusCircle,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCommunityRisks } from "../api";
import ChatbotWidget from "../Components/ChatbotWidget";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [profile, setProfile] = useState({ name: "User", email: "", points: 0, badge: "Eco Novice 🛡️" });

  // ✅ REAL REPORTS FROM BACKEND
  const [reports, setReports] = useState([]);
  const [communityRisks, setCommunityRisks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAllData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const headers = { Authorization: `Bearer ${token}` };

        const [reportsRes, profileRes, risksData, notifRes] = await Promise.all([
          fetch(`${baseUrl}/report`, { headers }),
          fetch(`${baseUrl}/profile`, { headers }),
          getCommunityRisks(),
          fetch(`${baseUrl}/notifications`, { headers })
        ]);

        if (reportsRes.ok) {
          const data = await reportsRes.json();
          if (Array.isArray(data)) setReports(data);
        }
        if (profileRes.ok) {
          setProfile(await profileRes.json());
        }
        if (Array.isArray(risksData)) {
          setCommunityRisks(risksData);
        }
        if (notifRes.ok) {
          setNotifications(await notifRes.json());
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    // Define individual fetchers for Socket.IO single-updates
    const fetchReports = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/report`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setReports(data);
      } catch (err) { console.error(err); }
    };
    
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setNotifications(await res.json());
      } catch (err) { console.error(err); }
    };

    fetchAllData();

    import("socket.io-client").then(({ default: io }) => {
      const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
      
      socket.on("new-report", fetchReports);
      socket.on("report-updated", fetchReports);
      socket.on("new-notification", fetchNotifications);

      return () => {
        socket.disconnect();
      };
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-semibold animate-pulse text-sm">Loading EcoSafe Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${dark ? "bg-gray-900 text-white" : "bg-gray-100"} flex min-h-screen`}>

      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-screen w-64 p-5 flex-col justify-between ${dark ? "bg-gray-800" : "bg-white"} shadow`}>
        <div>
          <h2 className="text-xl font-bold mb-4">
            Eco<span className="text-green-600">Safe</span>
          </h2>

          {/* USER PROFILE CARD */}
          <div className={`p-4 rounded-2xl mb-6 flex flex-col gap-2 ${dark ? "bg-gray-700" : "bg-green-50"} border border-green-200/50`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {profile.name[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{profile.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-200/60 text-green-900 font-bold block w-fit truncate mt-0.5">{profile.badge}</span>
              </div>
            </div>
            <div className="mt-2 text-xs flex justify-between items-center">
              <span className="opacity-75">Score:</span>
              <span className="font-bold text-green-600 dark:text-green-400">{profile.points} pts</span>
            </div>
            {/* Progress bar to next badge */}
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
              <div 
                className="bg-green-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (profile.points % 150) / 1.5)}%` }}
              ></div>
            </div>
          </div>

          <NavItem icon={<LayoutDashboard size={18} />} text="Dashboard" active />
          <NavItem icon={<FileText size={18} />} text="My Reports" onClick={() => navigate("/MyReport")} />
          <NavItem icon={<Map size={18} />} text="Map View" onClick={() => navigate("/Map")} />
          <NavItem icon={<Bell size={18} />} text="Alerts" onClick={() => navigate("/userAlerts")} />
          <NavItem icon={<Users size={18} />} text="Community" onClick={() => navigate("/Awareness")} />
          <NavItem icon={<Shield size={18} />} text="Admin Login" onClick={() => navigate("/AdminLogin")} />
        </div>

        <div onClick={() => setLogoutOpen(true)} className="text-red-500 cursor-pointer flex gap-2">
          <LogOut size={18} /> Logout
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className={`fixed left-0 top-0 h-screen w-64 p-5 flex-col justify-between ${dark ? "bg-gray-800" : "bg-white"} shadow`}>
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  Eco<span className="text-green-600">Safe</span>
                </h2>
                <X onClick={() => setSidebarOpen(false)} />
              </div>

              {/* USER PROFILE CARD (MOBILE) */}
              <div className={`p-4 rounded-2xl mb-6 flex flex-col gap-2 ${dark ? "bg-gray-700" : "bg-green-50"} border border-green-200/50`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {profile.name[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{profile.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-200/60 text-green-900 font-bold block w-fit truncate mt-0.5">{profile.badge}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs flex justify-between items-center">
                  <span className="opacity-75">Score:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{profile.points} pts</span>
                </div>
                {/* Progress bar to next badge */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-green-600 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (profile.points % 150) / 1.5)}%` }}
                  ></div>
                </div>
              </div>

              <NavItem icon={<LayoutDashboard size={18} />} text="Dashboard" active />
              <NavItem icon={<FileText size={18} />} text="My Reports" onClick={() => navigate("/myreport")} />
              <NavItem icon={<Map size={18} />} text="Map View" onClick={() => navigate("/Map")} />
              <NavItem icon={<Bell size={18} />} text="Alerts" onClick={() => navigate("/Alert")} />
              <NavItem icon={<Users size={18} />} text="Community" onClick={() => navigate("/Awareness")} />
              <NavItem icon={<Shield size={18} />} text="Admin Login" onClick={() => navigate("/AdminLogin")} />
            </div>

            <div onClick={() => setLogoutOpen(true)} className="text-red-500 cursor-pointer flex gap-2">
              <LogOut size={18} /> Logout
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-64 p-4 md:p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <Menu className="md:hidden" onClick={() => setSidebarOpen(true)} />

          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm opacity-70">Live environmental monitoring</p>
          </div>

          <div className="flex gap-5">
            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                )}
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg border z-50 overflow-hidden ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className={`p-3 border-b font-bold text-sm flex justify-between items-center ${dark ? "border-gray-700 bg-gray-900/50" : "bg-slate-50"}`}>
                    <span>System Alerts</span>
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px]">{notifications.length} New</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">No new alerts.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b text-xs flex gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer ${dark ? "border-gray-700" : "border-gray-50"}`}>
                          <div className="mt-0.5 shrink-0">
                            {n.type === "Critical_Alert" ? <AlertTriangle size={14} className="text-red-500" /> : <Bell size={14} className="text-blue-500" />}
                          </div>
                          <div>
                            <p className="font-semibold mb-1 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] opacity-60">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => navigate("/ReportPage")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex gap-2"
            >
              <PlusCircle size={18} /> Report Hazard
            </button>

            <button
      onClick={() =>
        navigate("/FireOutbreak", { state: { category: "Fire Outbreak" } })
      }
      className="bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-sm md:text-base animate-pulse"
    >
      <AlertTriangle size={18} />
      <span className="hidden sm:inline">Fire Outbreak</span>
    </button>

          </div>
        </div>

        {/* STATS (REAL DATA) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total Reports" value={reports.length} icon={<FileText size={20} />} dark={dark} />
          <StatCard
            title="Critical"
            value={reports.filter(r => r.priority === "Critical").length}
            icon={<AlertTriangle size={20} />}
            dark={dark}
          />
          <StatCard
            title="Pending"
            value={reports.filter(r => r.status === "Pending").length}
            icon={<Clock size={20} />}
            dark={dark}
          />
          <StatCard
            title="Low Risk"
            value={reports.filter(r => r.priority === "Low").length}
            icon={<CheckCircle size={20} />}
            dark={dark}
          />
          <StatCard
            title="Medium"
            value={reports.filter(r => r.priority === "Medium").length}
            icon={<Shield size={20} />}
            dark={dark}
          />
          <StatCard
            title="High"
            value={reports.filter(r => r.priority === "High").length}
            icon={<Sun size={20} />}
            dark={dark}
          />
        </div>

        {/* RECENT REPORTS & COMMUNITY RISK */}
        <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-6 mb-8">

          {/* CRITICAL */}
          <div className={`${dark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-100"} p-6 rounded-2xl shadow-sm border`}>
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-red-600 dark:text-red-400 mb-4">
              Critical & High Priority
            </h2>

            {reports.filter(r => r.priority === "Critical" || r.priority === "High").length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No critical incidents logged.</p>
            ) : (
              reports
                .filter(r => r.priority === "Critical" || r.priority === "High")
                .slice(0, 5)
                .map(r => (
                  <Report key={r.id} title={r.title} status={r.priority} dark={dark} />
                ))
            )}
          </div>

          {/* LOW / MEDIUM */}
          <div className={`${dark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-100"} p-6 rounded-2xl shadow-sm border`}>
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-green-600 dark:text-green-400 mb-4">
              Low & Medium Priority
            </h2>

            {reports.filter(r => r.priority === "Low" || r.priority === "Medium").length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No warnings logged.</p>
            ) : (
              reports
                .filter(r => r.priority === "Low" || r.priority === "Medium")
                .slice(0, 5)
                .map(r => (
                  <Report key={r.id} title={r.title} status={r.priority} dark={dark} />
                ))
            )}
          </div>

          {/* COMMUNITY RISK INDEX */}
          <div className={`${dark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-100"} p-6 rounded-2xl shadow-sm border`}>
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4">
              Community Risk Index
            </h2>

            {communityRisks.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No community risk indexes calculated yet.</p>
            ) : (
              communityRisks.slice(0, 5).map((cr) => {
                let badgeColor = "bg-green-500/10 text-green-600 border-green-500/20";
                if (cr.status === "Critical Risk") badgeColor = "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
                else if (cr.status === "High Risk") badgeColor = "bg-orange-500/10 text-orange-600 border-orange-500/20";
                else if (cr.status === "Moderate Risk") badgeColor = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";

                return (
                  <div key={cr.id} className={`p-4 border rounded-xl mb-3 ${dark ? "border-gray-700/60 bg-gray-900/30" : "border-gray-100 bg-slate-50/50"}`}>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-bold truncate max-w-[60%]">{cr.community}</h4>
                      <span className={`text-[8px] font-extrabold tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                        {cr.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-2">
                      <span>Incidents: {cr.total_incidents} ({cr.resolved_incidents} resolved)</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Risk Score: {cr.risk_score}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all ${
                          cr.risk_score > 80 ? "bg-red-500" : cr.risk_score > 60 ? "bg-orange-500" : cr.risk_score > 30 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${cr.risk_score}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* Floating AI Chatbot drawer */}
      <ChatbotWidget />

      {/* LOGOUT MODAL */}
      {logoutOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-sm w-full border border-gray-100 dark:border-gray-700 shadow-xl text-center">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">Confirm Logout</h3>
            <p className="text-xs text-gray-500 mb-6">Are you sure you want to end your current session?</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setLogoutOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-200 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-red-600/10 transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* SMALL COMPONENTS */

function NavItem({ icon, text, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-semibold text-xs transition ${
        active 
          ? "bg-green-600 text-white shadow-md shadow-green-600/10" 
          : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function StatCard({ title, value, icon, dark }) {
  return (
    <div className={`p-5 rounded-2xl border flex justify-between items-center transition hover-lift shadow-sm ${
      dark 
        ? "bg-gray-800 border-gray-700/60 text-white" 
        : "bg-white border-gray-100 text-gray-800"
    }`}>
      <div>
        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{title}</p>
        <h2 className="text-xl font-extrabold mt-1">{value}</h2>
      </div>
      <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-2.5 rounded-xl shrink-0">
        {icon}
      </div>
    </div>
  );
}

function Report({ title, status, dark }) {
  const color =
    status === "Critical"
      ? "bg-red-500/10 text-red-600 border-red-500/20"
      : status === "High"
      ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
      : status === "Medium"
      ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      : "bg-green-500/10 text-green-600 border-green-500/20";

  return (
    <div className={`flex justify-between items-center border p-4 rounded-xl mb-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors ${
      dark ? "border-gray-700/60" : "border-gray-100"
    }`}>
      <p className="text-xs font-semibold leading-relaxed max-w-[70%] truncate dark:text-gray-200">{title}</p>
      <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${color} shrink-0`}>
        {status}
      </span>
    </div>
  );
}