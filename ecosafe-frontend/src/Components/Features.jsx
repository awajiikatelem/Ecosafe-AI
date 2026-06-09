import { useState } from "react";

export default function Features() {
  const features = [
    {
      title: "Report Oil / Gas Leaks",
      desc: "Quickly report incidents affecting your environment.",
      image: "https://images.unsplash.com/photo-1628924553050-e83da9fe856f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b2lsJTIwcG9sbHV0aW9ufGVufDB8fDB8fHww",
    },
    {
      title: "Drainage Blockage ",
      desc: "Report blocked drains to prevent flooding and water contamination.",
      image: "https://images.unsplash.com/photo-1693497540664-3384fcf6fb74?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YmxvY2tlZCUyMGRyYWlufGVufDB8fDB8fHww",
    },
    {
      title: "Fire Outbreak Reports",
      desc: "Alert authorities about fires threatening your community.",
      image: "https://img.freepik.com/premium-photo/first-responders-tackling-fire-outbreak-neighborhood_1081806-2058.jpg?semt=ais_incoming&w=740&q=80",
    },
    {
      title: "Flood & Erosion Alerts",
      desc: "Stay informed about environmental risks.",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Flood_survival.jpg/1280px-Flood_survival.jpg",
    },
    {
      title: "Waste Management Reports",
      desc: "Report illegal dumping and sanitation issues.",
      image: "https://images.unsplash.com/photo-1717667745836-145a38948ebf?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d2FzdGUlMjBtYW5hZ2VtZW50fGVufDB8fDB8fHww",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-white py-6">
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">

        <div className="grid md:grid-cols-2 gap-8 items-center">

          {/* IMAGE WITH ANIMATION */}
          <div className="relative overflow-hidden rounded-2xl">

            <img
              key={activeIndex}
              src={features[activeIndex].image}
              alt="feature"
              className="w-full h-75 md:h-90 object-cover rounded-2xl 
              animate-fadeIn scale-105"
            />
          </div>

          {/* RIGHT CONTENT */}
          <div>

            <p className="text-gray-500 text-sm mb-2">
              What EcoSafe Does
            </p>

            <h2 className="text-2xl font-bold mb-6">
              Key Features of the Platform
            </h2>

            <div className="space-y-4">

              {features.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300
                  ${activeIndex === index 
                    ? "bg-green-50 border border-green-200 scale-[1.02]" 
                    : "hover:bg-gray-50 hover:scale-[1.01]"}`}
                >

                  {/* LINE */}
                  <div className={`w-1 h-12 rounded transition-all
                    ${activeIndex === index ? "bg-green-500" : "bg-gray-300"}`}>
                  </div>

                  {/* TEXT */}
                  <div>
                    <div className="flex items-center gap-3">

                      <span className={`font-bold text-lg transition
                        ${activeIndex === index ? "text-green-600" : "text-gray-500"}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3 className="font-semibold text-gray-800">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 mt-1 max-w-sm">
                      {item.desc}
                    </p>
                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}