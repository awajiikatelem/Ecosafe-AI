import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // SCROLL EFFECT
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/10" 
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-green-500/10 group-hover:scale-105 transition-transform">
              🛡️
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-800 dark:text-white">
              Eco<span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Safe</span>
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-gray-600 dark:text-gray-300">
            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            <span className="hover:text-green-600 cursor-pointer transition-colors">About</span>
            <span className="hover:text-green-600 cursor-pointer transition-colors">Features</span>
            <Link to="/Awareness" className="hover:text-green-600 transition-colors">Community Hub</Link>
          </div>

          {/* CTA BUTTONS */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/AdminLogin">
              <button className="border border-green-600/30 dark:border-green-400/20 text-green-700 dark:text-green-400 text-xs font-bold px-5 py-2.5 rounded-xl transition hover:bg-green-50 dark:hover:bg-green-950/20 cursor-pointer hover-lift">
                Admin Panel
              </button>
            </Link>

            <Link to="/signup">
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-green-600/10 transition cursor-pointer hover-lift">
                Join Us
              </button>
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="mt-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-xl p-5 flex flex-col space-y-4 md:hidden animate-fadeIn">
            <Link to="/" onClick={() => setOpen(false)} className="font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-green-600 transition-colors">Home</Link>
            <span onClick={() => setOpen(false)} className="font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-green-600 cursor-pointer transition-colors">About</span>
            <span onClick={() => setOpen(false)} className="font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-green-600 cursor-pointer transition-colors">Features</span>
            <Link to="/Awareness" onClick={() => setOpen(false)} className="font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-green-600 transition-colors">Community Hub</Link>

            <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
            
            <Link to="/AdminLogin" onClick={() => setOpen(false)} className="w-full">
              <button className="w-full border border-green-600/30 text-green-700 dark:text-green-400 py-3 rounded-xl font-bold text-xs hover:bg-green-50 transition cursor-pointer">
                Admin Panel
              </button>
            </Link>

            <Link to="/signup" onClick={() => setOpen(false)} className="w-full">
              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold text-xs shadow-md transition cursor-pointer">
                Join Us
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}