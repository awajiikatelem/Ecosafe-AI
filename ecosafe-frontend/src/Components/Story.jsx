export default function Story() {
  return (
    <section className="bg-white py-6">
      
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">

        {/* CARD */}
        <div className="bg-gray-50 rounded-2xl p-5 md:p-10 ">

          <div className="grid md:grid-cols- gap-5 items-center">

            {/* LEFT TEXT */}
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Our Story
              </p>

              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Why EcoSafe Exists
              </h2>

              <p className="text-gray-600 text-b leading-relaxed max-w-md">
                EcoSafe was created to empower communities to take action against environmental hazards. 
                From oil spills to flooding and pollution, our platform provides a simple way for citizens 
                to report issues and help authorities respond faster.
              </p>
            </div>

            {/* RIGHT IMAGE */}
            <div>
              <img
                src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e"
                alt="environment"
                className="w-full h-50 md:h-190 object-cover rounded-xl"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}