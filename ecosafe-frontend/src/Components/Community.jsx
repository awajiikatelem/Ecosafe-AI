import { Droplet, Trash2, ShieldCheck } from "lucide-react";

export default function Community() {
  const tips = [
    {
      icon: <Droplet size={16} />,
      title: "Safe Water Use",
      desc: "Always check water color and smell before use.",
    },
    {
      icon: <Trash2 size={16} />,
      title: "Proper Waste Disposal",
      desc: "Avoid dumping waste in drainage systems.",
    },
    {
      icon: <ShieldCheck size={16} />,
      title: "Report Hazards Early",
      desc: "Quick reporting helps prevent disasters.",
    },
  ];

  return (
    <section className="bg-gray-100 py-12">

      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">

        <div className="grid md:grid-cols-2 gap-8 items-center">

          {/* LEFT CONTENT */}
          <div>

            <p className="text-gray-500 text-sm mb-2">
              Community Awareness
            </p>

            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Educating Communities for a Safer Environment
            </h2>

            <p className="text-sm text-gray-600 mb-6 max-w-md">
              EcoSafe helps communities stay informed about environmental risks 
              and provides simple safety practices to prevent disasters.
            </p>

            {/* TIPS */}
            <div className="space-y-3">

              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm hover:bg-green-50 transition"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-md">
                    {tip.icon}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      {tip.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {tip.desc}
                    </p>
                  </div>
                </div>
              ))}

            </div>

          </div>

          {/* RIGHT IMAGE */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1509099836639-18ba1795216d"
              alt="community awareness"
              className="w-full h-65 md:h-85 object-cover rounded-2xl"
            />
          </div>

        </div>

      </div>
    </section>
  );
}