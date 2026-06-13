import Image from "next/image";

export default function About() {
  return (
    <section id="about-us" className="bg-[#FAF7F0] py-16 sm:py-24 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Modern Architecture Image Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Soft decorative background shadow card */}
            <div className="absolute -inset-4 rounded-2xl bg-[#b38e42]/10 -rotate-2 scale-95" />
            <div className="relative h-[380px] sm:h-[450px] w-full max-w-[380px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/assets/about-arch.jpg"
                alt="DomNak Modern Architectural Details"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 380px"
                priority
              />
            </div>
          </div>

          {/* Right: Text and Circles Column */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-10 relative">
            {/* Title & Description */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold tracking-wider text-[#b38e42] uppercase">
                About DomNak
              </h2>
              <p className="text-base sm:text-lg text-brand-dark/80 leading-relaxed max-w-xl">
                Domnak means &quot;home&quot; in Khmer — a place of comfort, security, and belonging. At DomNak, we believe that building a home or property should begin with confidence, not uncertainty. We combine AI, real-time market data, and local construction expertise to help homeowners, builders, and developers understand the true cost of their project before construction begins.
              </p>
            </div>

            {/* Mission & Vision overlapping circular widgets with horizontal connector line */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-8 pt-8 pb-12 w-full max-w-2xl mx-auto">
              
              {/* Horizontal line extending across */}
              <div className="hidden sm:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#b38e42]/30 z-0 pointer-events-none" />
              
              {/* Mission Circle (left, shifted down) */}
              <div className="relative z-10 flex flex-col items-center justify-center p-6 rounded-full border border-[#b38e42] bg-[#FAF7F0] shadow-md w-[240px] h-[240px] sm:translate-y-6 transition-transform hover:-translate-y-1 sm:hover:translate-y-5 duration-300">
                {/* Decorative dashed outer ring */}
                <div className="absolute -inset-3 rounded-full border border-dashed border-[#b38e42]/40 pointer-events-none" />
                <h3 className="text-lg font-bold text-[#b38e42] uppercase tracking-wider">
                  Mission
                </h3>
                <p className="mt-2 text-xs text-brand-dark/85 leading-relaxed text-center font-normal">
                  To force transparency and fast connection between homeowners, architects, and local material suppliers, enabling smarter planning and smarter decision making.
                </p>
              </div>

              {/* Vision Circle (right, shifted up) */}
              <div className="relative z-10 flex flex-col items-center justify-center p-6 rounded-full border border-[#b38e42] bg-[#FAF7F0] shadow-md w-[240px] h-[240px] sm:-translate-y-6 transition-transform hover:-translate-y-7 duration-300">
                {/* Decorative dashed outer ring */}
                <div className="absolute -inset-3 rounded-full border border-dashed border-[#b38e42]/40 pointer-events-none" />
                <h3 className="text-lg font-bold text-[#b38e42] uppercase tracking-wider">
                  Vision
                </h3>
                <p className="mt-2 text-xs text-brand-dark/85 leading-relaxed text-center font-normal">
                  To be the most trusted and easiest platform for construction planning in Cambodia, transforming the way construction works.
                </p>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
