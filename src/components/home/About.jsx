import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.15,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <section id="about-us" className="bg-background py-16 sm:py-24 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Modern Architecture Image Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative h-[480px] w-full max-w-[340px] shadow-lg border border-[#b38e42]/20 bg-white">
              {/* Left gold decorative line extending from left of screen and stopping at image */}
              <div className="absolute right-full top-[48%] w-[100vw] h-[2px] bg-[#b38e42] hidden lg:block pointer-events-none" />
              {/* Middle gold decorative line extending right from image and stopping in the air */}
              <div className="absolute left-full top-[48%] w-[120px] lg:w-[150px] h-[2px] bg-[#b38e42] hidden lg:block pointer-events-none" />
              
              <Image
                src="/assets/about-arch.jpg"
                alt="DomNak Modern Architectural Details"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 340px"
                priority
              />
            </div>
          </div>

          {/* Right: Text and Shapes Column */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 relative">
            {/* Title & Description */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#b38e42] tracking-tight">
                About <span className="italic">DomNak</span>
              </h2>
              <p className="text-sm sm:text-base text-brand-dark/80 leading-relaxed max-w-xl pb-4">
                Domnak means &quot;home&quot; in Khmer — a place of comfort, security, and belonging. At Domnak, we believe that building a home or property should begin with confidence, not uncertainty. We combine AI, real-time market data, and local construction expertise to help homeowners, builders, and developers understand the true cost of their projects before construction begins.
              </p>
            </div>

            {/* Mission & Vision Semi-circular Cards with Connector Lines */}
            <div 
              ref={containerRef}
              className="relative flex flex-col sm:flex-row items-center justify-start gap-8 sm:gap-6 pt-4 pb-12 w-full max-w-2xl"
            >
              
              {/* Mission Card (Bowl shape pointing downwards, flat top, rounded bottom) */}
              <div 
                className={`w-[280px] sm:w-[320px] lg:w-[360px] h-[140px] sm:h-[160px] lg:h-[180px] transform transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"
                }`}
                style={{ transitionDelay: "150ms" }}
              >
                <div className="w-full h-full relative z-10 flex flex-col items-center justify-start pt-5 sm:pt-6 lg:pt-8 px-6 sm:px-8 lg:px-10 rounded-b-full rounded-t-none border border-brand-dark/30 bg-[#fffbee] shadow-sm sm:translate-y-8 transition-transform hover:-translate-y-1 sm:hover:translate-y-7 duration-300">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#b38e42] uppercase tracking-wider">
                    Mission
                  </h3>
                  <p className="mt-2 text-[10px] sm:text-[11px] lg:text-xs text-brand-dark/85 leading-normal sm:leading-relaxed text-center max-w-[220px] sm:max-w-[250px] lg:max-w-[280px]">
                    To provide transparent and reliable construction cost insights through AI, and local expertise, enabling better planning and smarter building decisions.
                  </p>
                </div>
              </div>

              {/* Vision Card (Dome shape pointing upwards, rounded top, flat bottom) */}
              <div 
                className={`w-[280px] sm:w-[320px] lg:w-[360px] h-[140px] sm:h-[160px] lg:h-[180px] transform transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
                }`}
                style={{ transitionDelay: "450ms" }}
              >
                <div className="w-full h-full relative z-10 flex flex-col items-center justify-end pb-5 sm:pb-6 lg:pb-8 px-6 sm:px-8 lg:px-10 rounded-t-full rounded-b-none border border-brand-dark/30 bg-[#fffbee] shadow-sm sm:-translate-y-2 transition-transform hover:-translate-y-3 duration-300">
                  {/* Gold connector line extending right from below the Vision card */}
                  <div className="absolute left-[30%] top-[calc(100%+32px)] w-[100vw] h-[2px] bg-[#b38e42] hidden sm:block pointer-events-none" />
                  
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#b38e42] uppercase tracking-wider">
                    Vision
                  </h3>
                  <p className="mt-2 text-[10px] sm:text-[11px] lg:text-xs text-brand-dark/85 leading-normal sm:leading-relaxed text-center max-w-[220px] sm:max-w-[250px] lg:max-w-[280px]">
                    To become Cambodia's most trusted platform for construction cost intelligence, helping everyone build with confidence through transparency and technology.
                  </p>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
