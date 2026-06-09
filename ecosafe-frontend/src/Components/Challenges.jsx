import { Droplet, Trash2, Waves, Flame, ShieldAlert, Wind, CloudRain, Factory } from "lucide-react";

export default function Challenges() {
  return (
    <section className="bg-white py-16 overflow-hidden">

      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 text-center">

        {/* HEADER */}
        <p className="text-gray-500 text-sm mb-2">
          Environmental Challenges
        </p>

        <h2 className="text-xl md:text-2xl font-semibold mb-12">
          Major Issues Affecting Our Communities
        </h2>

        {/* MOBILE */}
        <div className="grid grid-cols-2 gap-3 mb-12 md:hidden ">
          <Card icon={<Waves size={16} />} text="Flooding" />
          <Card icon={<Trash2 size={16} />} text="Waste" />
          <Card icon={<Droplet size={16} />} text="Pollution" />
          <Card icon={<Flame size={16} />} text="Fire Outbreak" />
          <Card icon={<ShieldAlert size={16} />} text="Gas Leak" />
          <Card icon={<wind size={16} />} text="Air Pollution" />
          <Card icon={<Factory size={16} />} text="Drainage Blockage" />
          <Card icon={<CloudRain size={16} />} text="Heavy" />
        </div>

        {/* DESKTOP DOUBLE CIRCLE */}
        <div className="hidden md:flex justify-center gap-66 flex-wrap">

          {/* FIRST CIRCLE */}
          <Circle
            center="Issues"
            items={[
              { icon: <Flame size={14} />, text: "Fire Outbreak", pos: "top" },
              { icon: <Trash2 size={14} />, text: "Illegal Waste", pos: "left" },
              { icon: <Droplet size={14} />, text: "Water Pollution", pos: "right" },
              { icon: <Waves size={14} />, text: "Flooding", pos: "bottom" },
            ]}
          />

          {/* SECOND CIRCLE */}
          <Circle
            center="Issues"
            items={[
              { icon: <ShieldAlert size={14} />, text: "Gas Leak", pos: "top" },
              { icon: <Wind size={14} />, text: "Air Pollution", pos: "left" },
              { icon: <Factory size={14} />, text: "Drainage Blockage", pos: "right" },
              { icon: <CloudRain size={14} />, text: "Heavy Rain", pos: "bottom" },
            ]}
          />

        </div>

      </div>
    </section>
  );
}

/* 🔵 CIRCLE COMPONENT */
function Circle({ center, items }) {
  return (
    <div className="relative w-75 h-75 flex items-center justify-center">

      {/* ROTATING RING */}
      <div className="absolute w-55 h-55 rounded-full border border-green-200 animate-spin-slow backdrop-opacity-100"></div>

      {/* CENTER */}
      <div className="w-28 h-28 hover:bg-amber-400 bg-green-500 text-white flex items-center justify-center rounded-full text-sm font-semibold shadow-lg z-10 animate-pulse">
        {center}
      </div>

      {/* ITEMS */}
      {items.map((item, i) => {
        const positionClasses = {
          top: "absolute top-7 flex flex-col items-center gap-1",
          bottom: "absolute bottom-7 flex flex-col items-center gap-1",
          left: "absolute left-60 flex items-center gap-1",
          right: "absolute right-60 flex items-center gap-1",
        };

        return (
          <div
            key={i}
            className={`${positionClasses[item.pos]} animate-float`}
          >
            
        
            
            <Card icon={item.icon} text={item.text} />
            
          </div>
        );
      })}
    </div>
  );
}

/* 🟢 CARD */
function Card({ icon, text }) {
  return (
    <div className="bg-gray-100 px-3 py-3 rounded-lg flex items-center gap-2 text-xs shadow-sm 
    hover:bg-green-50 hover:scale-125 transition duration-300">
      <span className="text-green-600">{icon}</span>
      {text}
    </div>
  );
}

