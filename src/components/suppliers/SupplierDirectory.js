import React, { useState, useEffect } from "react";
import { Store, MapPin, Phone, Search, SlidersHorizontal, CheckCircle2, DollarSign, X } from "lucide-react";
import { getSuppliers, trackSupplierClick } from "@/lib/api/index";

const STATIC_FALLBACK_SUPPLIERS = [
  { id: "s1", full_name: "Camel Cement Cambodia",    material_name: "Cement",    price_per_unit: 6.20,   unit: "bag",  location: "Phnom Penh",      phone_number: "+855 12 345 678" },
  { id: "s2", full_name: "Siam Cement Group (SCG)",  material_name: "Cement",    price_per_unit: 92.00,  unit: "ton",  location: "Kandal Province", phone_number: "+855 99 888 777" },
  { id: "s3", full_name: "Heng Hardware Co.",        material_name: "Steel",     price_per_unit: 710.00, unit: "ton",  location: "Toul Kork",       phone_number: "+855 15 666 555" },
  { id: "s4", full_name: "Angkor Tiles & Ceramics",  material_name: "Tiles",     price_per_unit: 14.50,  unit: "sqm",  location: "Chamkar Mon",     phone_number: "+855 88 555 444" },
  { id: "s5", full_name: "PPM Concrete Supply",      material_name: "Concrete",   price_per_unit: 68.00,  unit: "m³",   location: "Sen Sok",         phone_number: "+855 23 999 111" },
  { id: "s6", full_name: "Chip Mong Lumber Co.",     material_name: "Wood",      price_per_unit: 45.00,  unit: "piece",location: "Russei Keo",      phone_number: "+855 77 444 333" },
  { id: "s7", full_name: "Toul Kork Bricks & Sand",  material_name: "Bricks",    price_per_unit: 0.06,   unit: "piece",location: "Toul Kork",       phone_number: "+855 12 654 321" },
  { id: "s8", full_name: "Kandal Masonry Works",     material_name: "Bricks",    price_per_unit: 0.07,   unit: "piece",location: "Kandal Province", phone_number: "+855 16 789 012" }
];

