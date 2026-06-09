import {
  Bell,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useState } from "react";

export default function Alerts() {
  const [filter, setFilter] = useState("All");

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "Critical",
      title: "Oil Spill Detected in Bonny",
      message: "Immediate action required to prevent marine damage.",
      time: "10 mins ago",
      read: false,
    },
    {
      id: 2,
      type: "Warning",
      title: "Blocked Drainage in Port Harcourt",
      message: "Possible flooding if not cleared soon.",
      time: "30 mins ago",
      read: false,
    },
    {
      id: 3,
      type: "Info",
      title: "Waste Dump Cleared",
      message: "Illegal waste site has been successfully removed.",
      time: "1 hour ago",
      read: true,
    },
  ]);

  const filteredAlerts = alerts.filter(
    (a) => filter === "All" || a.type === filter
  );

  const markAsRead = (id) => {
    setAlerts(
      alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a
      )
    );
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const getIcon = (type) => {
    if (type === "Critical") return <AlertTriangle className="text-red-500" />;
    if (type === "Warning") return <Bell className="text-yellow-500" />;
    return <Info className="text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">
            Alerts & Notifications
          </h1>
          <p className="text-sm text-gray-500">
            Stay informed about environmental hazards
          </p>
        </div>

        <select
          className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>Critical</option>
          <option>Warning</option>
          <option>Info</option>
        </select>
      </div>

      {/* ALERT LIST */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex flex-col md:flex-row justify-between gap-4 ${
              alert.read ? "opacity-70" : ""
            }`}
          >
            <div className="flex gap-3">
              <div className="mt-1">{getIcon(alert.type)}</div>

              <div>
                <h3 className="font-semibold dark:text-white">
                  {alert.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {alert.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {alert.time}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 items-center">
              {!alert.read && (
                <button
                  onClick={() => markAsRead(alert.id)}
                  className="text-green-600 hover:scale-110 transition"
                  title="Mark as read"
                >
                  <CheckCircle size={20} />
                </button>
              )}

              <button
                onClick={() => deleteAlert(alert.id)}
                className="text-red-600 hover:scale-110 transition"
                title="Delete alert"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center mt-10 text-gray-500">
          No alerts found.
        </div>
      )}
    </div>
  );
}