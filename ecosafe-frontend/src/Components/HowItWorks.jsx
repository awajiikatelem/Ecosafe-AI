import { MapPin, CheckCircle, AlertTriangle, Zap } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <AlertTriangle size={20} />,
      title: "Report Hazard",
      desc: "Users report environmental issues around them.",
    },
    {
      icon: <MapPin size={20} />,
      title: "Location Captured",
      desc: "System detects and stores location data.",
    },
    {
      icon: <CheckCircle size={20} />,
      title: "Admin Verification",
      desc: "Authorities verify the submitted report.",
    },
    {
      icon: <Zap size={20} />,
      title: "Response Action",
      desc: "Agencies respond and resolve the issue.",
    },
  ];

  return (
    <section className="bg-gray-50 py-8 ">

      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">

        {/* HEADER */}
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm mb-1">
            How It Works
          </p>

          <h2 className="text-xl md:text-2xl font-semibold">
            Simple Process to Protect Your Environment
          </h2>
        </div>

        {/* 2x2 GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-9">

          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white w-full rounded-xl  p-6 flex items-start gap-3 hover:bg-gray-200 transition"
            >

              {/* ICON */}
              <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-lg">
                {step.icon}
              </div>

              {/* TEXT */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  {step.title}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}