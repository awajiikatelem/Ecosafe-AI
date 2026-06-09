import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function IncidentReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/admin/reports", {
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
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/admin/report/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      fetchReports();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title?.toLowerCase().includes(search.toLowerCase()) ||
      report.location?.toLowerCase().includes(search.toLowerCase()) ||
      report.category?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || report.status === filter;

    return matchesSearch && matchesFilter;
  });

  const priorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/AdminDashboard")}
            className="bg-white p-3 rounded-xl shadow hover:scale-105 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Incident Reports Center
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Monitor, verify and manage environmental hazard incidents.
            </p>
          </div>
        </div>

        <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <AlertTriangle size={18} />
          Live Incident Monitoring Active
        </div>
      </div>

      {/* STATS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-white rounded-2xl p-5 shadow">
          <p className="text-sm text-gray-500">Total Reports</p>
          <h2 className="text-3xl font-bold mt-2">{reports.length}</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow">
          <p className="text-sm text-gray-500">Pending Cases</p>
          <h2 className="text-3xl font-bold mt-2 text-yellow-600">
            {
              reports.filter(
                (r) => r.status === "Pending" || !r.status
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow">
          <p className="text-sm text-gray-500">Resolved Cases</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {reports.filter((r) => r.status === "Approved").length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow">
          <p className="text-sm text-gray-500">Critical Alerts</p>
          <h2 className="text-3xl font-bold mt-2 text-red-600">
            {reports.filter((r) => r.priority === "Critical").length}
          </h2>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-2xl shadow p-4 mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

        <div className="relative w-full md:w-96">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by title, category or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter size={18} className="text-gray-500" />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* REPORTS */}
      <div className="space-y-5">

        {loading ? (
          <div className="bg-white rounded-2xl p-10 shadow text-center text-gray-500">
            Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow text-center text-gray-500">
            No incident reports found.
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-3xl shadow-lg overflow-hidden"
            >
              <div className="p-6">

                <div className="flex flex-col lg:flex-row lg:justify-between gap-6">

                  {/* LEFT */}
                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-3 mb-4">

                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <ShieldAlert size={14} />
                        {report.category || "Hazard"}
                      </div>

                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColor(
                          report.priority
                        )}`}
                      >
                        {report.priority || "Medium"} Priority
                      </div>

                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                          report.status || "Pending"
                        )}`}
                      >
                        {report.status || "Pending"}
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      {report.title}
                    </h2>

                    <p className="text-gray-600 leading-relaxed mb-5">
                      {report.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-500">

                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-red-500" />
                        {report.location}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-500" />
                        {report.created_at || "Recently submitted"}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col gap-3 min-w-[220px]">

                    <button
                      onClick={() => navigate(`/map`)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <Eye size={16} />
                      View on Map
                    </button>

                    <button
                      onClick={() => updateStatus(report.id, "Approved")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <CheckCircle size={16} />
                      Approve Incident
                    </button>

                    <button
                      onClick={() => updateStatus(report.id, "Rejected")}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <XCircle size={16} />
                      Reject Incident
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
