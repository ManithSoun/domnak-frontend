import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Hammer } from "lucide-react";

export default function HomeownersPage() {
  return (
    <>
      <Header />
      <main className="flex-grow bg-[#FAF7F0] py-20 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#b38e42_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative mx-auto max-w-2xl px-4 text-center space-y-6 z-10">
          <div className="mx-auto h-16 w-16 bg-[#b38e42]/10 rounded-full flex items-center justify-center text-[#80632b]">
            <Hammer className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#201b12] tracking-tight">
            Homeowner Hub
          </h1>
          <p className="text-base text-[#201b12]/70 max-w-md mx-auto leading-relaxed">
            Welcome to the Homeowner portal. We are currently developing advanced tools for managing your construction quotes, tracking material history, and auditing builder pricing.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[#b38e42] hover:bg-[#80632b] px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-sm hover:shadow"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
