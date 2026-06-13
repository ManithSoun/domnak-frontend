export default function HowItWorks() {
  const homeownersSteps = [
    {
      step: "Step 1",
      title: "Upload your contractor's quote",
      description: "Upload contractor's quote template design...",
    },
    {
      step: "Step 2",
      title: "Get a clear cost breakdown",
      description: "Generate cost breakdown report from your upload templates...",
    },
    {
      step: "Step 3",
      title: "Our supplier from verified suppliers",
      description: "Verify pricing, matching supplier details...",
    },
  ];

  const architectsSteps = [
    {
      step: "Step 1",
      title: "Upload your floor plan",
      description: "Upload floor plan design to generate layout diagrams...",
    },
    {
      step: "Step 2",
      title: "Receive list BOQ instantly",
      description: "Generate list of BOQ parameters automatically...",
    },
    {
      step: "Step 3",
      title: "Share with your client in one click",
      description: "Share details with client in one click...",
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#FAF7F0] py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="border-b border-[#b38e42]/30 pb-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#201b12] tracking-tight">
            How it works
          </h2>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
          
          {/* Column: Homeowners */}
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#201b12] italic">
              Homeowners
            </h3>
            <div className="bg-white rounded-2xl shadow-xl border border-[#b38e42]/15 border-t-8 border-t-[#b38e42] overflow-hidden divide-y divide-[#b38e42]/10">
              {homeownersSteps.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 space-y-2.5"
                >
                  <span className="inline-flex items-center justify-center rounded-full bg-[#b38e42]/10 px-3 py-0.5 text-xs font-bold text-[#80632b] uppercase tracking-wider">
                    {item.step}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-[#201b12]">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Architects */}
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#201b12] italic">
              Architects
            </h3>
            <div className="bg-white rounded-2xl shadow-xl border border-[#b38e42]/15 border-t-8 border-t-[#b38e42] overflow-hidden divide-y divide-[#b38e42]/10">
              {architectsSteps.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 space-y-2.5"
                >
                  <span className="inline-flex items-center justify-center rounded-full bg-[#b38e42]/10 px-3 py-0.5 text-xs font-bold text-[#80632b] uppercase tracking-wider">
                    {item.step}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-[#201b12]">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
