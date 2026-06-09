import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-green-50/50 via-white to-gray-50/30 pt-28 pb-20 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-200/10 rounded-full blur-2xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-green-50 border border-green-200/40 text-green-700">
              🌱 Environmental Safety Platform
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-800">
              Join Us In <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Reporting</span><br />
              Environmental Hazards
            </h1>

            <p className="text-gray-500 text-sm sm:text-base max-w-lg leading-relaxed font-light">
              Submit, track, and monitor local environmental hazards, oil spills, and safety risks. Protect your neighborhood and earn reporter rewards instantly!
            </p>

            {/* EMAIL SIGNUP CONTAINER */}
            <div className="flex items-center bg-white border border-gray-200/60 rounded-2xl shadow-md p-1.5 w-full max-w-md focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 text-xs outline-none text-gray-700 bg-transparent font-medium"
              />
              <button 
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-bold px-6 py-3.5 rounded-xl transition cursor-pointer shadow hover-lift"
              >
                Join Us
              </button>
            </div>
            
            <div className="flex items-center gap-6 pt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">✔ Real-time Alerts</span>
              <span className="flex items-center gap-1">✔ Active Leaderboards</span>
              <span className="flex items-center gap-1">✔ Agency Integration</span>
            </div>
          </div>

          {/* RIGHT COLUMN - EVIDENCE HIGHLIGHT */}
          <div className="relative flex justify-center md:justify-end">
            <div
              className="
                w-full
                max-w-md
                h-80
                sm:h-96
                overflow-hidden
                rounded-3xl
                shadow-2xl
                border-4
                border-white
                rotate-2
                hover:rotate-0
                transition-all
                duration-300
              "
            >
              <img
                src="https://plus.unsplash.com/premium_photo-1663099654523-d3862b7742cd?w=500&auto=format&fit=crop&q=60"
                alt="environment protection"
                className="w-full h-full object-cover scale-105 hover:scale-100 transition duration-500"
              />
            </div>

            {/* OVERLAY BADGE */}
            <div className="absolute bottom-6 left-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl max-w-56 border border-gray-100 -rotate-3 hover:rotate-0 transition duration-200">
              <div className="flex items-center gap-3">
                <span className="text-xl">🛡️</span>
                <div>
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white">Active Monitoring</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Secure, automated alerts forwarded to local emergency agency offices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}