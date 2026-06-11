import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Flame,
  Droplets,
  Trash2,
  AlertTriangle,
  PhoneCall,
  ShieldCheck,
  Siren,
  Trophy,
  Award,
  Sparkles,
  TrendingUp,
  User,
  ArrowLeft,
  BookOpen
} from "lucide-react";
import BackToTop from "../Components/BackToTop";
import { getCommunityRisks } from "../api";
import ChatbotWidget from "../Components/ChatbotWidget";

export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [leaderboard, setLeaderboard] = useState([]);
  const [profile, setProfile] = useState(null);
  const [communityRisks, setCommunityRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardAndProfile = async () => {
      setLoading(true);
      try {
        // Fetch Leaderboard
        const lbRes = await fetch("https://ecosafe-ai-2.onrender.com/leaderboard");
        if (lbRes.ok) {
          const lbData = await lbRes.json();
          setLeaderboard(lbData);
        }

        // Fetch User Profile if logged in
        const token = localStorage.getItem("token");
        if (token) {
          const profRes = await fetch("https://ecosafe-ai-2.onrender.com/profile", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (profRes.ok) {
            const profData = await profRes.json();
            setProfile(profData);
          }
        }

        // Fetch Community Risks
        const risksData = await getCommunityRisks();
        if (Array.isArray(risksData)) {
          setCommunityRisks(risksData);
        }
      } catch (err) {
        console.error("Error fetching community data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardAndProfile();
  }, []);

  const tips = [
    {
      icon: <Flame className="text-red-500" size={24} />,
      title: "Fire Outbreak Safety",
      desc: "Avoid overloading sockets, turn off gas cylinders properly, and report any fire immediately to prevent spread.",
    },
    {
      icon: <Droplets className="text-blue-500" size={24} />,
      title: "Prevent Water Pollution",
      desc: "Do not dump waste into rivers or drainage. Proper waste disposal keeps our water safe for everyone.",
    },
    {
      icon: <Trash2 className="text-yellow-500" size={24} />,
      title: "Proper Waste Management",
      desc: "Separate recyclable waste and avoid illegal dumping in open spaces and streets.",
    },
    {
      icon: <AlertTriangle className="text-orange-500" size={24} />,
      title: "Report Oil Spills Quickly",
      desc: "Early reporting of oil spills reduces environmental damage and protects marine life.",
    },
    {
      icon: <Leaf className="text-green-600" size={24} />,
      title: "Protect Green Areas",
      desc: "Avoid bush burning and cutting down trees. Trees help reduce pollution and climate change.",
    },
    {
      icon: <ShieldCheck className="text-purple-600" size={24} />,
      title: "Community Responsibility",
      desc: "Environmental safety is everyone’s duty. Educate neighbors and encourage safe practices.",
    },
  ];

  const emergency = [
    { name: "Fire Service", number: "112", icon: <Siren /> },
    { name: "Police Emergency", number: "199", icon: <ShieldCheck /> },
    { name: "Ambulance / Medical", number: "122", icon: <PhoneCall /> },
    { name: "NEMA (Disaster Mgt)", number: "0800-111-1234", icon: <AlertTriangle /> },
  ];

  const badgeTiers = [
    { name: "Eco Novice 🛡️", points: "0 - 19 pts", desc: "For newly registered guardians who just began reporting hazards." },
    { name: "Green Scout 🌿", points: "20 - 59 pts", desc: "Awarded to members actively cataloging local environmental issues." },
    { name: "Hazard Hunter 🔍", points: "60 - 149 pts", desc: "For vigilant reporters identifying multiple high-risk situations." },
    { name: "Eco Warrior ⚔️", points: "150 - 299 pts", desc: "A seasoned environment defender with significant validated reports." },
    { name: "Planet Guardian 🌎", points: "300+ pts", desc: "Elite champion who has helped secure whole municipal districts." }
  ];

  // Helper to calculate next tier remaining points
  const getNextTierDetails = (points) => {
    if (points < 20) return { next: "Green Scout 🌿", remaining: 20 - points };
    if (points < 60) return { next: "Hazard Hunter 🔍", remaining: 60 - points };
    if (points < 150) return { next: "Eco Warrior ⚔️", remaining: 150 - points };
    if (points < 300) return { next: "Planet Guardian 🌎", remaining: 300 - points };
    return { next: "Max Tier Reached!", remaining: 0 };
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-16">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800 text-white py-12 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-green-600/35 rounded-full blur-2xl"></div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition duration-150 shadow-sm outline-none border border-white/10"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Community Hub</h1>
              <p className="text-green-100 mt-1 text-sm md:text-base font-light">
                Rewarding active reporting and promoting collective safety
              </p>
            </div>
          </div>

          {profile && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-white text-green-700 flex items-center justify-center font-extrabold text-xl shadow-md">
                {profile.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-green-200">Your Rewards Status</p>
                <h3 className="font-bold text-sm leading-tight truncate max-w-40">{profile.name}</h3>
                <span className="inline-block text-[11px] font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full mt-1 border border-white/10">
                  {profile.badge}
                </span>
                <p className="text-[10px] text-green-100 font-bold mt-1">{profile.points} Points Earned</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
        
        {/* TABS SELECTOR */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 gap-2">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 outline-none cursor-pointer ${
              activeTab === "leaderboard"
                ? "border-green-600 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Trophy size={16} />
            Leaderboard & Rewards
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 outline-none cursor-pointer ${
              activeTab === "safety"
                ? "border-green-600 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <BookOpen size={16} />
            Safety Education
          </button>
          <button
            onClick={() => setActiveTab("risks")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 outline-none cursor-pointer ${
              activeTab === "risks"
                ? "border-green-600 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <AlertTriangle size={16} />
            Community Risk Index
          </button>
        </div>

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm">Loading community dashboards...</p>
          </div>
        )}

        {!loading && activeTab === "leaderboard" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* MY REWARDS / SYSTEM EXPLANATION */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* POINTS PROGRESS CARD */}
              <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-4">
                    <Sparkles size={20} />
                    <h2 className="font-bold text-lg">My Rewards Journey</h2>
                  </div>
                  
                  {profile ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Awesome work, <span className="font-semibold text-gray-800 dark:text-white">{profile.name}</span>! 
                        Your efforts reporting environmental hazards contribute to making our neighborhood cleaner and safer.
                      </p>
                      
                      {/* Progress widget */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="font-medium text-gray-500">Current Level: <strong className="text-gray-800 dark:text-white">{profile.badge}</strong></span>
                          {getNextTierDetails(profile.points).remaining > 0 ? (
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {getNextTierDetails(profile.points).remaining} points to {getNextTierDetails(profile.points).next}
                            </span>
                          ) : (
                            <span className="font-semibold text-green-600 dark:text-green-400">Max level attained! 👑</span>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, (profile.points % 150) / 1.5)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Login or Sign Up to start earning points and unlocking badges for every environmental hazard report you submit!
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => navigate("/Login")}
                          className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-green-700 transition"
                        >
                          Login to Account
                        </button>
                        <button
                          onClick={() => navigate("/Signup")}
                          className="border border-green-600 text-green-600 dark:text-green-400 px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-green-50 dark:hover:bg-green-950/20 transition"
                        >
                          Sign Up
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-6 flex justify-between items-center text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Award size={14} /> Report: +10 pts (+15 with Image)</span>
                  <span className="flex items-center gap-1"><ShieldCheck size={14} /> Verified: +50 pts</span>
                </div>
              </div>

              {/* TACTICAL SCORECARD */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={20} />
                    <h3 className="font-bold text-base">Community Impact</h3>
                  </div>
                  <p className="text-xs text-green-100 leading-relaxed font-light">
                    Every report helps local agencies like NESREA, NEMA, and the fire service respond faster. Submitting a clear image and specific locations unlocks higher validation multipliers!
                  </p>
                </div>
                
                <div className="mt-8 bg-black/15 p-3 rounded-xl text-[11px] border border-white/10">
                  🛡️ Active citizens build resilient cities. Keep reporting environmental hazards responsibly!
                </div>
              </div>
            </div>

            {/* LEADERBOARD & BADGE PROGRESSION */}
            <div className="grid md:grid-cols-3 gap-6 items-start">
              
              {/* LEADERBOARD CONTAINER */}
              <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="text-yellow-500" />
                  <h3 className="font-bold text-lg dark:text-white">Top Community Protectors</h3>
                </div>

                <div className="overflow-hidden">
                  <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 mb-2">
                    <span className="col-span-2 text-center">Rank</span>
                    <span className="col-span-5">Name</span>
                    <span className="col-span-3">Badge</span>
                    <span className="col-span-2 text-right">Points</span>
                  </div>

                  {leaderboard.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No leaderboard logs yet. Be the first to top the charts!</p>
                  ) : (
                    <div className="space-y-1">
                      {leaderboard.map((user, index) => {
                        const isSelf = profile && user.name === profile.name;
                        const rankColors = [
                          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 font-bold",
                          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-semibold",
                          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium"
                        ];

                        return (
                          <div
                            key={index}
                            className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl text-sm transition-colors ${
                              isSelf 
                                ? "bg-green-50 dark:bg-green-950/20 border border-green-500/20" 
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            }`}
                          >
                            <div className="col-span-2 flex justify-center">
                              {index < 3 ? (
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-sm ${rankColors[index]}`}>
                                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-xs w-7 h-7 rounded-full flex items-center justify-center">
                                  #{index + 1}
                                </span>
                              )}
                            </div>

                            <span className={`col-span-5 font-medium dark:text-white truncate ${isSelf ? "text-green-700 dark:text-green-400 font-bold" : ""}`}>
                              {user.name} {isSelf && "(You)"}
                            </span>

                            <span className="col-span-3 text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.badge}
                            </span>

                            <span className="col-span-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                              {user.points} <span className="text-[10px] text-gray-400 font-normal">pts</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* BADGES SHOWCASE PANEL */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Award className="text-green-600" />
                  <h3 className="font-bold text-lg dark:text-white">Badge Tier Guide</h3>
                </div>

                <div className="space-y-4">
                  {badgeTiers.map((tier, idx) => (
                    <div key={idx} className="flex gap-3 items-start border-b border-gray-50 dark:border-gray-700/50 pb-3 last:border-b-0 last:pb-0">
                      <div className="text-xl p-1 bg-gray-50 dark:bg-gray-700 rounded-lg shrink-0 select-none">
                        {tier.name.split(" ").pop()}
                      </div>
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-xs text-gray-800 dark:text-white">{tier.name.split(" ").slice(0, -1).join(" ")}</h4>
                          <span className="text-[10px] bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                            {tier.points}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                          {tier.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {!loading && activeTab === "safety" && (
          <div className="space-y-12 animate-fadeIn">
            
            {/* HERO BANNER */}
            <div className="rounded-3xl overflow-hidden shadow-sm relative h-64">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
                alt="community"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                <span className="bg-green-600 text-white font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full w-fit mb-3">Community Hub</span>
                <h2 className="text-white text-2xl md:text-3xl font-extrabold max-w-xl leading-tight">
                  A Safer Environment Starts With Local Awareness
                </h2>
              </div>
            </div>

            {/* EDUCATIVE TIPS */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Critical Safety Guidelines
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-800 hover:shadow-md transition duration-200 glow-card"
                  >
                    <div className="mb-4 bg-green-50 dark:bg-green-950/30 p-3 rounded-xl w-fit">{tip.icon}</div>
                    <h3 className="font-bold text-base dark:text-white mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* EMERGENCY NUMBERS */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                Official Emergency Response Contacts
              </h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                {emergency.map((item, index) => (
                  <div
                    key={index}
                    className="border dark:border-gray-700 p-5 rounded-2xl text-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition hover:shadow-sm"
                  >
                    <div className="flex justify-center mb-3 text-green-600 dark:text-green-400">
                      {item.icon}
                    </div>
                    <h4 className="font-bold text-sm dark:text-white">{item.name}</h4>
                    <a 
                      href={`tel:${item.number.replace(/[^0-9]/g, '')}`}
                      className="inline-block text-lg font-bold text-green-600 dark:text-green-400 mt-2 hover:underline"
                    >
                      {item.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-10 rounded-3xl shadow-lg text-center relative overflow-hidden">
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              
              <h2 className="text-2xl font-extrabold mb-4 relative z-10">
                Prevention is Better Than Response
              </h2>
              <p className="text-xs md:text-sm max-w-xl mx-auto mb-6 text-green-50 font-light relative z-10 leading-relaxed">
                Most environmental hazards can be contained if reported within the first hour of occurrence. Encourage your neighbors, take clear photos, and submit reports as quickly as possible.
              </p>

              <button 
                className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 rounded-xl font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 relative z-10 cursor-pointer"   
                onClick={() => navigate("/Reportpage")}
              >
                Submit Hazard Report
              </button>
            </div>
          </div>
        )}

        {!loading && activeTab === "risks" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="text-emerald-600 animate-pulse" />
                <h3 className="font-bold text-lg dark:text-white">Community Safety & Environmental Risk Scorecard</h3>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Below is the calculated hazard index of communities based on local hazard incident reports. A high severity rating and unapproved reports raise the score, while successful incident resolutions lower it.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityRisks.length === 0 ? (
                  <p className="text-gray-400 text-sm py-8 col-span-full text-center">No community hazard indices computed yet. Submit reports to calculate real-time risks!</p>
                ) : (
                  communityRisks.map((cr) => {
                    let badgeColor = "bg-green-500/10 text-green-600 border-green-500/20";
                    if (cr.status === "Critical Risk") badgeColor = "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
                    else if (cr.status === "High Risk") badgeColor = "bg-orange-500/10 text-orange-600 border-orange-500/20";
                    else if (cr.status === "Moderate Risk") badgeColor = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";

                    return (
                      <div key={cr.id} className="p-5 border border-slate-100 dark:border-gray-700/60 rounded-2xl bg-slate-50/40 dark:bg-gray-900/30 flex flex-col justify-between hover-lift shadow-sm animate-fadeIn">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-sm text-gray-800 dark:text-white truncate max-w-[65%]">{cr.community}</h4>
                            <span className={`text-[9px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                              {cr.status}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex justify-between">
                              <span>Total Incidents Logged:</span>
                              <span className="font-semibold text-gray-800 dark:text-slate-200">{cr.total_incidents}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Resolved Incidents:</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">{cr.resolved_incidents}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-gray-400 font-medium">Risk Score:</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-100">{cr.risk_score} / 100</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                cr.risk_score > 80 ? "bg-red-500" : cr.risk_score > 60 ? "bg-orange-500" : cr.risk_score > 30 ? "bg-yellow-500" : "bg-green-500"
                              }`}
                              style={{ width: `${cr.risk_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

      </div>
      <ChatbotWidget />
      <BackToTop />
    </div>
  );
}