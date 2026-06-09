import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function UserAlerts() {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/public/alerts"
      );

      const data = await res.json();

      setAlerts(data);
    } catch (err) {
      console.log(err);
    }
  };

  const getColor = (level) => {
    if (level === "Critical")
      return "bg-red-100 text-red-700 border-red-300";

    if (level === "High")
      return "bg-orange-100 text-orange-700 border-orange-300";

    if (level === "Medium")
      return "bg-yellow-100 text-yellow-700 border-yellow-300";

    return "bg-green-100 text-green-700 border-green-300";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">

      {/* HEADER */}

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="bg-white p-3 rounded-xl shadow"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-3xl font-bold">
            Emergency Community Alerts
          </h1>

          <p className="text-sm text-gray-500">
            Real-time environmental emergency warnings
          </p>
        </div>
      </div>

      {/* LIVE ALERT BANNER */}

      <div className="bg-red-600 text-white p-5 rounded-2xl mb-8 flex items-center gap-3 shadow-lg">
        <Bell />

        <div>
          <p className="font-bold">
            Live Emergency Monitoring Active
          </p>

          <p className="text-sm opacity-90">
            Stay updated with the latest environmental alerts.
          </p>
        </div>
      </div>

      {/* ALERTS */}

      <div className="space-y-6">

        {alerts.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center shadow">
            No emergency alerts available
          </div>
        )}

        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border p-6 rounded-3xl shadow-sm ${getColor(alert.level)}`}
          >
            <div className="flex flex-col md:flex-row md:justify-between gap-4">

              <div className="flex gap-4">

                <div>
                  <ShieldAlert size={30} />
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-2">
                    {alert.title}
                  </h2>

                  <p className="text-sm mb-4">
                    {alert.message}
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs">

                    <span className="bg-white/60 px-3 py-1 rounded-full">
                      Severity: {alert.level}
                    </span>

                    <span className="bg-white/60 px-3 py-1 rounded-full">
                      Target: {alert.target}
                    </span>

                    <span className="bg-white/60 px-3 py-1 rounded-full">
                      {alert.created_at}
                    </span>
                  </div>
                </div>
              </div>

              {/* CALL BUTTON */}

              <div className="flex items-center">
                <a
                  href="tel:112"
                  className="bg-black text-white px-5 py-3 rounded-xl text-sm font-semibold"
                >
                  📞 Emergency Call
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}