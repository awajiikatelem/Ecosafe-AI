import { Flame, Trash2, Droplet, Waves, ShieldAlert, Wind, CloudRain, Factory } from "lucide-react";

export default function Challenges() {
  const issues = [
    {
      icon: <Flame size={20} className="text-red-600" />,
      title: "Fire Outbreaks",
      desc: "Emergency residential or brush fire incidents requiring immediate firefighter dispatch.",
      color: "border-red-200 bg-red-50/20 text-red-700 shadow-red-500/5"
    },
    {
      icon: <Trash2 size={20} className="text-amber-600" />,
      title: "Illegal Waste Dumping",
      desc: "Unregulated refuse sites, hazardous chemical dumping, or municipal sanitation negligence.",
      color: "border-amber-200 bg-amber-50/20 text-amber-700 shadow-amber-500/5"
    },
    {
      icon: <Droplet size={20} className="text-blue-600" />,
      title: "Water Contamination",
      desc: "Polluted community wells, industrial runoffs, or dead aquatic life events.",
      color: "border-blue-200 bg-blue-50/20 text-blue-700 shadow-blue-500/5"
    },
    {
      icon: <Waves size={20} className="text-emerald-600" />,
      title: "Flooding & Mudslides",
      desc: "Rising water levels threatening housing sectors and requiring evacuation alerts.",
      color: "border-emerald-200 bg-emerald-50/20 text-emerald-700 shadow-emerald-500/5"
    },
    {
      icon: <ShieldAlert size={20} className="text-rose-600" />,
      title: "Gas Pipeline Leaks",
      desc: "Toxic or flammable gas venting. Poses immediate explosion risks to nearby zones.",
      color: "border-red-100 bg-rose-50/20 text-rose-700 shadow-rose-500/5"
    },
    {
      icon: <Wind size={20} className="text-sky-600" />,
      title: "Air Pollution",
      desc: "Smog occurrences, heavy gas venting, or elevated particulate matter.",
      color: "border-sky-200 bg-sky-50/20 text-sky-700 shadow-sky-500/5"
    },
    {
      icon: <Factory size={20} className="text-purple-600" />,
      title: "Industrial Effluents",
      desc: "Unfiltered industrial runoff contaminating soils and local ecosystems.",
      color: "border-purple-200 bg-purple-50/20 text-purple-700 shadow-purple-500/5"
    },
    {
      icon: <CloudRain size={20} className="text-indigo-600" />,
      title: "Drainage Blockages",
      desc: "Clogged drainage lines causing runoffs to back up into houses and roads.",
      color: "border-indigo-200 bg-indigo-50/20 text-indigo-700 shadow-indigo-500/5"
    }
  ];

  return (
    <section className="bg-white py-20 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest block">
            Environmental Challenges
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
            Major Issues Affecting Our Communities
          </h2>
          <p className="text-gray-500 text-sm sm:text-base font-light leading-relaxed">
            EcoSafe provides unified logging, diagnostics, and AI-prioritized routing to help authorities respond to these critical threats.
          </p>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {issues.map((item, index) => (
            <div 
              key={index} 
              className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between hover:border-green-300 group"
            >
              <div className="space-y-4">
                {/* ICON CONTAINER */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                  {item.icon}
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-base text-gray-800 group-hover:text-green-600 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

