import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Layers, 
  Ruler, 
  DollarSign, 
  Phone, 
  Plus, 
  Trash2, 
  ArrowRight,
  Info,
  Check,
  Smartphone
} from "lucide-react";

const CATEGORIES = [
  { value: "living", label: "Living / Lounge" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen / Dining" },
  { value: "bathroom", label: "Bathroom" },
  { value: "balcony", label: "Balcony / Terrace" },
  { value: "utility", label: "Utility / Other" }
];

const PROVINCES = [
  "Phnom Penh",
  "Siem Reap",
  "Sihanoukville",
  "Battambang",
  "Kampot",
  "Kandal",
  "Kampong Cham",
  "Kampong Speu"
];

const PROPERTY_TYPES = [
  "New construction",
  "Renovation / Addition",
  "Interior design & fitout"
];

const SCOPE_ITEMS = [
  "Foundation",
  "Structure",
  "Roofing",
  "Electrical",
  "Plumbing",
  "Flooring",
  "Finishing",
  "Doors and windows"
];

const QUALITY_TIERS = [
  { value: "standard", label: "Standard class (standard tiles, local brick - est. $350/sqm)" },
  { value: "premium", label: "Premium class (teak wood, marble finish - est. $480/sqm)" },
  { value: "luxury", label: "Luxury class (smart controls, high imports - est. $680/sqm)" }
];

export default function ManualQuoteForm({ onSubmit, onBack }) {
  // Stepper / Form States
  const [projectName, setProjectName] = useState("");
  const [propertyType, setPropertyType] = useState("New construction");
  const [province, setProvince] = useState("Phnom Penh");
  const [floorArea, setFloorArea] = useState("");
  const [numFloors, setNumFloors] = useState("");
  
  const [contractorName, setContractorName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [quotedAmount, setQuotedAmount] = useState("");
  const [depositTerms, setDepositTerms] = useState("30% deposit, 3 milestones");

  const [scopeOfWork, setScopeOfWork] = useState(["Foundation", "Structure", "Roofing"]);
  const [qualityTier, setQualityTier] = useState("premium");

  // Rooms State
  const [rooms, setRooms] = useState([
    { id: "room_1", name: "Master bedroom", type: "bedroom", area: 28, qualityOverride: "default" },
    { id: "room_2", name: "Kitchen", type: "kitchen", area: 18, qualityOverride: "standard" }
  ]);

  // Validation state
  const [errors, setErrors] = useState({});

  const handleToggleScope = (item) => {
    if (scopeOfWork.includes(item)) {
      setScopeOfWork(scopeOfWork.filter(i => i !== item));
    } else {
      setScopeOfWork([...scopeOfWork, item]);
    }
  };

  const handleAddRoom = () => {
    const newId = `room_${Date.now()}`;
    setRooms([
      ...rooms,
      { id: newId, name: "New Room", type: "living", area: 15, qualityOverride: "default" }
    ]);
  };

  const handleRemoveRoom = (id) => {
    setRooms(rooms.filter(room => room.id !== id));
  };

  const handleUpdateRoom = (id, field, value) => {
    setRooms(rooms.map(room => {
      if (room.id === id) {
        return { ...room, [field]: value };
      }
      return room;
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!projectName.trim()) newErrors.projectName = "Project name is required";
    if (!floorArea || parseFloat(floorArea) <= 0) newErrors.floorArea = "Please enter a valid total area";
    if (!numFloors || parseInt(numFloors) <= 0) newErrors.numFloors = "Please enter number of floors";
    if (!contractorName.trim()) newErrors.contractorName = "Contractor name is required";
    if (!quotedAmount || parseFloat(quotedAmount) <= 0) newErrors.quotedAmount = "Please enter a valid quoted amount";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const processedRooms = rooms.map((room, idx) => {
      const area = parseFloat(room.area) || 12;
      // We approximate a 4:3 or similar standard rectangular size
      const width = parseFloat((Math.sqrt(area) * 1.15).toFixed(1));
      const length = parseFloat((area / width).toFixed(1));
      return {
        id: room.id || `room_${idx}_${Date.now()}`,
        name: room.name,
        category: room.type,
        floor: "Ground Floor",
        width,
        length,
        notes: room.qualityOverride !== "default" ? `Quality override: ${room.qualityOverride}` : "Standard specification"
      };
    });

    const payload = {
      projectName,
      contractorName,
      quotedPrice: parseFloat(quotedAmount),
      qualityTier,
      rooms: processedRooms,
      projectDetails: {
        propertyType,
        province,
        floorArea: parseFloat(floorArea),
        numFloors: parseInt(numFloors),
        contactPhone,
        depositTerms,
        scopeOfWork
      }
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl bg-white border border-[#1E1C18]/5 rounded-3xl shadow-xl p-6 lg:p-10 my-8 space-y-8 animate-in zoom-in-95 duration-200 text-left">
      
      {/* Form Header */}
      <div className="flex items-start justify-between border-b border-[#1E1C18]/10 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E1C18] tracking-tight">Create Custom Quote</h2>
          <p className="text-xs text-[#1E1C18]/55 font-medium mt-1">
            Fill in your contractor's quote details. We will initialize a dynamic spatial room model which you can customize line-by-line.
          </p>
        </div>
        {onBack && (
          <button 
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-brand-gold hover:text-brand-gold-dark border border-brand-gold/25 hover:border-brand-gold rounded-xl px-4 py-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            ← Back to Options
          </button>
        )}
      </div>

      {/* SECTION 1: PROJECT DETAILS */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-brand-gold uppercase tracking-wider">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-[#1E1C18]/65 uppercase tracking-wider">Project Name</label>
            <div className="relative">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. 2-Story Modern Villa Restoration"
                className={`w-full text-xs bg-[#FAF7F0] border ${errors.projectName ? 'border-rose-500' : 'border-[#1E1C18]/10'} rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all`}
              />
              {errors.projectName && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.projectName}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#1E1C18]/65 uppercase tracking-wider">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all cursor-pointer"
            >
              {PROPERTY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#1E1C18]/65 uppercase tracking-wider">Province</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all cursor-pointer"
            >
              {PROVINCES.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#1E1C18]/65 uppercase tracking-wider">Total Floor Area (SQM)</label>
            <div className="relative">
              <input
                type="number"
                value={floorArea}
                onChange={(e) => setFloorArea(e.target.value)}
                placeholder="e.g. 210"
                className={`w-full text-xs bg-[#FAF7F0] border ${errors.floorArea ? 'border-rose-500' : 'border-[#1E1C18]/10'} rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all`}
              />
              {errors.floorArea && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.floorArea}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#1E1C18]/65 uppercase tracking-wider">Number of Floors</label>
            <div className="relative">
              <input
                type="number"
                value={numFloors}
                onChange={(e) => setNumFloors(e.target.value)}
                placeholder="e.g. 2"
                className={`w-full text-xs bg-[#FAF7F0] border ${errors.numFloors ? 'border-rose-500' : 'border-[#1E1C18]/10'} rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all`}
              />
              {errors.numFloors && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.numFloors}</p>}
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: CONTRACTOR AND PAYMENT */}
      <div className="space-y-4 pt-4 border-t border-[#1E1C18]/5">
        <h3 className="text-xs font-black text-brand-gold uppercase tracking-wider">Contractor and Payment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#1E1C18]/65 uppercase tracking-wider">Contractor / Builder Name</label>
            <div className="relative">
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder="e.g. BuildCorp Cambodia"
                className={`w-full text-xs bg-[#FAF7F0] border ${errors.contractorName ? 'border-rose-500' : 'border-[#1E1C18]/10'} rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all`}
              />
              {errors.contractorName && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.contractorName}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#1E1C18]/65 uppercase tracking-wider">Contact Phone</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. 012 345 678"
              className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#1E1C18]/65 uppercase tracking-wider">Quoted Amount (USD)</label>
            <div className="relative">
              <input
                type="number"
                value={quotedAmount}
                onChange={(e) => setQuotedAmount(e.target.value)}
                placeholder="e.g. 145000"
                className={`w-full text-xs bg-[#FAF7F0] border ${errors.quotedAmount ? 'border-rose-500' : 'border-[#1E1C18]/10'} rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all`}
              />
              {errors.quotedAmount && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.quotedAmount}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#1E1C18]/65 uppercase tracking-wider">Deposit / Payment Terms</label>
            <input
              type="text"
              value={depositTerms}
              onChange={(e) => setDepositTerms(e.target.value)}
              placeholder="e.g. 30% deposit, 3 milestones"
              className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
            />
          </div>

        </div>
      </div>

      {/* SECTION 3: SCOPE OF WORK */}
      <div className="space-y-4 pt-4 border-t border-[#1E1C18]/5">
        <h3 className="text-xs font-black text-brand-gold uppercase tracking-wider">Scope of Work</h3>
        <div className="flex flex-wrap gap-2">
          {SCOPE_ITEMS.map(item => {
            const isSelected = scopeOfWork.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleToggleScope(item)}
                className={`flex items-center gap-1.5 text-xs font-extrabold px-4.5 py-2.5 rounded-full border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-brand-gold/10 border-brand-gold text-brand-gold font-black shadow-sm' 
                    : 'bg-[#FAF7F0] border-[#1E1C18]/10 text-[#1E1C18]/65 hover:bg-[#1E1C18]/5'
                }`}
              >
                {item}
                {isSelected && <Check className="h-3.5 w-3.5 text-brand-gold" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: QUALITY TIER AND MATERIAL CLASS */}
      <div className="space-y-4 pt-4 border-t border-[#1E1C18]/5">
        <h3 className="text-xs font-black text-brand-gold uppercase tracking-wider">Quality Tier and Material Class</h3>
        <select
          value={qualityTier}
          onChange={(e) => setQualityTier(e.target.value)}
          className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all cursor-pointer"
        >
          {QUALITY_TIERS.map(tier => (
            <option key={tier.value} value={tier.value}>{tier.label}</option>
          ))}
        </select>
      </div>

      {/* SECTION 5: ROOMS AND SPACES */}
      <div className="space-y-4 pt-4 border-t border-[#1E1C18]/5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-brand-gold uppercase tracking-wider">Rooms and Spaces</h3>
          <button
            type="button"
            onClick={handleAddRoom}
            className="inline-flex items-center gap-1 bg-[#1E1C18] hover:bg-[#1E1C18]/85 text-white font-extrabold text-[10px] rounded-lg px-3 py-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add room
          </button>
        </div>

        <div className="border border-[#1E1C18]/10 rounded-2xl overflow-hidden bg-[#FAF7F0]/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#1E1C18]/10">
                <th className="px-4 py-3 font-black text-[#1E1C18]/65 uppercase tracking-wider">Room Name</th>
                <th className="px-4 py-3 font-black text-[#1E1C18]/65 uppercase tracking-wider">Room Type</th>
                <th className="px-4 py-3 font-black text-[#1E1C18]/65 uppercase tracking-wider text-center">Area (sqm)</th>
                <th className="px-4 py-3 font-black text-[#1E1C18]/65 uppercase tracking-wider">Quality Override</th>
                <th className="px-4 py-3 font-black text-[#1E1C18]/65 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} className="border-b border-[#1E1C18]/5 last:border-0 hover:bg-[#FAF7F0]/20 transition-all">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => handleUpdateRoom(room.id, "name", e.target.value)}
                      className="bg-white border border-[#1E1C18]/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-gold font-extrabold text-[#1E1C18] w-full"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={room.type}
                      onChange={(e) => handleUpdateRoom(room.id, "type", e.target.value)}
                      className="bg-white border border-[#1E1C18]/10 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer font-extrabold text-[#1E1C18] w-full"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        value={room.area}
                        onChange={(e) => handleUpdateRoom(room.id, "area", e.target.value)}
                        className="bg-white border border-[#1E1C18]/10 rounded-lg px-2 py-1.5 focus:outline-none text-center font-extrabold text-[#1E1C18] w-16"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={room.qualityOverride}
                      onChange={(e) => handleUpdateRoom(room.id, "qualityOverride", e.target.value)}
                      className="bg-white border border-[#1E1C18]/10 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer font-extrabold text-[#1E1C18] w-full"
                    >
                      <option value="default">Use default</option>
                      <option value="standard">Standard class</option>
                      <option value="premium">Premium class</option>
                      <option value="luxury">Luxury class</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(room.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center border border-transparent hover:border-rose-100"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Submit */}
      <div className="pt-6 border-t border-[#1E1C18]/10 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-white font-black text-sm rounded-xl px-6 py-4.5 transition-all cursor-pointer shadow-md group"
        >
          <span>Initialize manual layout</span>
          <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </form>
  );
}
