import { Upload, FileText, ShoppingCart, ClipboardList, Share2 } from "lucide-react";

export default function HowItWorks() {
  const homeownersSteps = [
    {
      step: "Step 1",
      icon: Upload,
      title: "Upload your contractor's quote",
      description: "Take a photo or upload a PDF of any quote you've received. Domnak reads it automatically — no manual entry needed.",
    },
    {
      step: "Step 2",
      icon: FileText,
      title: "Get a clear cost breakdown",
      description: "See labour, materials, and markup separated line by line. Know instantly if a price is fair.",
    },
    {
      step: "Step 3",
      icon: ShoppingCart,
      title: "Buy supplies from verified suppliers",
      description: "Browse materials from our listed suppliers and order directly — no middlemen, no surprise markups.",
    },
  ];

  const architectsSteps = [
    {
      step: "Step 1",
      icon: Upload,
      title: "Upload your floor plan",
      description: "Upload a floor plan image or PDF. Domnak's AI reads wall lengths, room areas, roof, and foundation dimensions automatically.",
    },
    {
      step: "Step 2",
      icon: ClipboardList,
      title: "Receive a full BOQ instantly",
      description: "Get a complete Bill of Quantities with material quantities, unit costs, and totals — generated in minutes, not hours.",
    },
    {
      step: "Step 3",
      icon: Share2,
      title: "Share with your client in one click",
      description: "Export a clean, jargon-free cost summary your client can actually understand. No spreadsheet formatting, no back-and-forth.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-background py-16 sm:py-24 overflow-hidden relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="relative pb-4 mb-16 max-w-max">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#b38e42] tracking-tight">
            How it works
          </h2>
          {/* UNDERLINE extending left */}
          <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#b38e42]" />
          <div className="absolute right-full bottom-0 w-[100vw] h-[3px] bg-[#b38e42] hidden sm:block pointer-events-none" />
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12 lg:gap-16">
          
          {/* Column: Homeowners */}
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-dark italic">
              Homeowners
            </h3>
            {/* Parent container for shadow offset effect */}
            <div className="relative pt-3 pl-3">
              {/* Offset Gold Shadow Card Behind */}
              <div className="absolute -inset-0 bg-[#b38e42] rounded-2xl -translate-x-3 translate-y-3 z-0" />
              
              {/* Front White/Cream Card */}
              <div className="relative bg-[#fffdf9] rounded-2xl border border-[#b38e42]/30 overflow-hidden divide-y divide-[#b38e42]/15 z-10 flex flex-col">
                {homeownersSteps.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-6 sm:p-8 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b38e42]/10 px-3 py-1 text-xs font-bold text-[#80632b] uppercase tracking-wider">
                          <IconComponent className="h-3.5 w-3.5" />
                          {item.step}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-[#201b12]">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-[13px] text-brand-dark/80 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="pt-1">
                        {idx === 0 ? (
                          <div className="relative">
                            <input
                              type="file"
                              id="step-homeowner-upload"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  alert(`Selected quote: ${e.target.files[0].name}`);
                                }
                              }}
                            />
                            <label
                              htmlFor="step-homeowner-upload"
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#b38e42] hover:bg-[#80632b] text-white px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                            >
                              Upload Quote
                            </label>
                          </div>
                        ) : idx === 1 ? (
                          <a
                            href="#features"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#b38e42]/30 px-4 py-2 text-xs font-bold text-[#80632b] hover:bg-[#b38e42]/5 transition-all duration-200"
                          >
                            See cost breakdown
                          </a>
                        ) : (
                          <a
                            href="#features"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#b38e42]/30 px-4 py-2 text-xs font-bold text-[#80632b] hover:bg-[#b38e42]/5 transition-all duration-200"
                          >
                            Browse suppliers
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column: Architects */}
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-dark italic">
              Architects
            </h3>
            {/* Parent container for shadow offset effect */}
            <div className="relative pt-3 pl-3">
              {/* Offset Gold Shadow Card Behind */}
              <div className="absolute -inset-0 bg-[#b38e42] rounded-2xl -translate-x-3 translate-y-3 z-0" />
              
              {/* Front White/Cream Card */}
              <div className="relative bg-[#fffdf9] rounded-2xl border border-[#b38e42]/30 overflow-hidden divide-y divide-[#b38e42]/15 z-10 flex flex-col">
                {architectsSteps.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-6 sm:p-8 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b38e42]/10 px-3 py-1 text-xs font-bold text-[#80632b] uppercase tracking-wider">
                          <IconComponent className="h-3.5 w-3.5" />
                          {item.step}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-[#201b12]">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-[13px] text-brand-dark/80 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="pt-1">
                        {idx === 0 ? (
                          <div className="relative">
                            <input
                              type="file"
                              id="step-architect-upload"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  alert(`Selected floor plan: ${e.target.files[0].name}`);
                                }
                              }}
                            />
                            <label
                              htmlFor="step-architect-upload"
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#b38e42] hover:bg-[#80632b] text-white px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                            >
                              Upload Floor Plan
                            </label>
                          </div>
                        ) : idx === 1 ? (
                          <a
                            href="#features"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#b38e42]/30 px-4 py-2 text-xs font-bold text-[#80632b] hover:bg-[#b38e42]/5 transition-all duration-200"
                          >
                            Generate BOQ
                          </a>
                        ) : (
                          <a
                            href="#features"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#b38e42]/30 px-4 py-2 text-xs font-bold text-[#80632b] hover:bg-[#b38e42]/5 transition-all duration-200"
                          >
                            Share with client
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
