import Link from "next/link";

export default function CallToAction() {
  return (
    <section id="get-started" className="bg-[#ab8231] py-16 sm:py-20 text-white text-center relative overflow-hidden">
      {/* Structural pattern lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="20%" x2="100%" y2="80%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="100%" y1="20%" x2="0" y2="80%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 z-10 space-y-8">
        
        {/* Caption */}
        <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-white/90">
          Get Started
        </p>

        {/* Big Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
          No credit card. No technical knowledge. Just your dimensions and three minutes.
        </h2>

        {/* Buttons Grid */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto sm:max-w-none">
          <Link
            href="/login?role=homeowner"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-bold text-[#ab8231] hover:bg-brand-cream transition-colors shadow-md"
          >
            I&apos;m a Homeowner
          </Link>
          <Link
            href="/login?role=architect"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-brand-dark px-8 py-3.5 text-base font-bold text-white hover:bg-black transition-colors shadow-md"
          >
            I&apos;m an architect
          </Link>
        </div>

      </div>
    </section>
  );
}
