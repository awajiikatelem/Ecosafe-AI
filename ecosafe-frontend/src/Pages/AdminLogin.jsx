import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  Building2,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organization: "",
    email: "",
    password: "",
    accessCode: "",
  });

  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const res = await fetch("http://localhost:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unauthorized access");
        return;
      }

      // Save token
      localStorage.setItem("adminToken", data.token);

      navigate("/AdminDashboard");
    } catch (err) {
      setError("Server connection failure. Please try again.");
    }    
  };

  return (   
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 md:p-10 relative">
      
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 hover:scale-105 transition text-xs font-bold text-gray-600 outline-none"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

        {/* LEFT INFO PANEL */}
        <div className="bg-gradient-to-br from-green-700 to-emerald-850 text-white p-10 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">EcoSafe Control Room</h2>
          </div>

          <p className="text-xs leading-relaxed opacity-90 mb-8 font-light relative z-10">
            This dashboard is restricted to officially recognized environmental protection bodies, municipal responders, and government entities (e.g. NESREA) responsible for hazard mitigation and verification.
          </p>

          <div className="bg-black/15 border border-white/10 p-5 rounded-2xl text-[11px] leading-relaxed space-y-2 relative z-10">
            <p>✔ Real-time report dispatch maps</p>
            <p>✔ Actionable administrative commands</p>
            <p>✔ User reward multiplier options</p>
            <p>✔ Broadcast emergency safety alerts</p>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="p-8 md:p-12 space-y-6">

          <div className="text-center">
            <h3 className="text-xl font-extrabold text-gray-800">Authorized Officer Login</h3>
            <p className="text-xs text-gray-400 mt-1">
              Provide credentials issued by EcoSafe Management
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200/50 text-red-700 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">

            {/* ORGANIZATION */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Building2 size={14} /> Organization Agency
              </label>
              <input
                type="text"
                placeholder="e.g. NESREA, NEMA, Fire Service"
                value={form.organization}
                onChange={(e) =>
                  setForm({ ...form, organization: e.target.value })
                }
                className="w-full p-3 text-xs border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                placeholder="e.g. officer@nesrea.gov.ng"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full p-3 text-xs border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full p-3 text-xs pr-10 border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-9 text-gray-400 hover:text-green-600 transition focus:outline-none cursor-pointer"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* ACCESS CODE */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <KeyRound size={14} /> Official Access Key
              </label>
              <input
                type="text"
                placeholder="Verify administrative credentials key"
                value={form.accessCode}
                onChange={(e) =>
                  setForm({ ...form, accessCode: e.target.value })
                }
                className="w-full p-3 text-xs border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              />
            </div>

            {/* LOGIN BUTTON */}
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-green-600/10 hover:shadow-lg transition cursor-pointer pt-6"
            >
              Access Incident command
            </button>

            <p className="text-[10px] text-gray-400 text-center pt-2">
              ⚠️ Unauthorized attempts to access this terminal will be logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}