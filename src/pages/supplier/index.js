import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SupplierDirectory from "@/components/suppliers/SupplierDirectory";

export default function SupplierPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F0]">
      <Header />
      <main className="flex-grow py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#b38e42_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto relative z-10">
          <SupplierDirectory showHeader={true} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
