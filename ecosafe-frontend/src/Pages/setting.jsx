import {
  ArrowLeft,
  Bell,
  Shield,
  Moon,
  Sun,
  Database,
  Save,
  Server,
  Lock,
  Smartphone,
  Globe,
  AlertTriangle,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SystemSettings() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [aiDetection, setAiDetection] = useState(true);

  const [settings, setSettings] = useState({
    appName: "EcoSafe",
    emergencyNumber: "+234 800 000 0000",
    serverRegion: "Nigeria",
    maxReports: "5000",
  });

  const handleSave = () => {
    alert("System settings saved successfully");
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow"
            >
              <ArrowLeft className="dark:text-white" size={18} />
            </button>

            <div>
              <h1 className="text-2xl font-bold dark:text-white">
                System Settings
              </h1>

              <p className="text-sm text-gray-500">
                Configure EcoSafe platform preferences and controls
              </p>
            </div>
          </div>

          {/* DARK MODE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow"
          >
            {darkMode ? (
              <Sun className="dark:text-white" size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* GENERAL SETTINGS */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">

              <div className="flex items-center gap-2 mb-6">
                <Globe className="text-green-600" />
                <h2 className="font-semibold text-lg dark:text-white">
                  General Settings
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="text-sm text-gray-500">
                    Application Name
                  </label>

                  <input
                    type="text"
                    value={settings.appName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appName: e.target.value,
                      })
                    }
                    className="w-full mt-2 border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">
                    Emergency Number
                  </label>

                  <input
                    type="text"
                    value={settings.emergencyNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emergencyNumber: e.target.value,
                      })
                    }
                    className="w-full mt-2 border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">
                    Server Region
                  </label>

                  <select
                    value={settings.serverRegion}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        serverRegion: e.target.value,
                      })
                    }
                    className="w-full mt-2 border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl p-3 outline-none"
                  >
                    <option>Nigeria</option>
                    <option>South Africa</option>
                    <option>United Kingdom</option>
                    <option>United States</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500">
                    Maximum Daily Reports
                  </label>

                  <input
                    type="number"
                    value={settings.maxReports}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxReports: e.target.value,
                      })
                    }
                    className="w-full mt-2 border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl p-3 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">

              <div className="flex items-center gap-2 mb-6">
                <Shield className="text-red-500" />
                <h2 className="font-semibold text-lg dark:text-white">
                  Security Controls
                </h2>
              </div>

              <div className="space-y-5">

                <ToggleCard
                  icon={<Lock size={18} />}
                  title="AI Threat Detection"
                  desc="Automatically detect critical environmental risks"
                  enabled={aiDetection}
                  setEnabled={setAiDetection}
                />

                <ToggleCard
                  icon={<AlertTriangle size={18} />}
                  title="Maintenance Mode"
                  desc="Temporarily disable user access"
                  enabled={maintenance}
                  setEnabled={setMaintenance}
                />
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">

              <div className="flex items-center gap-2 mb-6">
                <Bell className="text-yellow-500" />
                <h2 className="font-semibold text-lg dark:text-white">
                  Alert & Notification Settings
                </h2>
              </div>

              <div className="space-y-5">

                <ToggleCard
                  icon={<Bell size={18} />}
                  title="Email Alerts"
                  desc="Send hazard notifications via email"
                  enabled={emailAlerts}
                  setEnabled={setEmailAlerts}
                />

                <ToggleCard
                  icon={<Smartphone size={18} />}
                  title="SMS Alerts"
                  desc="Send SMS emergency broadcasts"
                  enabled={smsAlerts}
                  setEnabled={setSmsAlerts}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* SERVER STATUS */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">

              <div className="flex items-center gap-2 mb-5">
                <Server className="text-blue-500" />
                <h2 className="font-semibold dark:text-white">
                  Server Status
                </h2>
              </div>

              <div className="space-y-4 text-sm">

                <div className="flex justify-between">
                  <span className="text-gray-500">Backend API</span>
                  <span className="text-green-600 font-semibold">
                    Online
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Database</span>
                  <span className="text-green-600 font-semibold">
                    Connected
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">AI Monitoring</span>
                  <span className="text-green-600 font-semibold">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* DATABASE */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">

              <div className="flex items-center gap-2 mb-5">
                <Database className="text-purple-500" />
                <h2 className="font-semibold dark:text-white">
                  Database Info
                </h2>
              </div>

              <div className="space-y-4 text-sm">

                <div className="flex justify-between">
                  <span className="text-gray-500">Database Type</span>
                  <span className="dark:text-white">
                    SQLite
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Stored Reports</span>
                  <span className="dark:text-white">
                    4,200+
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Last Backup</span>
                  <span className="dark:text-white">
                    Today
                  </span>
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 font-semibold transition"
            >
              <Save size={18} />
              Save System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* TOGGLE CARD */
function ToggleCard({
  icon,
  title,
  desc,
  enabled,
  setEnabled,
}) {
  return (
    <div className="flex items-center justify-between border dark:border-gray-700 rounded-xl p-4">

      <div className="flex items-start gap-3">

        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
          {icon}
        </div>

        <div>
          <h3 className="font-medium dark:text-white">
            {title}
          </h3>

          <p className="text-sm text-gray-500">
            {desc}
          </p>
        </div>
      </div>

      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-14 h-7 rounded-full transition flex items-center px-1 ${
          enabled
            ? "bg-green-500 justify-end"
            : "bg-gray-300 justify-start"
        }`}
      >
        <div className="bg-white w-5 h-5 rounded-full" />
      </button>
    </div>
  );
}