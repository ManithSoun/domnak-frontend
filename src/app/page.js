"use client";

import { useEffect, useState } from "react";
import { testConnection } from "@/lib/api";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import About from "@/components/home/About";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import CallToAction from "@/components/home/CallToAction";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    testConnection()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("disconnected"));
  }, []);

  return (
    <>
      <Header />
      <main className="flex-grow">
        <Hero />
        <Stats />
        <About />
        <Features />
        <HowItWorks />
        <CallToAction />
      </main>
      <Footer />

      {/* Subtle floating backend status indicator */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-brand-dark px-3 py-1.5 text-xs text-white/95 shadow-lg border border-white/10 opacity-70 hover:opacity-100 transition-opacity">
        <span className={`h-2 w-2 rounded-full ${status === "ok" ? "bg-emerald-500 animate-pulse" : status === "checking..." ? "bg-amber-500 animate-pulse" : "bg-rose-500"}`} />
        <span>Backend: {status === "ok" ? "Connected" : status}</span>
      </div>
    </>
  );
}