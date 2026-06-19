import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  AlertTriangle,
  Radio,
  Smartphone,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AlertBroadcast() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    message: "",
    level: "Medium",
    target: "All Residents",
    method: [],
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://ecosafe-ai-kovp.onrender.com"}/admin/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleMethod = (method) => {
    setForm((prev) => ({
      ...prev,
      method: prev.method.includes(method)
        ? prev.method.filter((m) => m !== method)
        : [...prev.method, method],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("adminToken");

      let aiLevel = form.level;

      if (
        form.message.toLowerCase().includes("explosion") ||
        form.message.toLowerCase().includes("death") ||
        form.message.toLowerCase().includes("critical")
      ) {
        aiLevel = "Critical";
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://ecosafe-ai-kovp.onrender.com"}/admin/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, level: aiLevel }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to broadcast alert");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setForm({
        title: "",
        message: "",
        level: "Medium",
        target: "All Residents",
        method: [],
      });

      fetchAlerts();
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4 md:p-10">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-white p-3 rounded-xl shadow hover:scale-105 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Emergency Alert Broadcast Center
            </h1>
            <p className="text-sm text-gray-500">
              Send real-time safety alerts to communities
            </p>
          </div>
        </div>

        {/* WARNING */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl mb-6 flex gap-3">
          <AlertTriangle className="text-yellow-600 mt-1" />
          <div>
            <p className="font-semibold text-yellow-800">
              Critical Alert Protocol Active
            </p>
            <p className="text-sm text-yellow-600">
              Emergency alerts are instantly delivered to selected audiences.
            </p>
          </div>
        </div>

        {/* STATUS */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl">
            Alert successfully broadcasted
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* FORM CARD */}
        <div className="bg-white rounded-3xl shadow-lg p-5 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="text-red-600" />
            <h2 className="text-xl md:text-2xl font-bold">
              Create Emergency Broadcast
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TITLE */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Alert Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Oil Spill Emergency Warning"
                className="mt-2 w-full p-4 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Residents should avoid..."
                className="mt-2 w-full p-4 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="p-4 rounded-xl border"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <select
                name="target"
                value={form.target}
                onChange={handleChange}
                className="p-4 rounded-xl border"
              >
                <option>All Residents</option>
                <option>Bonny Island</option>
                <option>Port Harcourt</option>
                <option>Emergency Agencies</option>
                <option>Industrial Areas</option>
              </select>
            </div>

            {/* METHODS */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Broadcast Methods
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {[
                  { name: "SMS", icon: Smartphone },
                  { name: "Push Notification", icon: Bell },
                  { name: "Radio Broadcast", icon: Radio },
                ].map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleMethod(name)}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition ${
                      form.method.includes(name)
                        ? "bg-red-50 border-red-500"
                        : "hover:border-red-300"
                    }`}
                  >
                    <Icon />
                    <span className="text-sm">{name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col md:flex-row gap-4 pt-4">

              <button
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-semibold flex justify-center items-center gap-2"
              >
                <Send size={18} />
                {loading ? "Broadcasting..." : "Send Alert"}
              </button>

              <a
                href="tel:112"
                className="flex-1 bg-black text-white py-4 rounded-2xl font-semibold text-center"
              >
                Emergency Call
              </a>
            </div>
          </form>
        </div>

        {/* HISTORY */}
        <div className="mt-10 bg-white rounded-3xl shadow-lg p-5 md:p-8">
          <h2 className="text-xl font-bold mb-5">
            Alert History
          </h2>

          <div className="space-y-4">
            {alerts.length === 0 && (
              <p className="text-gray-500 text-sm">
                No alerts yet
              </p>
            )}

            {alerts.map((alert) => {
              const borderColors = {
                Critical: "border-l-4 border-l-red-600 bg-red-50/5",
                High: "border-l-4 border-l-orange-500 bg-orange-50/5",
                Medium: "border-l-4 border-l-yellow-500 bg-yellow-50/5",
                Low: "border-l-4 border-l-green-500 bg-green-50/5"
              };

              const badgeColors = {
                Critical: "bg-red-100 text-red-700 border-red-200/50",
                High: "bg-orange-100 text-orange-700 border-orange-200/50",
                Medium: "bg-yellow-100 text-yellow-700 border-yellow-200/50",
                Low: "bg-green-100 text-green-700 border-green-200/50"
              };

              return (
                <div
                  key={alert.id}
                  className={`border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition ${
                    borderColors[alert.level] || "border-l-4 border-l-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-center gap-4 flex-wrap">
                    <h3 className="font-bold text-gray-800 text-xs">{alert.title}</h3>
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      badgeColors[alert.level] || "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {alert.level}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="text-[10px] font-semibold text-gray-400 mt-4 flex gap-4 flex-wrap">
                    <span>📍 Target: {alert.target}</span>
                    <span>🕒 Sent: {alert.created_at}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}