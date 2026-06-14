import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full h-[650px] sm:h-[720px] md:h-[800px] flex items-center justify-start overflow-hidden bg-brand-dark">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ 
          backgroundImage: "url('/assets/domnak-landing.png')",
        }}
      />
      {/* Overlay to darken and add blue/dark tone for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/75 to-transparent" />
      <div className="absolute inset-0 bg-brand-dark/30 backdrop-brightness-[0.85]" />

      {/* Hero Content Container */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="max-w-2xl text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Build your home
            <br />
            with <span className="text-brand-gold italic font-semibold">full clarity</span>
            <br />
            and confidence.
          </h1>
          
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="#get-started"
              className="inline-flex items-center justify-center rounded-full border-2 border-brand-gold px-8 py-3 text-base font-bold text-white bg-brand-gold/15 hover:bg-brand-gold transition-all duration-300 hover:shadow-lg hover:shadow-brand-gold/20"
            >
              Get Started
            </Link>
            <Link
              href="#how-it-works"
              className="group inline-flex items-center text-base font-semibold text-white hover:text-brand-gold transition-colors duration-200"
            >
              See how it works
              <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
