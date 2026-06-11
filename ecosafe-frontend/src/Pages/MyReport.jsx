import {
  FileText,
  Search,
  Eye,
  Trash2,
  ArrowLeft,
  Flame,
  PlusCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MyReports() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [reports, setReports] = useState([]);

  // ✅ FETCH REPORTS
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://ecosafe-ai-2.onrender.com/myreports", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  // ✅ DELETE REPORT
  const deleteReport = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`https://ecosafe-ai-2.onrender.com/report/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const idToDelete = deleteId;
      setDeleteId(null);
      setReports(prev => prev.filter(r => r.id !== idToDelete));
    } catch (err) {
      console.log(err);
    }
  };

  const filteredReports = reports.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-lg bg-white shadow"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">My Reports</h1>
            <p className="text-sm text-gray-500">
              Manage and track your hazard reports
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate("/ReportPage")}
            className="flex items-center gap-2 bg-green-650 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition hover-lift cursor-pointer"
          >
            <PlusCircle size={16} />
            Report Hazard
          </button>

          <button
            onClick={() => navigate("/FireOutbreak")}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition hover-lift cursor-pointer"
          >
            <Flame size={16} />
            Fire Outbreak
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
          <Search size={18} className="mr-2" />
          <input
            type="text"
            placeholder="Search reports..."
            className="bg-transparent outline-none w-full text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="grid grid-cols-5 px-6 py-4 bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-wider gap-6 border-b border-gray-100">
          <span>Title</span>
          <span>Location</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right pr-4">Actions</span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 font-medium">No reports recorded.</div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="grid grid-cols-5 items-center px-6 py-4.5 border-t border-gray-100 hover:bg-gray-50/35 transition gap-5 text-xs text-gray-600 font-medium"
            >
              <span className="font-bold text-gray-800 truncate">{report.title}</span>
              <span className="truncate">📍 {report.location}</span>
              <span className="text-gray-400 font-normal">{new Date(report.created_at).toDateString()}</span>

              <div>
                <StatusBadge status={report.priority} />
              </div>
              
              <div className="flex gap-4 justify-end pr-4">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="text-gray-400 hover:text-green-600 transition cursor-pointer p-1"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => setDeleteId(report.id)}
                  className="text-gray-400 hover:text-red-600 transition cursor-pointer p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}

      </div>

      {/* VIEW MODAL */}
      {/* VIEW MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 leading-tight">
                  {selectedReport.title}
                </h2>
                <p className="text-xs text-gray-500 mt-1">📍 {selectedReport.location}</p>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                selectedReport.status === "Approved" 
                  ? "bg-green-100 text-green-800" 
                  : selectedReport.status === "Rejected" 
                  ? "bg-red-100 text-red-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {selectedReport.status || "Pending"}
              </span>
            </div>

            {selectedReport.image && (
              <img 
                src={selectedReport.image} 
                alt="Evidence" 
                className="w-full h-48 object-cover rounded-xl mb-4 border border-gray-100"
              />
            )}

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-400">Priority:</span>
              <StatusBadge status={selectedReport.priority} />
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 max-h-24 overflow-y-auto">
                {selectedReport.description}
              </p>
            </div>

            {/* AI IMAGE ANALYSIS LOGS */}
            {selectedReport.image && selectedReport.ai_image_analysis && (
              <div className={`p-4 rounded-xl border text-[11px] leading-normal mb-4 flex flex-col gap-1.5 ${
                selectedReport.ai_image_valid === 1 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                <span className="font-bold flex items-center gap-1 text-[11px]">
                  {selectedReport.ai_image_valid === 1 ? "🤖 AI Validated Evidence" : "⚠️ AI Verification Refuted"}
                </span>
                <p className="opacity-95">{selectedReport.ai_image_analysis}</p>
              </div>
            )}

            {/* AI SAFETY TIPS CHECKLIST */}
            {selectedReport.ai_tips && (
              <div className="bg-emerald-50 border border-green-200 p-4 rounded-xl mb-6">
                <h4 className="font-bold text-xs text-green-800 flex items-center gap-1.5 mb-2">
                  🛡️ AI Safety Protocol
                </h4>
                <ul className="list-disc pl-4 space-y-1.5">
                  {(Array.isArray(selectedReport.ai_tips)
                    ? selectedReport.ai_tips
                    : (() => {
                        try {
                          return JSON.parse(selectedReport.ai_tips);
                        } catch (e) {
                          return [];
                        }
                      })()
                  ).map((tip, index) => (
                    <li key={index} className="text-[11px] text-green-700 leading-normal">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setSelectedReport(null)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm shadow transition cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* DELETE POPUP */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[90%] md:w-87.5 text-center">
            <h3 className="font-semibold mb-3">Delete Report?</h3>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-200 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={deleteReport}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Critical: "bg-red-100 text-red-600",
    High: "bg-orange-100 text-orange-600",
    Medium: "bg-yellow-100 text-yellow-600",
    Low: "bg-green-100 text-green-600",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}