export default function SupplierDirectory({ showHeader = true, onShowToast = null }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  
  // Modal State for contact details
  const [activeContactSupplier, setActiveContactSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await getSuppliers();
      if (res && res.data && res.data.length > 0) {
        setSuppliers(res.data);
      } else {
        // Use fallbacks if database is empty
        setSuppliers(STATIC_FALLBACK_SUPPLIERS);
      }
    } catch (err) {
      console.error("Failed to load suppliers, using fallbacks", err);
      setErrorState(true);
      setSuppliers(STATIC_FALLBACK_SUPPLIERS);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupplier = async (supplier) => {
    setActiveContactSupplier(supplier);
    
    // Call database click tracking endpoint asynchronously
    try {
      await trackSupplierClick(supplier.id);
    } catch (err) {
      console.warn("Click tracking error:", err);
    }

    if (onShowToast) {
      onShowToast(`Opened contact for ${supplier.full_name}`);
    }
  };

  // Get distinct categories & locations
  const categories = ["All", ...new Set(suppliers.map(s => s.material_name || "Other"))];
  const locations = ["All", ...new Set(suppliers.map(s => s.location || "Phnom Penh"))];

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const nameMatch = (s.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const materialMatch = (s.material_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const locMatch = (s.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSearch = nameMatch || materialMatch || locMatch;
    
    const matchesCategory = selectedCategory === "All" || s.material_name === selectedCategory;
    const matchesLocation = selectedLocation === "All" || s.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      
      {/* 1. Header Banner */}
      {showHeader && (
        <div className="bg-[#1E1C18] text-white rounded-3xl p-8 lg:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#b38e42]/10 rounded-bl-full animate-pulse" />
          <div className="relative z-10 space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#b38e42]/20 text-[#b38e42] border border-[#b38e42]/30 rounded-full px-3 py-1 text-xs font-bold">
              <Store className="h-3.5 w-3.5" /> Supplier Directory
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Browse Verified Suppliers Near You
            </h2>
            <p className="text-sm text-white/65 leading-relaxed">
              Find trusted building material suppliers, hardware stores, and construction service providers in Cambodia. All listings are verified for wholesale builder rates by the DomNak team.
            </p>
          </div>
        </div>
      )}

      {/* 2. Filter & Search Controls */}
      <div className="bg-white border border-[#b38e42]/10 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md flex items-center">
          <Search className="absolute left-3.5 h-4.5 w-4.5 text-[#201b12]/45 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF7F0] border border-[#b38e42]/15 text-[#201b12] rounded-xl pl-10.5 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-[#b38e42] focus:ring-1 focus:ring-[#b38e42]/20 transition-all placeholder:text-[#201b12]/40"
          />
        </div>

        {/* Filters Dropdown */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-start md:justify-end">
          
          {/* Material Category filter */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-[#201b12]/50 font-bold uppercase tracking-wider hidden lg:inline mr-1">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#FAF7F0] border border-[#b38e42]/15 text-[#201b12] rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer hover:border-[#b38e42] transition-colors"
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat === "All" ? "All Materials" : cat}</option>
              ))}
            </select>
          </div>

          {/* Location filter */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-[#201b12]/50 font-bold uppercase tracking-wider hidden lg:inline mr-1">Location:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-[#FAF7F0] border border-[#b38e42]/15 text-[#201b12] rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer hover:border-[#b38e42] transition-colors"
            >
              {locations.map((loc, i) => (
                <option key={i} value={loc}>{loc === "All" ? "All Locations" : loc}</option>
              ))}
            </select>
          </div>
          
        </div>
      </div>

      {/* 3. Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-[#b38e42]/10 rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-10 w-10 bg-[#b38e42]/10 rounded-xl" />
                <div className="h-6 w-16 bg-[#b38e42]/10 rounded-full" />
              </div>
              <div className="h-4 w-3/4 bg-[#201b12]/10 rounded-md" />
              <div className="h-3 w-1/2 bg-[#201b12]/10 rounded-md" />
              <div className="h-3 w-2/3 bg-[#201b12]/10 rounded-md" />
              <div className="h-8 bg-[#b38e42]/10 rounded-xl mt-2" />
            </div>
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white border border-[#b38e42]/10 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="h-12 w-12 bg-[#b38e42]/10 text-[#80632b] rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-[#201b12]">No Suppliers Found</h3>
          <p className="text-sm text-[#201b12]/60 mt-1 max-w-xs mx-auto leading-relaxed">
            We couldn't find any suppliers matching your search criteria. Try adjusting filters or typing another name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {filteredSuppliers.map((s, i) => {
            const name = s.full_name || "Unknown Supplier";
            const initial = name.charAt(0).toUpperCase();
            
            // Format price string if price is provided
            const priceText = s.price_per_unit != null
              ? `$${s.price_per_unit.toFixed(2)} / ${s.unit || "unit"}`
              : "Ask for quote";

            return (
              <div 
                key={i} 
                className="bg-white border border-[#b38e42]/10 hover:border-[#b38e42]/25 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3.5">
                    <div className="h-11 w-11 bg-[#b38e42]/10 rounded-xl flex items-center justify-center text-[#80632b] font-black text-lg border border-[#b38e42]/20">
                      {initial}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#80632b] bg-[#b38e42]/10 border border-[#b38e42]/20 rounded-full px-2.5 py-1">
                      <CheckCircle2 className="h-3 w-3 text-[#b38e42]" /> Verified
                    </span>
                  </div>
                  
                  <h4 className="font-black text-base text-[#201b12] leading-tight tracking-tight">
                    {name}
                  </h4>
                  <p className="text-xs text-[#201b12]/50 font-bold uppercase tracking-wider mt-1.5">
                    {s.material_name || "Building Materials"}
                  </p>
                  
                  {/* Location info */}
                  <div className="flex items-center gap-1.5 mt-3.5 text-xs text-[#201b12]/60 font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-[#b38e42] shrink-0" />
                    <span>{s.location || "Cambodia"}</span>
                  </div>
                  
                  {/* Pricing info */}
                  <div className="flex items-center gap-1.5 mt-2.5 text-xs text-[#201b12]/80 font-black">
                    <DollarSign className="h-3.5 w-3.5 text-[#b38e42] shrink-0" />
                    <span>{priceText}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleContactSupplier(s)} 
                  className="mt-5 w-full text-xs font-black text-[#80632b] hover:text-white bg-[#b38e42]/8 hover:bg-[#b38e42] border border-[#b38e42]/25 rounded-xl py-3 transition-all cursor-pointer"
                >
                  Contact Supplier
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Active Contact Modal */}
      {activeContactSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-[#b38e42]/15 animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setActiveContactSupplier(null)}
              className="absolute top-4 right-4 p-1.5 text-[#201b12]/40 hover:text-[#201b12] hover:bg-[#201b12]/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-[#b38e42]/15 rounded-2xl flex items-center justify-center text-[#80632b] font-black text-2xl border border-[#b38e42]/25">
                  {activeContactSupplier.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#201b12] tracking-tight">{activeContactSupplier.full_name}</h3>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-[#80632b] bg-[#b38e42]/10 border border-[#b38e42]/15 rounded-full px-2 py-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5 text-[#b38e42]" /> Verified Partner
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-[#b38e42]/10 py-4 space-y-3.5">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-[#201b12]/50">Material Category:</span>
                  <span className="text-[#201b12] font-black">{activeContactSupplier.material_name || "General Materials"}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-[#201b12]/50">Reference Pricing:</span>
                  <span className="text-[#201b12] font-black">
                    {activeContactSupplier.price_per_unit != null
                      ? `$${activeContactSupplier.price_per_unit.toFixed(2)} / ${activeContactSupplier.unit || "unit"}`
                      : "Ask for quote"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-[#201b12]/50">Distribution Location:</span>
                  <span className="text-[#201b12] font-black">{activeContactSupplier.location || "Cambodia"}</span>
                </div>
              </div>

              <div className="bg-[#FAF7F0] border border-[#b38e42]/15 rounded-2xl p-4.5 space-y-3">
                <p className="text-xs text-[#201b12]/60 font-bold uppercase tracking-wider">Connect directly to place order</p>
                <div className="flex items-center gap-3 text-sm text-[#201b12] font-black">
                  <Phone className="h-4.5 w-4.5 text-[#b38e42]" />
                  <a href={`tel:${activeContactSupplier.phone_number || ""}`} className="hover:text-[#80632b] transition-colors">
                    {activeContactSupplier.phone_number || "Call for pricing details"}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setActiveContactSupplier(null)}
                  className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-[#201b12] font-black text-sm rounded-xl py-3 cursor-pointer transition-colors"
                >
                  Close
                </button>
                <a 
                  href={`tel:${activeContactSupplier.phone_number || ""}`}
                  className="flex-1 text-center bg-[#b38e42] hover:bg-[#80632b] text-white font-black text-sm rounded-xl py-3 shadow-md hover:shadow-lg transition-all"
                >
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
