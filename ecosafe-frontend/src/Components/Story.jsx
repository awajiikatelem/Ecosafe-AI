import storyImage from "../assets/hacka000.JPG";

export default function Story() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CARD */}
        <div className="bg-gray-50/70 border border-gray-150/40 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            
            {/* LEFT TEXT */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest block">
                Our Mission & Story
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight leading-tight">
                Why EcoSafe Exists
              </h2>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light">
                EcoSafe was created to bridge the communication gap between citizens and environmental protection agencies. 
                From oil spills in the delta regions to municipal flooding, drainage blockage, and illegal waste dumping, 
                our platform empowers individuals to document incidents and feed them directly into our AI-prioritized routing engine.
              </p>
              
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light">
                By equipping local communities with real-time hazard mapping and automated notification systems, we translate individual vigilance into immediate collective response.
              </p>
            </div>

            {/* RIGHT IMAGE */}
            <div className="w-full">
              <img
                src={storyImage}
                alt="EcoSafe Community Story"
                className="w-full h-72 sm:h-96 object-cover rounded-2xl shadow-lg border border-gray-200/50 hover:scale-[1.01] transition-transform duration-300"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}