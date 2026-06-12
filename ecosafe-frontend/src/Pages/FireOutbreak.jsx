import { ArrowLeft, Flame, UploadCloud, ShieldAlert, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ReportFire() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    location: "",
    description: "",
    image: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [imageName, setImageName] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setImageName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("fullname", form.fullname);
    data.append("phone", form.phone);
    data.append("location", form.location);
    data.append("description", form.description);
    if (form.image) {
      data.append("image", form.image);
    }

    const token = localStorage.getItem("token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/FireOutbreak`, {
        method: "POST",
        headers,
        body: data,
      });

      setSubmitted(true);
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to submit fire report.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-10 relative overflow-hidden">
      {/* Background soft red blob */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="bg-white hover:bg-gray-50 p-3 rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-800 flex items-center gap-2">
              <Flame className="text-red-600 animate-pulse" size={28} />
              Fire Emergency Report
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Active fire incidents are routed with critical priority to emergency response services.
            </p>
          </div>
        </div>

        {/* SUBMISSION STATUS */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl mb-8 font-semibold text-xs text-center animate-fadeIn">
            🎉 Emergency Fire Report submitted successfully. Redirecting to control room...
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          {/* FORM CONSOLE */}
          <div className="md:col-span-2 bg-white shadow-xl rounded-3xl p-6 md:p-8 border border-gray-100/60">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Reporter Full Name</label>
                  <input 
                    name="fullname" 
                    onChange={handleChange} 
                    placeholder="e.g. John Doe" 
                    className="w-full p-3 text-xs border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" 
                    required 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Reporter Contact Line</label>
                  <input 
                    name="phone" 
                    onChange={handleChange} 
                    placeholder="e.g. +234 901..." 
                    className="w-full p-3 text-xs border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Fire Location</label>
                <input 
                  name="location" 
                  onChange={handleChange} 
                  placeholder="Street landmarks, bus stops, local government area..." 
                  className="w-full p-3 text-xs border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" 
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Situation details</label>
                <textarea
                  name="description"
                  onChange={handleChange}
                  placeholder="Describe building type, fire size, smoke color, traps..."
                  className="w-full p-3 text-xs border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                  rows={4}
                  required
                />
              </div>

              {/* FILE UPLOAD CARD */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Upload Visual Evidence (Optional)</label>
                <label className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition bg-gray-50/50 text-center">
                  <UploadCloud size={32} className="text-gray-400 mb-2" />
                  <span className="text-[11px] font-bold text-gray-600 block">
                    {imageName ? `Evidence Image: ${imageName}` : "Click to select a photo of the fire"}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-1">JPEG, PNG files accepted</span>
                  <input type="file" onChange={handleImage} accept="image/*" hidden />
                </label>
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white w-full py-4 rounded-xl font-bold text-xs shadow-md shadow-red-600/10 hover:shadow-lg transition cursor-pointer"
              >
                Submit Critical Fire Incident Report
              </button>
            </form>
          </div>

          {/* WARNING PANEL & CONTACT PANEL */}
          <div className="space-y-6">
            
            {/* ALERT CRITICAL CARD */}
            <div className="bg-red-50/50 border border-red-200/50 p-6 rounded-3xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <ShieldAlert size={18} />
                <span>Critical Incident Warning</span>
              </div>
              <p className="text-[11px] text-red-800 leading-relaxed font-light">
                False reporting of emergency outbreaks is a punishable offense. Provide accurate details to dispatch immediate local responders.
              </p>
            </div>

            {/* DIRECT TELEPHONY SERVICES */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Phone size={14} /> Direct Calls
              </h3>
              
              <div className="space-y-3">
                <a href="tel:112" className="flex justify-between items-center bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 p-3 rounded-xl transition text-xs font-bold text-red-700">
                  <span>Fire Emergency Service</span>
                  <span>112</span>
                </a>
                <a href="tel:199" className="flex justify-between items-center bg-gray-50 border border-gray-200 hover:bg-gray-100 p-3 rounded-xl transition text-xs font-bold text-gray-700">
                  <span>Police Command Post</span>
                  <span>199</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}