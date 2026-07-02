"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Features() {
  const [activeTab, setActiveTab] = useState("homeowner"); // 'homeowner' or 'architect'

  return (
    <section id="features" className="bg-[#b38e42] py-16 sm:py-24 text-white relative">
      {/* Subtle blueprint pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Built for Homeowners and <span className="italic font-semibold text-white">Architects</span>
          </h2>
        </div>

        {/* Tab Controls */}
        <div className="mt-10 flex justify-center">
          <div className="grid grid-cols-2 p-1.5 gap-1.5 bg-white rounded-full w-full max-w-[400px] shadow-md">
            <button
              onClick={() => setActiveTab("homeowner")}
              className={`rounded-full py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "homeowner"
                  ? "bg-[#80632b] text-white shadow-sm"
                  : "text-[#80632b] hover:bg-[#80632b]/10"
              }`}
            >
              For Homeowners
            </button>
            <button
              onClick={() => setActiveTab("architect")}
              className={`rounded-full py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "architect"
                  ? "bg-[#80632b] text-white shadow-sm"
                  : "text-[#80632b] hover:bg-[#80632b]/10"
              }`}
            >
              For Architects
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="mt-12">
          {activeTab === "homeowner" ? (
            <div className="bg-white text-brand-dark rounded-2xl p-6 sm:p-10 shadow-xl border border-white/20 animate-in fade-in duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#80632b] tracking-tight leading-snug">
                    Get your home&apos;s full cost estimate — before you commit.
                  </h3>
                  <p className="mt-3 text-brand-dark/80 text-sm sm:text-base leading-relaxed">
                    Upload your contractor&apos;s quote and we&apos;ll cross-verify it line-by-line using our real-time Khmer construction market database to make sure you pay fair prices.
                  </p>
                </div>

                {/* Features Checklist - Vertical List to match mockup */}
                <ul className="space-y-3.5 pt-6 border-t border-brand-dark/10">
                  {[
                    "Upload contractor quote to identify markup margin cost",
                    "Get exact materials and compare with local market rates",
                    "Recommend materials, locally-made products & suppliers",
                    "Save 2 - 5% of total project cost from avoid overbudget"
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center text-emerald-600">
                        <Check className="h-5 w-5 stroke-[3]" />
                      </div>
                      <span className="text-sm font-medium text-brand-dark/85">{text}</span>
                    </li>
                  ))}
                </ul>

                {/* Tab CTA Button styled on the bottom right */}
                <div className="flex justify-end pt-4">
                  <Link
                    href="/login?role=homeowner"
                    className="group inline-flex items-center gap-2 rounded-full bg-[#b38e42] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#80632b] hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    Start as homeowner
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white text-brand-dark rounded-2xl p-6 sm:p-10 shadow-xl border border-white/20 animate-in fade-in duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#80632b] tracking-tight leading-snug">
                    Generate a full BOQ in minutes, not hours.
                  </h3>
                  <p className="mt-3 text-brand-dark/80 text-sm sm:text-base leading-relaxed">
                    Upload your project survey template layout diagrams and we&apos;ll estimate the exact materials parameters to generate full matching BOQ sheet.
                  </p>
                </div>

                {/* Features Checklist - Vertical List to match mockup */}
                <ul className="space-y-3.5 pt-6 border-t border-brand-dark/10">
                  {[
                    "BOQ templates, automatic layout measurements",
                    "Generate export with matching local supplier items",
                    "Automatic scheduling, inventory list & matching",
                    "Save 2 - 5 hours per project on administration"
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center text-emerald-600">
                        <Check className="h-5 w-5 stroke-[3]" />
                      </div>
                      <span className="text-sm font-medium text-brand-dark/85">{text}</span>
                    </li>
                  ))}
                </ul>

                {/* Tab CTA Button styled on the bottom right */}
                <div className="flex justify-end pt-4">
                  <Link
                    href="/login?role=architect"
                    className="group inline-flex items-center gap-2 rounded-full bg-[#b38e42] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#80632b] hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    Start as architect
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
