import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-green-700 to-emerald-800 py-16 relative overflow-hidden">
      {/* Decorative backdrop blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-600/20 rounded-full blur-3xl -translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-600/35 rounded-full blur-3xl translate-x-20 translate-y-20"></div>

      <div className="max-w-4xl mx-auto px-6 text-center text-white relative z-10 space-y-6">
        
        {/* ICON */}
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl mx-auto border border-white/10 shadow-lg shadow-black/5">
          🌍
        </div>

        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Join the Movement to Protect Our Environment
        </h2>

        {/* DESCRIPTION */}
        <p className="text-xs sm:text-sm max-w-xl mx-auto text-green-100 font-light leading-relaxed">
          Report local environmental hazards, access real-time emergency broadcasts, and build a cleaner, safer community with EcoSafe today.
        </p>

        {/* BUTTONS */}
        <div className="flex justify-center gap-4 flex-wrap pt-4">
          <button 
            onClick={() => navigate("/signup")}
            className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 rounded-xl font-bold text-xs shadow-md transition cursor-pointer hover-lift"
          >
            Get Started
          </button>

          <button 
            onClick={() => navigate("/Awareness")}
            className="border border-white/20 hover:border-white/50 text-white px-8 py-3 rounded-xl font-bold text-xs transition cursor-pointer hover-lift"
          >
            Explore Dashboard
          </button>
        </div>

      </div>
    </section>
  );
}