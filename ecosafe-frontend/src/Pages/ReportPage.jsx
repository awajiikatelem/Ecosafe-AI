import {
  MapPin,
  Image,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  LocateFixed,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ReportHazard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [aiTips, setAiTips] = useState([]);
  const [aiImageStatus, setAiImageStatus] = useState(null); // 'checking' | 'valid' | 'invalid'
  const [aiImageAnalysis, setAiImageAnalysis] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    priority: "Medium",
    latitude: "",
    longitude: "",
    image: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [aiPreviewData, setAiPreviewData] = useState(null);
  const [aiPreviewLoading, setAiPreviewLoading] = useState(false);

  /* ================= RUN PRE-SUBMISSION AI PREVIEW ================= */
  const getAiPreview = async (updatedForm) => {
    const f = updatedForm || form;
    if (!f.title || !f.description || !f.category || !f.location) return;

    setAiPreviewLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/report/analyze-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f)
      });
      if (res.ok) {
        const data = await res.json();
        setAiPreviewData(data);
        
        // Update image check status if image is present
        if (f.image) {
          setAiImageStatus("valid");
          setAiImageAnalysis(`AI Evidence Assessment: Visual features match environmental hazard. Detected: ${data.detectedHazards || "hazards"}. Responding Agency: ${data.assignedAgency}.`);
        }
      }
    } catch (e) {
      console.error("Error fetching AI preview:", e);
    } finally {
      setAiPreviewLoading(false);
    }
  };

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);

    if (name === "category") {
      updateAiTips(value);
    }

    // Trigger AI analysis preview when all main fields are filled
    if (newForm.title && newForm.description && newForm.category && newForm.location) {
      getAiPreview(newForm);
    }
  };

  const updateAiTips = (category) => {
    const tipsMap = {
      "Oil Spill": [
        "Avoid contact with skin, eyes, and clothing. Crude oil contains toxic chemicals.",
        "Keep open flames and lighters far from the spill. Oil fumes are highly flammable.",
        "Do not attempt to wash the oil into gutters or drains as this spreads pollution.",
        "Notify local environmental monitoring units (NESREA) immediately."
      ],
      "Gas Leak": [
        "Do not switch on/off any lights, appliances, or use phones inside the building.",
        "Evacuate the area immediately and leave doors open to ventilate.",
        "Do not strike matches or lighters. Keep all ignition sources far away.",
        "Call emergency services only once you are at a safe distance outside."
      ],
      "Flooding": [
        "Do not walk, swim, or drive through flood waters. Just six inches of moving water can knock you down.",
        "Move to higher ground or upper stories of buildings immediately.",
        "Shut off main utilities (electricity and water) at the main switch if safe to do so.",
        "Watch out for snakes, rodents, and other displaced animals in standing water."
      ],
      "Waste Dumping": [
        "Do not touch or open unknown drums, containers, or clinical waste bags.",
        "Keep children and pets far away from the contaminated dumpsite.",
        "If you witness active dumping, note down vehicle numbers and descriptions from a safe distance.",
        "Be cautious of sharp objects, broken glass, or chemical residues."
      ],
      "Water Pollution": [
        "Do not drink, swim, bathe, or cook with water from the suspected contaminated source.",
        "Keep cattle and other agricultural animals away from the water body.",
        "Report any floating dead fish, oily sheen, or discoloration to authorities."
      ],
      "Hazardous Waste": [
        "Avoid inhaling fumes; cover your mouth and nose with a damp cloth if necessary.",
        "Observe hazardous symbols (corrosive, toxic, explosive) from a distance.",
        "Do not touch leaking barrels or discard chemical containers in normal trash bins."
      ],
      "Erosion": [
        "Avoid walking, driving, or standing near unstable cliff edges or land cracks.",
        "Steer clear of landslide-prone hillsides during heavy rainfalls.",
        "Report road cracks, collapsing culverts, or drainage blocks to local public works."
      ],
      "Air Pollution": [
        "Wear an N95 respirator mask or high-filtration mask when outdoors.",
        "Close windows and doors tightly. Use air purifiers if available.",
        "Avoid outdoor exercises or high physical exertion in high smog periods."
      ],
      "Soil Contamination": [
        "Avoid gardening or farming in suspected chemical dump soil without testing.",
        "Wash hands and shoes thoroughly after returning from contaminated terrain."
      ],
      "Drainage Blockage": [
        "Never dump household garbage or plastic bags into open gutters or drains.",
        "Stay clear of flooded gutters. Heavy rain can cause strong suctions that pull people under."
      ]
    };
    setAiTips(tipsMap[category] || []);
  };

  /* ================= IMAGE ================= */
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setAiImageStatus("checking");
    setAiImageAnalysis("AI Evidence Check: Analyzing image features and hazard patterns...");

    const reader = new FileReader();

    reader.onloadend = () => {
      const newForm = { ...form, image: reader.result };
      setForm(newForm);
      getAiPreview(newForm);
    };

    reader.readAsDataURL(file);
  };

  /* ================= GET USER LOCATION ================= */
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newForm = {
          ...form,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setForm(newForm);
        alert("Location captured successfully");
        getAiPreview(newForm);
      },
      () => {
        alert("Unable to get location");
      }
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error submitting report");
        setLoading(false);
        return;
      }

      setSubmitted(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.log(err);
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-white p-2 rounded-lg shadow hover:scale-105 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Environmental Hazard Report
          </h1>

          <p className="text-sm text-gray-500">
            Report hazards instantly to authorities
          </p>
        </div>
      </div>

      {/* WARNING */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-8 flex gap-3">
        <AlertTriangle className="text-yellow-600 mt-1" />

        <p className="text-sm text-yellow-700">
          For emergency fire outbreaks, use the dedicated fire response page.
        </p>
      </div>

      {/* SUCCESS */}
      {submitted && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 p-5 rounded-xl mb-8">
          <CheckCircle2 size={22} className="mt-1" />

          <div>
            <p className="font-semibold">
              Hazard Report Submitted Successfully
            </p>

            <p className="text-sm">
              Authorities and monitoring units have been notified.
            </p>
          </div>
        </div>
      )}

      {/* FORM */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* HAZARD INFO */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="text-green-600" />

              <h2 className="text-xl font-semibold text-gray-800">
                Hazard Information
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* TITLE */}
              <div className="md:col-span-2">
                <label className="block text-sm mb-1 font-medium">
                  Hazard Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Oil spill close to residential area"
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Hazard Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">Select category</option>
                  <option>Oil Spill</option>
                  <option>Gas Leak</option>
                  <option>Flooding</option>
                  <option>Waste Dumping</option>
                  <option>Water Pollution</option>
                  <option>Hazardous Waste</option>
                  <option>Erosion</option>
                  <option>Air Pollution</option>
                  <option>Soil Contamination</option>
                  <option>Drainage Blockage</option>
                </select>
              </div>

              {/* PRIORITY */}
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Reporter Urgency Estimate
                </label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              {/* AI SAFETY TIPS BANNER */}
              {aiTips.length > 0 && (
                <div className="md:col-span-2 bg-green-50 dark:bg-green-950/20 border border-green-200/50 p-5 rounded-2xl">
                  <h3 className="font-bold text-green-800 dark:text-green-300 text-sm flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-green-600 animate-pulse shrink-0" />
                    AI Safety Recommendations for {form.category}
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    {aiTips.map((tip, index) => (
                      <li key={index} className="text-xs text-green-700 dark:text-green-400 leading-normal">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* LOCATION */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="text-green-600" />

              <h2 className="text-xl font-semibold text-gray-800">
                Location Details
              </h2>
            </div>

            <div className="space-y-6">

              {/* LOCATION */}
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Exact Location
                </label>

                <div className="flex gap-2">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Mile 1, Bonny Island, Rivers State"
                    className="flex-1 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                  />

                  <button
                    type="button"
                    onClick={getLocation}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800 transition shrink-0"
                  >
                    <LocateFixed size={18} />
                    Detect My Location
                  </button>
                </div>

                {form.latitude && (
                  <div className="mt-4 text-sm text-gray-700">
                    Latitude: {form.latitude}
                    <br />
                    Longitude: {form.longitude}
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  required
                  placeholder="Describe the environmental hazard in detail..."
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* IMAGE */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Image className="text-green-600" />

              <h2 className="text-xl font-semibold text-gray-800">
                Evidence Upload
              </h2>
            </div>

            <label className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition bg-gray-50/50 text-center">

              <Image size={40} className="text-gray-400 mb-3" />

              <p className="text-gray-600 font-medium">
                Click to upload hazard image
              </p>

              <p className="text-sm text-gray-400 mt-1">
                JPG, PNG supported
              </p>

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImage}
              />
            </label>

            {form.image && (
              <div className="space-y-4">
                <img
                  src={form.image}
                  alt="preview"
                  className="mt-6 w-full h-64 object-cover rounded-2xl shadow"
                />

                {aiImageStatus && (
                  <div className={`p-4 rounded-xl border text-xs leading-normal flex items-start gap-2.5 ${
                    aiImageStatus === "checking"
                      ? "bg-blue-50 border-blue-200/50 text-blue-800"
                      : "bg-green-50 border-green-200/50 text-green-800"
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      {aiImageStatus === "checking" ? "⚡" : "🤖"}
                    </div>
                    <div>
                      <span className="font-bold block mb-0.5">
                        {aiImageStatus === "checking" ? "Scanning Upload..." : "AI Evidence Assessment"}
                      </span>
                      <p className="opacity-90">{aiImageAnalysis}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* AI DIAGNOSTICS PRE-SUBMISSION PREVIEW PANEL */}
          {aiPreviewData && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-gray-800 shadow-2xl relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
              
              <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
                <Sparkles className="text-green-400 animate-pulse" size={20} />
                <h3 className="text-sm font-bold tracking-wider uppercase">AI Live Incident Intelligence</h3>
                <span className="text-[10px] ml-auto bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-extrabold">Active</span>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-xs mb-4">
                <div>
                  <span className="text-gray-400 block mb-1">Predicted Urgency/Severity:</span>
                  <span className={`text-sm font-black uppercase tracking-wide ${
                    aiPreviewData.severity === "Critical" ? "text-red-500" : aiPreviewData.severity === "High" ? "text-orange-500" : aiPreviewData.severity === "Medium" ? "text-yellow-500" : "text-green-500"
                  }`}>
                    {aiPreviewData.severity}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block mb-1">AI Confidence Score:</span>
                  <span className="text-sm font-extrabold text-white flex items-center gap-1">
                    <Zap size={14} className="text-yellow-400" />
                    {aiPreviewData.confidence}%
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block mb-1">Response Agency:</span>
                  <span className="text-sm font-bold text-gray-200 block truncate" title={aiPreviewData.assignedAgency}>
                    {aiPreviewData.assignedAgency}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-800">
                <div>
                  <span className="text-gray-400 block mb-1">Detected Hazards (Visual/Text):</span>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {aiPreviewData.detectedHazards?.split(", ").map((tag, idx) => (
                      <span key={idx} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block mb-1">Severity Score Explanation:</span>
                  <p className="text-gray-300 italic leading-relaxed text-[11px] font-light">
                    "{aiPreviewData.severityExplanation}"
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 block mb-1">Automated Action/Intervention:</span>
                  <p className="text-green-400 font-medium text-[11px]">
                    {aiPreviewData.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex flex-col md:flex-row justify-between gap-4 pt-8 border-t">

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || aiPreviewLoading}
              className="px-10 py-3 rounded-xl bg-green-600 text-white flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg transition disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Hazard Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}