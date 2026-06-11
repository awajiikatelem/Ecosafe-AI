import {
  ArrowLeft,
  Locate,
  ShieldAlert,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";

import MarkerClusterGroup from "react-leaflet-cluster";

import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

/* DEFAULT MARKER FIX */
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* ICONS */
const lowIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
});

const criticalIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [35, 55],
});

L.Marker.prototype.options.icon = lowIcon;

/* FLY TO USER */
function FlyToUser({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [position, map]);

  return null;
}

export default function AdvancedMap() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([
          pos.coords.latitude,
          pos.coords.longitude,
        ]);
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve your location. Please check your location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  /* USER LOCATION ON LOAD */
  useEffect(() => {
    handleDetectLocation();
  }, []);

  /* FETCH REPORTS */
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(
          "https://ecosafe-ai-2.onrender.com/all-reports"
        );

        const data = await res.json();

        setReports(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchReports();
  }, []);

  /* FILTER REPORTS */
  const filteredReports = reports.filter((r) => {
    return (
      r.latitude &&
      r.longitude &&
      (filter === "All" || r.priority === filter) &&
      r.title?.toLowerCase().includes(search.toLowerCase())
    );
  });

  /* MARKER COLORS */
  const getMarkerIcon = (priority) => {
    if (priority === "Critical") return criticalIcon;

    return lowIcon;
  };

  /* DANGER ZONE COLORS */
  const getDangerColor = (priority) => {
    if (priority === "Critical") return "red";

    if (priority === "High") return "orange";

    if (priority === "Medium") return "yellow";

    return "green";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/AdminDashboard")}
            className="bg-white p-3 rounded-xl shadow"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">
              EcoSafe Live Monitoring Map
            </h1>

            <p className="text-sm text-gray-500">
              AI-powered environmental hazard tracking
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex gap-3 flex-wrap">

          <input
            type="text"
            placeholder="Search incident..."
            className="px-4 py-2 rounded-xl bg-white shadow text-sm outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="px-4 py-2 rounded-xl bg-white shadow text-sm outline-none"
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* ALERT BANNER */}
      <div className="bg-red-600 text-white p-4 rounded-2xl mb-6 flex items-center gap-3 shadow-lg">
        <ShieldAlert />

        <div>
          <p className="font-semibold">
            AI Emergency Monitoring Active
          </p>

          <p className="text-sm opacity-90">
            Critical environmental hazards are being tracked live.
          </p>
        </div>
      </div>

      {/* MAP */}
      <div className="rounded-3xl overflow-hidden shadow-2xl relative">

        {/* LOCATION BUTTON */}
        <button
          onClick={handleDetectLocation}
          className="absolute top-4 right-4 z-1000 bg-white p-3 rounded-xl shadow-lg hover:bg-gray-100 transition duration-200"
          title="Detect My Location"
        >
          <Locate size={18} />
        </button>

        <MapContainer
          center={[4.8156, 7.0498]}
          zoom={10}
          className="h-[85vh] w-full z-0"
        >
          <FlyToUser position={userLocation} />

          {/* MAP TILES */}
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* USER LOCATION */}
          {userLocation && (
            <Circle
              center={userLocation}
              radius={200}
              pathOptions={{
                color: "blue",
                fillColor: "blue",
                fillOpacity: 0.2,
              }}
            />
          )}

          {/* CLUSTER */}
          <MarkerClusterGroup>

            {filteredReports.map((r) => (
              <React.Fragment key={r.id}>

                {/* DANGER ZONE */}
                <Circle
                  center={[r.latitude, r.longitude]}
                  radius={
                    r.priority === "Critical"
                      ? 1000
                      : r.priority === "High"
                      ? 700
                      : 400
                  }
                  pathOptions={{
                    color: getDangerColor(r.priority),
                    fillColor: getDangerColor(r.priority),
                    fillOpacity: 0.15,
                  }}
                />

                {/* MARKER */}
                <Marker
                  position={[r.latitude, r.longitude]}
                  icon={getMarkerIcon(r.priority)}
                >
                  <Popup>
                    <div className="w-64">

                      <h2 className="font-bold text-lg mb-2">
                        {r.title}
                      </h2>

                      <div className="space-y-2 text-sm">

                        <p>
                          <strong>Category:</strong>{" "}
                          {r.category}
                        </p>

                        <p>
                          <strong>Location:</strong>{" "}
                          {r.location}
                        </p>

                        <p>
                          <strong>Priority:</strong>{" "}
                          {r.priority}
                        </p>

                        <p>
                          <strong>Description:</strong>{" "}
                          {r.description}
                        </p>

                        {/* AI ANALYSIS */}
                        <div className="bg-red-50 border border-red-200 p-3 rounded-xl mt-3">
                          <p className="text-red-700 text-xs font-semibold">
                            🤖 AI Risk Analysis
                          </p>

                          <p className="text-xs mt-1">
                            {r.priority === "Critical"
                              ? "Immediate emergency response recommended. Possible danger to nearby residents."
                              : r.priority === "High"
                              ? "Hazard requires urgent monitoring and rapid response."
                              : "Situation currently stable but should be monitored."}
                          </p>
                        </div>

                        {/* IMAGE */}
                        {r.image && (
                          <img
                            src={r.image}
                            alt="Hazard"
                            className="rounded-xl mt-3 h-36 w-full object-cover"
                          />
                        )}

                        {/* ACTIONS */}
                        <div className="flex gap-2 mt-4">

                          <button
                            onClick={() =>
                              navigate("/alerts")
                            }
                            className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs"
                          >
                            Emergency Alerts
                          </button>

                          <a
                            href="tel:112"
                            className="bg-black text-white px-3 py-2 rounded-lg text-xs"
                          >
                            📞 Call
                          </a>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}