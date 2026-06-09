import { useNavigate, Link } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* GRID STRUCTURE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* BRAND AND MISSION */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group outline-none">
              <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center text-white text-base font-bold shadow-md shadow-green-600/10">
                🛡️
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Eco<span className="text-green-500">Safe</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed font-light">
              Securing communities through instantaneous hazard reports, real-time emergency alert broadsides, and active citizen collaboration.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-green-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-green-500 transition-colors">Sign Up</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-green-500 transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/Awareness" className="hover:text-green-500 transition-colors">Community Hub</Link>
              </li>
            </ul>
          </div>

          {/* SAFETY RESOURCES */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Safety & Guides</h4>
            <ul className="space-y-2.5 text-xs">
              <li onClick={() => navigate("/Awareness")} className="hover:text-green-500 transition-colors cursor-pointer">
                Emergency Hotline Guide
              </li>
              <li onClick={() => navigate("/Awareness")} className="hover:text-green-500 transition-colors cursor-pointer">
                Safety Advice Sheet
              </li>
              <li onClick={() => navigate("/AdminLogin")} className="hover:text-green-500 transition-colors cursor-pointer">
                Authorized Agency Portal
              </li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact Info</h4>
            <ul className="space-y-2.5 text-xs leading-normal">
              <li>Official Email: <a href="mailto:support@ecosafe.ng" className="hover:text-green-500 transition-colors">support@ecosafe.ng</a></li>
              <li>Emergency Contact: +234 901 427 9749</li>
              <li>NESREA Operations Headquarters, Abuja</li>
            </ul>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="border-t border-gray-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} EcoSafe. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
}