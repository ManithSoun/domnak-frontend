import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatUI from "@/components/ChatUI";
import { useAuth } from "../../../router/useAuth";
import {
  UploadCloud,
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  DollarSign,
  Maximize2,
  Building,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
  Layers,
  Download,
  Hammer,
  Scale,
  Lock,
  Shield,
  Send,
  HelpCircle,
  MessageSquare,
  LayoutDashboard,
  History,
  User,
  Clock,
  Settings,
  Share2,
  MapPin,
  Calendar,
  ChevronRight,
  UserCheck,
  Phone,
  Mail as MailIcon,
  Briefcase,
  Store,
  Calculator,
  LogOut
} from "lucide-react";

// Preset configurations for simulated AI extraction
const PRESETS = {
  villa: {
    projectName: "2-Story Premium Family Villa",
    contractorName: "BuildCorp Cambodia Ltd",
    quotedPrice: 145000,
    qualityTier: "premium",
    rooms: [
      { id: "v1", name: "Grand Living Lounge", category: "living", floor: "Ground Floor", width: 6.0, length: 5.0, notes: "Double-height ceiling, polished marble tiles" },
      { id: "v2", name: "Open Kitchen & Dining", category: "kitchen", floor: "Ground Floor", width: 4.5, length: 5.0, notes: "Granite countertops, kitchen island structure" },
      { id: "v3", name: "Guest Bathroom", category: "bathroom", floor: "Ground Floor", width: 2.0, length: 2.5, notes: "Under-stairs restroom, standard plumbing" },
      { id: "v4", name: "Master Suite Sanctuary", category: "bedroom", floor: "1st Floor", width: 5.0, length: 4.5, notes: "Premium teak parquet flooring, en-suite bath" },
      { id: "v5", name: "Kids Bedroom", category: "bedroom", floor: "1st Floor", width: 4.0, length: 4.0, notes: "Standard laminate flooring, high windows" },
      { id: "v6", name: "Master Spa Bathroom", category: "bathroom", floor: "1st Floor", width: 3.0, length: 2.5, notes: "Soaking tub, dual ceramic vanities" },
      { id: "v7", name: "Panoramic Front Balcony", category: "balcony", floor: "1st Floor", width: 4.0, length: 1.5, notes: "Toughened glass railing, anti-slip tiling" }
    ]
  },
  condo: {
    projectName: "Modern 1-Bedroom Urban Condo",
    contractorName: "Urban Spaces Co.",
    quotedPrice: 48500,
    qualityTier: "standard",
    rooms: [
      { id: "c1", name: "Studio Living & Study Area", category: "living", floor: "Ground Floor", width: 5.0, length: 4.0, notes: "Open-concept layout, direct window view" },
      { id: "c2", name: "Compact Kitchenette", category: "kitchen", floor: "Ground Floor", width: 3.0, length: 2.5, notes: "L-shaped counter, standard finishes" },
      { id: "c3", name: "Cozy Double Bedroom", category: "bedroom", floor: "Ground Floor", width: 3.5, length: 3.5, notes: "Sliding glass door partition, built-in wardrobe space" },
      { id: "c4", name: "Walk-in Bathroom", category: "bathroom", floor: "Ground Floor", width: 2.0, length: 2.0, notes: "Standing shower glass stall, standard tiling" },
      { id: "c5", name: "Utility Balcony", category: "balcony", floor: "Ground Floor", width: 2.0, length: 1.0, notes: "Aircon compressor rack, washing machine inlet" }
    ]
  },
  penthouse: {
    projectName: "Luxury Skyline Penthouse Suite",
    contractorName: "Prestige Designs Ltd",
    quotedPrice: 320000,
    qualityTier: "luxury",
    rooms: [
      { id: "p1", name: "Grand Salon & Dining", category: "living", floor: "Ground Floor", width: 8.0, length: 6.0, notes: "Italian marble slabs, crystal chandelier wiring" },
      { id: "p2", name: "Chef's Gourmet Kitchen", category: "kitchen", floor: "Ground Floor", width: 5.0, length: 5.0, notes: "Imported German cabinet fittings, butler pantry" },
      { id: "p3", name: "Presidential Master Suite", category: "bedroom", floor: "Ground Floor", width: 6.0, length: 5.5, notes: "Solid oak flooring, integrated study niche" },
      { id: "p4", name: "En-Suite Master Spa", category: "bathroom", floor: "Ground Floor", width: 4.0, length: 3.5, notes: "Custom jacuzzi tub, smart control toilet" },
      { id: "p5", name: "VIP Guest Room", category: "bedroom", floor: "Ground Floor", width: 4.5, length: 4.0, notes: "Direct terrace access, walnut flooring" },
      { id: "p6", name: "Guest Bathroom", category: "bathroom", floor: "Ground Floor", width: 2.0, length: 3.0, notes: "Villeroy & Boch fixtures, premium tiles" },
      { id: "p7", name: "Outdoor Sky Terrace", category: "balcony", floor: "Ground Floor", width: 8.0, length: 2.0, notes: "Weatherproof teak wood deck, glass safety barrier" }
    ]
  }
};

const BASE_COSTS = {
  standard: 350, // USD per sqm
  premium: 480,  // USD per sqm
  luxury: 680    // USD per sqm
};

const CATEGORIES = [
  { value: "living", label: "Living / Lounge", color: "bg-emerald-50 text-emerald-700 border-emerald-200 block-color:bg-emerald-500/20 block-border:border-emerald-500" },
  { value: "bedroom", label: "Bedroom", color: "bg-indigo-50 text-indigo-700 border-indigo-200 block-color:bg-indigo-500/20 block-border:border-indigo-500" },
  { value: "kitchen", label: "Kitchen / Dining", color: "bg-amber-50 text-amber-700 border-amber-200 block-color:bg-amber-500/20 block-border:border-amber-500" },
  { value: "bathroom", label: "Bathroom", color: "bg-teal-50 text-teal-700 border-teal-200 block-color:bg-teal-500/20 block-border:border-teal-500" },
  { value: "balcony", label: "Balcony / Terrace", color: "bg-cyan-50 text-cyan-700 border-cyan-200 block-color:bg-cyan-500/20 block-border:border-cyan-500" },
  { value: "utility", label: "Utility / Other", color: "bg-slate-50 text-slate-700 border-slate-200 block-color:bg-slate-500/20 block-border:border-slate-500" }
];

const FLOORS = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"];

export default function HomeownersPage() {
  const { user, logout } = useAuth();

  // Sidebar Tab State
  const [sidebarTab, setSidebarTab] = useState("home"); // "home" | "quotes" | "history" | "suppliers" | "chat"

  // Stored Audit History & Profile details
  const [auditHistory, setAuditHistory] = useState([]);
  const [profileLocation, setProfileLocation] = useState("Phnom Penh, Cambodia");
  const [profileBudget, setProfileBudget] = useState(150000);
  const [profileStartDate, setProfileStartDate] = useState("Q3 2026");
  const [profilePropertyType, setProfilePropertyType] = useState("villa"); // "villa" | "condo" | "townhouse"
  const [selectedSavedAuditId, setSelectedSavedAuditId] = useState(null);

  // Architect Chat History
  const [architectChat, setArchitectChat] = useState([
    { sender: "architect", text: "Hello! I reviewed your latest budget audit for the villa. We might want to optimize the master bathroom fixtures to stay under the $150k target.", time: "10:30 AM" },
    { sender: "user", text: "Hi! Yes, I agree. Can we look at standard grade tiles for the kids bedroom as well?", time: "10:45 AM" },
    { sender: "architect", text: "Absolutely, that can trim about $2,500. I have updated the shared 3D plans to reflect standard layout configurations.", time: "11:00 AM" }
  ]);
  const [architectInput, setArchitectInput] = useState("");

  // Core Navigation State
  const [activePreset, setActivePreset] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("spreadsheet"); // "spreadsheet" | "boq" | "chat"
  
  // Selection / Manual Input States
  const [uploadMethod, setUploadMethod] = useState(null); // null | "pdf" | "manual"
  const [manualProjectName, setManualProjectName] = useState("");
  const [manualContractorName, setManualContractorName] = useState("");
  const [manualQuotedPrice, setManualQuotedPrice] = useState("");
  const [manualQualityTier, setManualQualityTier] = useState("premium");
  
  // Project State
  const [projectName, setProjectName] = useState("");
  const [contractorName, setContractorName] = useState("");
  const [quotedPrice, setQuotedPrice] = useState(0);
  const [qualityTier, setQualityTier] = useState("premium");
  const [rooms, setRooms] = useState([]);
  
  // UI Interaction States
  const [hoveredRoomId, setHoveredRoomId] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("Ground Floor");
  const [customNotification, setCustomNotification] = useState(null);

  // BoQ Item Explanation Accordion State
  const [expandedBoqItem, setExpandedBoqItem] = useState(null);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Initialize localStorage data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHistory = localStorage.getItem("domnak_audit_history");
      if (storedHistory) {
        try {
          setAuditHistory(JSON.parse(storedHistory));
        } catch (e) {
          console.error("Failed to parse stored audit history", e);
        }
      }
      
      const storedLocation = localStorage.getItem("domnak_profile_location");
      const storedBudget = localStorage.getItem("domnak_profile_budget");
      const storedStartDate = localStorage.getItem("domnak_profile_start_date");
      const storedPropType = localStorage.getItem("domnak_profile_property_type");
      
      if (storedLocation) setProfileLocation(storedLocation);
      if (storedBudget) setProfileBudget(parseInt(storedBudget) || 150000);
      if (storedStartDate) setProfileStartDate(storedStartDate);
      if (storedPropType) setProfilePropertyType(storedPropType);
    }
  }, []);

  // Save/Update Audit to History list
  const saveAuditToHistory = (auditToSave) => {
    setAuditHistory((prevHistory) => {
      const isExisting = prevHistory.some((item) => item.id === auditToSave.id);
      let newHistory;
      if (isExisting) {
        newHistory = prevHistory.map((item) => (item.id === auditToSave.id ? auditToSave : item));
      } else {
        newHistory = [auditToSave, ...prevHistory];
      }
      localStorage.setItem("domnak_audit_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const deleteSavedAudit = (id) => {
    const newHistory = auditHistory.filter((item) => item.id !== id);
    setAuditHistory(newHistory);
    localStorage.setItem("domnak_audit_history", JSON.stringify(newHistory));
    if (selectedSavedAuditId === id) {
      setSelectedSavedAuditId(null);
      setShowResults(false);
      setUploadMethod(null);
      setProjectName("");
      setContractorName("");
      setQuotedPrice(0);
      setRooms([]);
    }
    showToast("Audit successfully deleted.");
  };

  const loadSavedAudit = (audit) => {
    setProjectName(audit.projectName);
    setContractorName(audit.contractorName);
    setQuotedPrice(audit.quotedPrice);
    setQualityTier(audit.qualityTier);
    setRooms(JSON.parse(JSON.stringify(audit.rooms)));
    setSelectedSavedAuditId(audit.id);
    
    const floorsInPreset = [...new Set(audit.rooms.map(r => r.floor))];
    if (floorsInPreset.length > 0) {
      setSelectedFloor(floorsInPreset[0]);
    }
    
    setShowResults(true);
    setIsAnalyzing(false);
    setDashboardTab("auditor");
    setActiveTab("spreadsheet");
    showToast(`Loaded Audit: ${audit.projectName}`);
  };

  const saveProfile = (location, budget, startDate) => {
    localStorage.setItem("domnak_profile_location", location);
    localStorage.setItem("domnak_profile_budget", budget.toString());
    localStorage.setItem("domnak_profile_start_date", startDate);
    setProfileLocation(location);
    setProfileBudget(budget);
    setProfileStartDate(startDate);
    showToast("Profile Settings Saved!");
    setDashboardTab("overview");
  };

  const handleArchitectChatSubmit = (e) => {
    e.preventDefault();
    if (!architectInput.trim()) return;

    const userMsg = { 
      sender: "user", 
      text: architectInput, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setArchitectChat(prev => [...prev, userMsg]);
    setArchitectInput("");

    // Simulated architect response
    setTimeout(() => {
      let replyText = "Understood. I am cross-referencing your request with the local BoQ building standards in Phnom Penh. Let me make those adjustments and get back to you with updated layouts.";
      const text = architectInput.toLowerCase();
      
      if (text.includes("budget") || text.includes("cost") || text.includes("price") || text.includes("save")) {
        replyText = "To keep the project budget aligned, we can look at optimizing the structural masonry brick count or transitioning the guest bedroom tile specifications to standard tier finishes.";
      } else if (text.includes("dimensions") || text.includes("size") || text.includes("room") || text.includes("floor")) {
        replyText = "Let me adjust the grid partition coordinates for those rooms. Conforming them to a tighter grid structure will reduce concrete formwork and steel costs.";
      }
      
      const archMsg = { 
        sender: "architect", 
        text: replyText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setArchitectChat(prev => [...prev, archMsg]);
    }, 1500);
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    startAnalysis("villa");
  };

  const startAnalysis = (presetKey) => {
    setActivePreset(presetKey);
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setShowResults(false);
    setSidebarTab("quotes");  // navigate to Quotes tab during analysis
  };

  const handleCreateManualQuote = () => {
    // Determine preset key based on tier
    let presetKey = "condo";
    if (manualQualityTier === "premium") presetKey = "villa";
    if (manualQualityTier === "luxury") presetKey = "penthouse";

    const data = PRESETS[presetKey];
    const initializedRooms = JSON.parse(JSON.stringify(data.rooms));

    // Initialize layout states
    setProjectName(manualProjectName);
    setContractorName(manualContractorName);
    setQuotedPrice(parseFloat(manualQuotedPrice) || 0);
    setQualityTier(manualQualityTier);
    setRooms(initializedRooms);
    setActivePreset(presetKey);

    // Set active floor based on available floors
    const floorsInPreset = [...new Set(initializedRooms.map(r => r.floor))];
    if (floorsInPreset.length > 0) {
      setSelectedFloor(floorsInPreset[0]);
    }

    setIsAnalyzing(false);
    setShowResults(true);
    setActiveTab("spreadsheet");
    showToast("Manual Quote Created!");

    // Auto-save to localStorage history
    const auditId = `audit_${Date.now()}`;
    setSelectedSavedAuditId(auditId);
    const newAudit = {
      id: auditId,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      projectName: manualProjectName,
      contractorName: manualContractorName,
      quotedPrice: parseFloat(manualQuotedPrice) || 0,
      qualityTier: manualQualityTier,
      rooms: initializedRooms
    };

    const updatedHistory = [newAudit, ...auditHistory];
    setAuditHistory(updatedHistory);
    localStorage.setItem("domnak_audit_history", JSON.stringify(updatedHistory));

    // Clear form inputs
    setManualProjectName("");
    setManualContractorName("");
    setManualQuotedPrice("");
    setManualQualityTier("premium");
  };

  // Simulated AI Scanner Step Sequencer
  useEffect(() => {
    if (!isAnalyzing) return;

    const steps = [
      "Analyzing PDF document structures and optical character text...",
      "Extracting contractor details and quote metadata...",
      "Parsing room dimension schedules and structural descriptions...",
      "Mapping local BoQ construction material pricing index...",
      "Constructing 2D spatial layout coordinates..."
    ];

    const timer = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          // Load preset data
          const data = PRESETS[activePreset];
          setProjectName(data.projectName);
          setContractorName(data.contractorName);
          setQuotedPrice(data.quotedPrice);
          setQualityTier(data.qualityTier);
          setRooms(JSON.parse(JSON.stringify(data.rooms))); // deep copy
          
          // Set active floor based on available floors in the preset
          const floorsInPreset = [...new Set(data.rooms.map(r => r.floor))];
          if (floorsInPreset.length > 0) {
            setSelectedFloor(floorsInPreset[0]);
          }

          setIsAnalyzing(false);
          setShowResults(true);
          setActiveTab("spreadsheet");
          showToast("AI Quote Analysis Complete!");
          
          // Auto-save this new audit to localStorage history list
          const auditId = `audit_${Date.now()}`;
          setSelectedSavedAuditId(auditId);
          const newAudit = {
            id: auditId,
            date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            projectName: data.projectName,
            contractorName: data.contractorName,
            quotedPrice: data.quotedPrice,
            qualityTier: data.qualityTier,
            rooms: JSON.parse(JSON.stringify(data.rooms))
          };
          setTimeout(() => {
            saveAuditToHistory(newAudit);
          }, 100);

          // Initialize Chat Greetings
          setChatMessages([
            {
              sender: "ai",
              text: `Hello! I am your DomNak AI Project Consultant. I have audited the proposal from **${data.contractorName}** for the **${data.projectName}**. The quoted total is **$${data.quotedPrice.toLocaleString()}**.\n\nI can help identify red flags, cross-reference regional averages, or outline cost-saving items. What would you like to explore?`
            }
          ]);

          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnalyzing, activePreset]);

  // Scroll Chat to Bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatTyping]);

  // Toast notification system
  const showToast = (msg) => {
    setCustomNotification(msg);
    setTimeout(() => setCustomNotification(null), 4000);
  };

  // Room updates
  const updateRoomField = (roomId, field, value) => {
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room.id === roomId) {
          let parsedValue = value;
          if (field === "width" || field === "length") {
            parsedValue = parseFloat(value) || 0;
          }
          return { ...room, [field]: parsedValue };
        }
        return room;
      })
    );
  };

  const deleteRoom = (roomId) => {
    setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
    showToast("Room removed from floor plan");
  };

  const addRoom = () => {
    const newRoomId = `custom_${Date.now()}`;
    const newRoom = {
      id: newRoomId,
      name: "New Room Space",
      category: "bedroom",
      floor: selectedFloor,
      width: 4.0,
      length: 4.0,
      notes: "Standard specification"
    };
    setRooms(prevRooms => [...prevRooms, newRoom]);
    showToast("Added new room slot to " + selectedFloor);
  };

  const resetToPresetDefaults = () => {
    if (!activePreset) return;
    const data = PRESETS[activePreset];
    setRooms(JSON.parse(JSON.stringify(data.rooms)));
    setQualityTier(data.qualityTier);
    setQuotedPrice(data.quotedPrice);
    showToast("Reset to AI-generated defaults");
  };

  // Dynamic calculations
  const totalArea = rooms.reduce((acc, room) => acc + (room.width * room.length), 0);
  const baselineCost = totalArea * BASE_COSTS[qualityTier];
  const contractorMarkupAllowance = 1.15; // 15% allowance for general site setup, engineering, permits
  const fairMarketEstimate = baselineCost * contractorMarkupAllowance;
  const priceDifference = quotedPrice - fairMarketEstimate;
  const markupPercentage = fairMarketEstimate > 0 ? (priceDifference / fairMarketEstimate) * 100 : 0;

  // BoQ Itemized Material list construction
  const getBoqItems = () => {
    return [
      {
        id: "cement",
        name: "Portland Cement (Structure & Masonry)",
        quantity: `${Math.round(totalArea * 5.4)} bags`,
        unitPrice: 6.50,
        total: Math.round(totalArea * 5.4) * 6.50,
        explanation: `Why ${Math.round(totalArea * 5.4)} bags of cement? Your structural layout has a footprint area of ${totalArea.toFixed(1)}m². Assuming standard load-bearing structural guidelines in Cambodia, a 15cm thickness solid concrete foundation slab requires roughly ${(totalArea * 0.15).toFixed(1)}m³ of concrete. Mixing structural class 25MPa concrete uses approximately 350kg (7 bags) of cement per cubic meter. Adding columns, beams, and plastering brick walls, the AI estimates a baseline of 5.4 bags per square meter to ensure code compliance.`
      },
      {
        id: "steel",
        name: "Reinforcement Steel Rebars (SD40 / SD30)",
        quantity: `${(totalArea * 8.5 / 1000).toFixed(2)} tons`,
        unitPrice: 780.00,
        total: (totalArea * 8.5 / 1000) * 780.00,
        explanation: `Why ${(totalArea * 8.5 / 1000).toFixed(2)} tons of steel rebars? Standard RCC (Reinforced Cement Concrete) structures depend on steel grid cores to absorb tensile stress. The AI assumes a structural design ratio of 8.5kg of steel rebars per square meter of built-up slab area. This covers concrete mesh lines, beam stirrups, and foundational footings. For your ${totalArea.toFixed(1)}m² layout, this evaluates to roughly ${Math.round(totalArea * 8.5)}kg of steel.`
      },
      {
        id: "bricks",
        name: "Solid & Hollow Clay Bricks",
        quantity: `${Math.round(totalArea * 75).toLocaleString()} pieces`,
        unitPrice: 0.08,
        total: Math.round(totalArea * 75) * 0.08,
        explanation: `Why ${Math.round(totalArea * 75).toLocaleString()} bricks? A brick count is modeled from the internal partitioning wall layout of your ${rooms.length} room spaces. In general masonry standards, layups consume ~75 clay bricks per square meter of wall partition surface area. Expanding for room perimeter heights (standard 3.1m ceiling heights) and factoring in window/door openings, the average floor area scale benchmarks to roughly 75 bricks per horizontal m² of floor plan.`
      },
      {
        id: "labor",
        name: "Masonry, Carpentry, & Structural Labor",
        quantity: `${Math.round(totalArea * 0.4)} man-days`,
        unitPrice: 22.00,
        total: Math.round(totalArea * 0.4) * 22.00,
        explanation: `Why ${Math.round(totalArea * 0.4)} man-days? A layout of ${totalArea.toFixed(1)}m² demands roughly 0.4 man-days of technical skilled labor per square meter for structural frame casting and block layering. This estimates ${Math.round(totalArea * 0.4)} full worker days (e.g., a crew of 8 bricklayers working for ~${Math.round((totalArea * 0.4)/8)} days). Finishes, painting, plumbing, and electrical installations will incur separate finish contractor labor fees.`
      },
      {
        id: "electrical",
        name: "Electrical Wiring Nodes & Conduit Pipes",
        quantity: `${Math.round(totalArea * 0.75)} points`,
        unitPrice: 18.50,
        total: Math.round(totalArea * 0.75) * 18.50,
        explanation: `Why ${Math.round(totalArea * 0.75)} electrical points? The AI allocates 0.75 wiring nodes (comprising lighting fixtures, power sockets, AC power isolators, and switches) per square meter. In your ${totalArea.toFixed(1)}m² spatial floor plan, this maps to ${Math.round(totalArea * 0.75)} electrical outlet/fixture nodes, which matches standard residential safety spacing specifications.`
      },
      {
        id: "paint",
        name: "Finishes, Paint & Skim Coat Materials",
        quantity: `${Math.round(totalArea * 2.8)} m² surface`,
        unitPrice: 9.00,
        total: Math.round(totalArea * 2.8) * 9.00,
        explanation: `Why ${Math.round(totalArea * 2.8)}m² of surface painting? A building's paintable wall area is roughly 2.8 times the floor footprint area (after accounting for ceiling heights and inner/outer wall faces). For your layout, this equates to ~${Math.round(totalArea * 2.8)}m² of primer coat, double finish coat, and base skim plastering material.`
      }
    ];
  };

  // Audit evaluation states
  let auditStatus = "success"; // success | warning | danger
  let auditTitle = "Excellent Value";
  let auditColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
  let auditProgressColor = "bg-emerald-500";
  let auditMessage = "The contractor's quote is highly competitive and aligns closely with local average rates.";

  if (markupPercentage > 25) {
    auditStatus = "danger";
    auditTitle = "High Pricing Detected";
    auditColor = "text-rose-600 bg-rose-50 border-rose-200";
    auditProgressColor = "bg-rose-500";
    auditMessage = `Pricing is significantly above market benchmarks (+${markupPercentage.toFixed(1)}%). Consider auditing room dimensions, requesting itemized material invoices, or negotiating rates.`;
  } else if (markupPercentage > 8) {
    auditStatus = "warning";
    auditTitle = "Fair Value / Moderate Markup";
    auditColor = "text-amber-600 bg-amber-50 border-amber-200";
    auditProgressColor = "bg-amber-500";
    auditMessage = `Quote includes a moderate contractor premium (+${markupPercentage.toFixed(1)}%). Review note highlights to verify premium finishes justify the difference.`;
  }

  // Get matching category style helper
  const getCategoryTheme = (catValue) => {
    return CATEGORIES.find(c => c.value === catValue) || CATEGORIES[5];
  };

  // Chat agent response compilation
  const handleChatSubmit = (userQuery) => {
    if (!userQuery.trim()) return;

    // Append user message
    const newMessages = [...chatMessages, { sender: "user", text: userQuery }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatTyping(true);

    // Simulate AI response based on query keywords
    setTimeout(() => {
      let aiText = "";
      const q = userQuery.toLowerCase();

      if (q.includes("red flag") || q.includes("fair") || q.includes("markup")) {
        aiText = `Based on my current BoQ audit for your **${projectName}** proposal:\n\n` +
                 `1. 🚩 **Markup Assessment**: The contractor's quote of **$${quotedPrice.toLocaleString()}** represents a **${markupPercentage.toFixed(1)}%** premium over our calculated benchmark of **$${fairMarketEstimate.toLocaleString(undefined, {maximumFractionDigits: 0})}** (Fair Market Estimate).\n\n` +
                 `2. ⚠️ **Unspecified Line-items**: The quote is presented as a lump sum without itemized material specifications. Check if they specify the brand of cement (e.g. Camel or Siam Cement) and the steel grade (SD40 vs SD30).\n\n` +
                 `3. 📏 **Dimension Check**: The current layout totals **${totalArea.toFixed(1)}m²**. If the contractor's contract claims the built-up area is larger, request they double-check the survey grid.`;
      } else if (q.includes("phnom penh") || q.includes("average") || q.includes("compare") || q.includes("similar")) {
        const avgPerSqm = quotedPrice / totalArea;
        aiText = `Here is how this quote compares to average residential builds in Phnom Penh for 2026:\n\n` +
                 `• **Your Quote**: **$${avgPerSqm.toFixed(0)} / m²** (Total Area: ${totalArea.toFixed(1)}m²)\n` +
                 `• **Market Standard Range**: $320 - $380 / m²\n` +
                 `• **Market Premium Range**: $450 - $520 / m²\n` +
                 `• **Market Luxury Range**: $620 - $750 / m²\n\n` +
                 `Since you selected **${qualityTier}** tier finishes, the contractor's rate of **$${avgPerSqm.toFixed(0)}/m²** is **${priceDifference > 0 ? "slightly above average, likely due to contractor overhead and permit filing fees." : "highly competitive and below market baseline averages."}**`;
      } else if (q.includes("lower") || q.includes("save") || q.includes("reduce") || q.includes("15%")) {
        const potentialSavings = totalArea * (BASE_COSTS[qualityTier] - BASE_COSTS.standard);
        aiText = `Here are three concrete recommendations to reduce construction costs for **${projectName}**:\n\n` +
                 `1. 🛠️ **Optimize Finishes**: Transitioning non-essential rooms (e.g. kids bedrooms or utility storage) from **${qualityTier}** to Standard finishes can save up to **$${(potentialSavings * 0.4).toLocaleString(undefined, {maximumFractionDigits: 0})}** in tiling and woodwork.\n\n` +
                 `2. 📐 **Consolidate Spatial Plan**: Conforming your room layouts to a square grid reduces foundation perimeter forms and brick count. Conforming the current **${totalArea.toFixed(1)}m²** plan to a tighter core can trim 10% in framing labor.\n\n` +
                 `3. 🛒 **Direct Material Sourcing**: Negotiate a 'labor-only' masonry contract, and purchase your own cement bags and steel rebars directly from local distributors at wholesale rates.`;
      } else if (q.includes("cement")) {
        aiText = `Why **${Math.round(totalArea * 5.4)} bags** of cement? Let's check the math:\n\n` +
                 `• Floor area footprint: **${totalArea.toFixed(1)}m²**\n` +
                 `• Concrete slab thickness: **15cm** (${(totalArea * 0.15).toFixed(1)}m³ total concrete volume)\n` +
                 `• Cement mix ratio: **350kg/m³** (7 standard 50kg bags of Portland cement per m³)\n` +
                 `• Slab requirement: **${Math.round(totalArea * 0.15 * 7)} bags**\n\n` +
                 `The remaining **${Math.round(totalArea * 5.4 - totalArea * 0.15 * 7)} bags** are allocated for columns, structural support beams, brick wall mortar beds, and plaster coatings.`;
      } else {
        aiText = `I have updated my records for the **${projectName}** (${totalArea.toFixed(1)}m²). Your current selected quality tier is **${qualityTier}** which places local average baseline cost around **$${fairMarketEstimate.toLocaleString(undefined, {maximumFractionDigits: 0})}**.\n\nCould you clarify if you want me to analyze the steel rebars quantity, check regional averages, or outline structural red flags?`;
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: aiText }]);
      setIsChatTyping(false);
    }, 1200);
  };

  return (
    <>
      <Head>
        <title>Homeowner Hub | DomNak - Quote Pricing Audit &amp; Floor Plan Scanner</title>
        <meta name="description" content="Upload and audit contractor invoices. Edit room structures and visualize the 2D layout in real-time with DomNak's proprietary AI analyzer." />
      </Head>

      {/* ── Full-viewport sidebar layout ─────────────────────────────── */}
      <div className="flex h-screen overflow-hidden bg-[#F5F2EB]">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="w-[230px] flex-shrink-0 bg-[#1E1C18] flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 pt-7 pb-4 flex items-center gap-2">
            <Link 
              href="/" 
              className="p-1.5 text-white/55 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="inline-block">
              <img
                src="/assets/domnak-circle-logo.png"
                alt="DomNak Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-0.5">
            {[
              { id: "home",      label: "Home",      icon: LayoutDashboard },
              { id: "quotes",    label: "Quotes",    icon: FileText },
              { id: "history",    label: "History",    icon: History },
              { id: "suppliers", label: "Suppliers", icon: Store },
              { id: "chat",      label: "Chat",      icon: MessageSquare },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSidebarTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  sidebarTab === id
                    ? "bg-white/12 text-white"
                    : "text-white/55 hover:text-white hover:bg-white/6"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${
                  sidebarTab === id ? "text-brand-gold" : "text-white/50"
                }`} />
                {label}
              </button>
            ))}
          </nav>

          {/* User chip at bottom */}
          <div className="px-4 pb-6 pt-4 border-t border-white/8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-brand-gold flex items-center justify-center text-white text-xs font-black flex-shrink-0 select-none uppercase">
                {(user?.name || "H").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{user?.name || "Homeowner"}</p>
                <p className="text-[10px] text-white/40 font-semibold leading-tight">Homeowner Portal</p>
              </div>
            </div>

            {user ? (
              <button
                onClick={logout}
                className="p-2 text-white/45 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer shrink-0"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="text-[10px] font-extrabold text-brand-gold hover:text-brand-gold/80 transition-colors uppercase tracking-wider shrink-0"
              >
                Log In
              </Link>
            )}
          </div>
        </aside>

        {/* ── Scrollable content area ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-[#F5F2EB] relative">

          {/* Global Toast */}
          {customNotification && (
            <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-xl bg-[#1E1C18] px-5 py-4 text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
              <Sparkles className="h-4 w-4 text-brand-gold animate-pulse" />
              <span>{customNotification}</span>
            </div>
          )}

          {/* Page header bar */}
          <div className="flex items-center justify-between px-8 pt-8 pb-2">
            <div>
              <p className="text-sm text-[#1E1C18]/50 font-semibold">
                {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}
              </p>
              <h1 className="text-2xl font-black text-[#1E1C18] tracking-tight">{user?.name || "Homeowner"}</h1>
            </div>
            <div className="h-11 w-11 rounded-full bg-brand-gold flex items-center justify-center text-white font-black text-base shadow-md">
              {(user?.name || "H").charAt(0).toUpperCase()}
            </div>
          </div>

          {/* ── TAB CONTENT ────────────────────────────────────────────── */}
          <div className="px-8 pt-6 pb-12">

            {/* ──── HOME TAB ──────────────────────────────────────────── */}
            {sidebarTab === "home" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Card 1 — Dark CTA */}
                  <div className="bg-[#1E1C18] rounded-2xl p-7 flex flex-col justify-between min-h-[200px] relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/10 rounded-bl-full" />
                    <div className="space-y-1.5">
                      <p className="text-white/55 text-sm font-semibold">Have a contractor quote?</p>
                      <h2 className="text-white font-black text-xl leading-snug tracking-tight">Upload it for an AI audit</h2>
                    </div>
                    <button
                      id="btn-home-upload-quote"
                      onClick={() => setSidebarTab("quotes")}
                      className="self-start mt-4 inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-white font-black text-sm rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      Upload quote <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Card 2 — Cost estimator */}
                  <div className="bg-white rounded-2xl p-7 flex flex-col justify-between min-h-[200px] border border-black/5 shadow-sm">
                    <div>
                      <p className="text-[#1E1C18]/50 text-sm font-semibold">Cost estimator</p>
                      <p className="text-[#1E1C18] font-black text-3xl mt-1 tracking-tight">${profileBudget.toLocaleString()}</p>
                      <p className="text-[#1E1C18]/45 text-xs font-semibold mt-1">est. renovation budget</p>
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <div className="h-2 w-full bg-[#1E1C18]/8 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gold rounded-full" style={{ width: "60%" }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#1E1C18]/40 font-semibold">
                        <span>60% planned</span>
                        <button onClick={() => setSidebarTab("history")} className="text-brand-gold font-bold hover:underline cursor-pointer">Adjust →</button>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 — Latest quote audit */}
                  <div className="bg-white rounded-2xl p-7 border border-black/5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[#1E1C18]/50 text-sm font-semibold">Latest quote audit</p>
                      {auditHistory.length > 0 ? (
                        <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-extrabold rounded-full px-2.5 py-1 uppercase tracking-wide">Under review</span>
                      ) : (
                        <span className="bg-[#1E1C18]/5 text-[#1E1C18]/40 text-[10px] font-extrabold rounded-full px-2.5 py-1 uppercase tracking-wide">No audits yet</span>
                      )}
                    </div>
                    {auditHistory.length > 0 ? (
                      <>
                        <h3 className="font-black text-[#1E1C18] text-base leading-tight">
                          {auditHistory[0]?.contractorName} — {auditHistory[0]?.projectName}
                        </h3>
                        <p className="text-xs text-[#1E1C18]/55 font-semibold leading-relaxed">AI flagged 2 line items priced 18% above market rate</p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-black text-[#1E1C18]/40 text-base">Roofing contractor — Heng Bros</h3>
                        <p className="text-xs text-[#1E1C18]/40 font-semibold">AI flagged 2 line items priced 18% above market rate</p>
                      </>
                    )}
                    <button onClick={() => setSidebarTab("quotes")} className="text-xs text-brand-gold font-bold hover:underline cursor-pointer flex items-center gap-1 mt-1">
                      View audit <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Card 4 — Supplier directory */}
                  <div className="bg-white rounded-2xl p-7 border border-black/5 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-black text-[#1E1C18] text-base">Supplier directory</h3>
                      <p className="text-sm text-[#1E1C18]/50 font-semibold leading-relaxed">Browse verified suppliers near you</p>
                    </div>
                    <button
                      id="btn-home-browse-suppliers"
                      onClick={() => setSidebarTab("suppliers")}
                      className="self-start text-sm font-black text-brand-gold hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      Browse suppliers <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Milestones */}
                <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
                  <h3 className="text-sm font-black text-[#1E1C18] flex items-center gap-2 mb-4"><Clock className="h-4 w-4 text-brand-gold" />Project Milestones</h3>
                  <div className="relative pl-5 border-l border-[#1E1C18]/10 space-y-5 ml-2">
                    {[
                      { done: true,     label: "Budget & Quote Auditing",    desc: "Audit contractor rates using the AI BoQ tool. (Completed)" },
                      { done: "active", label: "Planning & Design Approval", desc: "Collaborating on 3D layouts with Angkor Architecture Studio. (In Progress)" },
                      { done: false,    label: "Foundation Core Laying",     desc: "Concrete slab pouring and SD40 steel rebars inspection. (Upcoming)" },
                      { done: false,    label: "Masonry & Block Construction",desc: "Standard red brick wall layering and structural column casting. (Upcoming)" },
                    ].map((m, i) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-7 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                          m.done === true ? "bg-emerald-500 text-white" : m.done === "active" ? "bg-brand-gold text-white animate-pulse" : "bg-[#1E1C18]/10 text-[#1E1C18]/40"
                        }`}>{m.done === true ? "✓" : i + 1}</div>
                        <h4 className={`text-xs font-extrabold ${m.done === false ? "text-[#1E1C18]/40" : "text-[#1E1C18]"}`}>{m.label}</h4>
                        <p className={`text-[11px] mt-0.5 font-semibold ${m.done === false ? "text-[#1E1C18]/30" : "text-[#1E1C18]/55"}`}>{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ──── QUOTES TAB ────────────────────────────────────────── */}
            {sidebarTab === "quotes" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Stepper */}
                <div className="mb-8 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between relative px-2">
                    <div className="absolute left-6 right-6 top-5 h-[3px] bg-[#1E1C18]/10 rounded-full -z-10" />
                    <div className="absolute left-6 top-5 h-[3px] bg-brand-gold rounded-full transition-all duration-700 ease-in-out -z-10" style={{ width: isAnalyzing ? "50%" : showResults ? "100%" : "0%" }} />
                    {[{ n:1, label:"Upload Quote" },{ n:2, label:"AI Scanning" },{ n:3, label:"Review & Edit" }].map(({ n, label }) => {
                      const isActive = (n===1 && !isAnalyzing && !showResults)||(n===2 && isAnalyzing)||(n===3 && showResults);
                      const isDone = (n===1 && (isAnalyzing||showResults))||(n===2 && showResults);
                      return (
                        <div key={n} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${isActive ? "bg-brand-gold text-white shadow-lg shadow-brand-gold/30 ring-4 ring-brand-gold/20" : isDone ? "bg-brand-gold/20 text-brand-gold border-2 border-brand-gold/50" : "bg-white text-[#1E1C18] border-2 border-[#1E1C18]/10"}`}>{n}</div>
                          <span className={`text-xs font-extrabold mt-3 tracking-wide transition-colors duration-300 ${isActive ? "text-brand-gold" : "text-[#1E1C18]/50"}`}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!showResults && !isAnalyzing ? (
                  /* PHASE 1: Choice or Upload/Manual */
                  <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
                    {uploadMethod === null ? (
                      /* Method Selection Screen */
                      <div className="bg-white rounded-3xl border border-black/5 shadow-lg p-8 lg:p-10 relative overflow-hidden flex flex-col gap-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full -z-10" />
                        <div className="text-center max-w-md mx-auto">
                          <h2 className="text-2xl font-black text-[#1E1C18] tracking-tight mb-2">Quote Auditing Setup</h2>
                          <p className="text-xs text-[#1E1C18]/50 leading-relaxed">
                            Choose how you would like to input your contractor's quote. We will run comparison metrics against regional Cambodian indexes.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          {/* Option 1: PDF Upload */}
                          <button
                            onClick={() => setUploadMethod("pdf")}
                            className="flex flex-col items-center justify-between p-6 rounded-2xl border-2 border-[#1E1C18]/5 hover:border-brand-gold/50 bg-[#FAF7F0]/40 hover:bg-[#FAF7F0] text-center cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-md"
                          >
                            <div className="h-12 w-12 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold group-hover:scale-105 group-hover:bg-brand-gold group-hover:text-white transition-all duration-300 mb-4 shadow-inner">
                              <UploadCloud className="h-6 w-6" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <span className="text-sm font-black text-[#1E1C18] block tracking-tight group-hover:text-brand-gold transition-colors">Upload PDF Quote</span>
                              <span className="text-[11px] text-[#1E1C18]/50 block mt-2 font-medium leading-relaxed">
                                Upload your constructor quote PDF to let our AI scan and analyze rates automatically.
                              </span>
                            </div>
                            <span className="text-[9px] font-black tracking-wider uppercase text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-full px-2.5 py-1 mt-4">
                              We only accept PDF
                            </span>
                          </button>

                          {/* Option 2: Manual Input */}
                          <button
                            onClick={() => setUploadMethod("manual")}
                            className="flex flex-col items-center justify-between p-6 rounded-2xl border-2 border-[#1E1C18]/5 hover:border-brand-gold/50 bg-[#FAF7F0]/40 hover:bg-[#FAF7F0] text-center cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-md"
                          >
                            <div className="h-12 w-12 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold group-hover:scale-105 group-hover:bg-brand-gold group-hover:text-white transition-all duration-300 mb-4 shadow-inner">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <span className="text-sm font-black text-[#1E1C18] block tracking-tight group-hover:text-brand-gold transition-colors">Manually Input Quote</span>
                              <span className="text-[11px] text-[#1E1C18]/50 block mt-2 font-medium leading-relaxed">
                                Manually type in the project name, contractor information, and custom pricing parameters.
                              </span>
                            </div>
                            <span className="text-[9px] font-black tracking-wider uppercase text-[#1E1C18]/45 bg-[#1E1C18]/5 border border-[#1E1C18]/10 rounded-full px-2.5 py-1 mt-4">
                              Line-by-Line setup
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : uploadMethod === "pdf" ? (
                      /* PHASE 1: Upload (PDF only) */
                      <div className="bg-white rounded-3xl border border-black/5 shadow-lg p-8 lg:p-10 relative overflow-hidden flex flex-col gap-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full -z-10" />
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setUploadMethod(null)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-black text-brand-gold hover:underline cursor-pointer uppercase tracking-wider"
                          >
                            ← Back to options
                          </button>
                          <span className="text-[10px] font-black text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-full px-2.5 py-1 uppercase tracking-wider">
                            PDF Quote Upload
                          </span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-[#1E1C18] tracking-tight mb-2">Upload Contractor PDF</h2>
                          <p className="text-xs text-[#1E1C18]/50 leading-relaxed">
                            Select your contractor's quote document or BoQ statement. We only accept PDF format up to 15MB.
                          </p>
                        </div>
                        <form onSubmit={handleFileUpload} className="space-y-6">
                          <label id="dropzone-label" className="flex flex-col items-center justify-center border-2 border-dashed border-brand-gold/30 hover:border-brand-gold bg-[#FAF7F0]/60 hover:bg-[#FAF7F0] rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 group shadow-inner">
                            <div className="h-16 w-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold group-hover:scale-105 group-hover:bg-brand-gold group-hover:text-white transition-all duration-300 mb-4 shadow-sm">
                              <UploadCloud className="h-8 w-8" />
                            </div>
                            <span className="text-sm font-black text-[#1E1C18] block tracking-tight group-hover:text-brand-gold transition-colors">
                              Drag &amp; drop your quote PDF here
                            </span>
                            <span className="text-xs text-[#1E1C18]/45 block mt-1">or click to browse local files</span>
                            <div className="flex gap-2 mt-4">
                              <span className="text-[10px] font-extrabold px-4 py-1.5 rounded-full bg-brand-gold text-white shadow-md border border-brand-gold/20">
                                PDF ONLY
                              </span>
                            </div>
                            <input
                              id="quote-file-input"
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={() => startAnalysis("villa")}
                            />
                          </label>
                          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-extrabold text-[#1E1C18]/40 py-2 border-y border-[#1E1C18]/5">
                            <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-brand-gold" /> SSL SECURE ENCRYPTION</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1E1C18]/20" />
                            <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-brand-gold" /> 100% PRIVATE DATA</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1E1C18]/20" />
                            <span>MAX 15 MB LIMIT</span>
                          </div>
                        </form>
                        <div>
                          <h4 className="text-xs font-black text-[#1E1C18] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />Focus Instructions for AI (Optional)
                          </h4>
                          <textarea
                            placeholder="e.g. 'Flag items above Phnom Penh 2025 index' or 'Separate balcony from bedroom costs'..."
                            rows={2}
                            className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 text-[#1E1C18] placeholder:text-[#1E1C18]/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner"
                          />
                        </div>
                        <button
                          onClick={() => startAnalysis("villa")}
                          className="w-full bg-brand-gold hover:bg-brand-gold-dark text-white rounded-xl py-3.5 px-6 font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-gold/20 transition-all cursor-pointer group"
                        >
                          <span>Scan &amp; audit quote</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    ) : (
                      /* PHASE 1: Manual Input Form */
                      <div className="bg-white rounded-3xl border border-black/5 shadow-lg p-8 lg:p-10 relative overflow-hidden flex flex-col gap-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full -z-10" />
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setUploadMethod(null)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-black text-brand-gold hover:underline cursor-pointer uppercase tracking-wider"
                          >
                            ← Back to options
                          </button>
                          <span className="text-[10px] font-black text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-full px-2.5 py-1 uppercase tracking-wider">
                            Manual Input
                          </span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-[#1E1C18] tracking-tight mb-2">Create Custom Quote</h2>
                          <p className="text-xs text-[#1E1C18]/50 leading-relaxed">
                            Fill in your contractor's quote details. We will initialize a dynamic spatial room model which you can customize line-by-line.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Project Name</label>
                            <input
                              type="text"
                              value={manualProjectName}
                              onChange={(e) => setManualProjectName(e.target.value)}
                              placeholder="e.g. 2-Story Modern Villa Restoration"
                              className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 text-[#1E1C18] placeholder:text-[#1E1C18]/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Contractor / Builder Name</label>
                              <input
                                type="text"
                                value={manualContractorName}
                                onChange={(e) => setManualContractorName(e.target.value)}
                                placeholder="e.g. BuildCorp Cambodia"
                                className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 text-[#1E1C18] placeholder:text-[#1E1C18]/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Quoted Amount (USD)</label>
                              <input
                                type="number"
                                value={manualQuotedPrice}
                                onChange={(e) => setManualQuotedPrice(e.target.value)}
                                placeholder="e.g. 145000"
                                className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 text-[#1E1C18] placeholder:text-[#1E1C18]/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Quality Tier & Material Class</label>
                            <select
                              value={manualQualityTier}
                              onChange={(e) => setManualQualityTier(e.target.value)}
                              className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all cursor-pointer font-bold"
                            >
                              <option value="premium">Premium Class (Teak wood, marble finish - est. $480/sqm)</option>
                              <option value="standard">Standard Class (Standard tiles, local brick - est. $350/sqm)</option>
                              <option value="luxury">Luxury Class (Smart controls, high imports - est. $680/sqm)</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={handleCreateManualQuote}
                          disabled={!manualProjectName || !manualContractorName || !manualQuotedPrice}
                          className={`w-full text-white rounded-xl py-3.5 px-6 font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer group ${
                            manualProjectName && manualContractorName && manualQuotedPrice
                              ? "bg-brand-gold hover:bg-brand-gold-dark hover:shadow-brand-gold/20"
                              : "bg-[#1E1C18]/25 cursor-not-allowed shadow-none"
                          }`}
                        >
                          <span>Initialize manual layout</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : isAnalyzing ? (
                  /* PHASE 2: Scanning */
                  <div className="mx-auto max-w-xl bg-white border border-[#1E1C18]/5 rounded-3xl shadow-xl p-8 lg:p-10 text-center my-8 animate-in zoom-in-95 duration-200">
                    <style dangerouslySetInnerHTML={{ __html: `@keyframes scan-anim{0%,100%{top:0%;opacity:0.3;}50%{top:100%;opacity:0.9;}}.scanner-line{animation:scan-anim 2.5s ease-in-out infinite;}` }} />
                    <div className="relative mx-auto w-36 h-48 bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl shadow-inner p-4 mb-8 overflow-hidden flex flex-col justify-between">
                      <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent shadow-[0_0_8px_#b38e42,0_0_15px_#b38e42] scanner-line z-10" />
                      <div className="space-y-2.5"><div className="flex justify-between items-center"><div className="h-2 w-12 bg-[#1E1C18]/20 rounded-full" /><div className="h-1.5 w-6 bg-brand-gold/30 rounded-full" /></div><div className="h-[1px] bg-[#1E1C18]/5" /><div className="space-y-1.5 pt-1"><div className="h-1.5 w-full bg-[#1E1C18]/10 rounded-full" /><div className="h-1.5 w-5/6 bg-[#1E1C18]/10 rounded-full" /><div className="h-1.5 w-4/6 bg-[#1E1C18]/10 rounded-full" /></div></div>
                      <div className="space-y-1.5"><div className="h-1.5 w-full bg-[#1E1C18]/10 rounded-full" /><div className="flex justify-between items-center pt-1"><div className="h-2.5 w-8 bg-brand-gold/45 rounded-md" /><div className="h-2 w-6 bg-[#1E1C18]/20 rounded-full" /></div></div>
                    </div>
                    <h3 className="text-xl font-black text-[#1E1C18] tracking-tight mb-2">Analyzing Contractor Proposal</h3>
                    <p className="text-xs text-[#1E1C18]/50 max-w-sm mx-auto mb-8">Our AI auditing system is parsing layout lines, cross-referencing material prices, and generating the 2D spatial model.</p>
                    <div className="text-left space-y-4 max-w-md mx-auto bg-[#FAF7F0] border border-[#1E1C18]/5 rounded-2xl p-6">
                      {["OCR: Reading PDF text and layout bounds","Parser: Extracting room schedules & metadata","Dimensions: Reconstructing floor dimensions","Material Spec: Auditing material classes & cost per sqm","Layout: Mapping coordinates for visual blueprint"].map((stepDesc,index) => {
                        const isDone = index < analysisStep; const isCurrent = index === analysisStep;
                        return (<div key={index} className="flex items-center gap-3 transition-all duration-300">{isDone?<div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0"><CheckCircle className="h-3.5 w-3.5" /></div>:isCurrent?<div className="h-5 w-5 rounded-full border-2 border-brand-gold/30 border-t-brand-gold animate-spin flex-shrink-0" />:<div className="h-5 w-5 rounded-full border border-[#1E1C18]/10 flex-shrink-0 bg-white" />}<span className={`text-xs font-bold transition-colors duration-300 ${isDone?"text-[#1E1C18]/40 line-through":isCurrent?"text-[#1E1C18] font-black":"text-[#1E1C18]/25"}`}>{stepDesc}</span></div>);
                      })}
                    </div>
                  </div>
                ) : (
                  /* PHASE 3: Results */
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#1E1C18]/5 rounded-3xl p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-gold rounded-l-3xl" />
                      <div className="flex items-center gap-3.5 pl-2">
                        <div className="h-11 w-11 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold shadow-inner"><FileText className="h-5 w-5" /></div>
                        <div><h3 className="font-black text-base text-[#1E1C18] tracking-tight">{projectName}</h3><p className="text-xs text-[#1E1C18]/50 font-semibold mt-0.5">Contractor: <strong className="text-[#1E1C18] font-extrabold">{contractorName}</strong></p></div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => { const a={id:selectedSavedAuditId||`audit_${Date.now()}`,date:new Date().toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}),projectName,contractorName,quotedPrice,qualityTier,rooms:JSON.parse(JSON.stringify(rooms))}; saveAuditToHistory(a); showToast("Audit saved!"); }} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white transition-all cursor-pointer shadow-md"><CheckCircle className="h-3.5 w-3.5" />Save Audit</button>
                        <button onClick={resetToPresetDefaults} className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E1C18]/5 hover:bg-[#1E1C18]/10 px-4 py-2.5 text-xs font-extrabold text-[#1E1C18] transition-all cursor-pointer border border-[#1E1C18]/5 shadow-sm"><RotateCcw className="h-3.5 w-3.5" />Reset</button>
                        <button onClick={() => { setShowResults(false); setActivePreset(null); setSelectedSavedAuditId(null); setUploadMethod(null); }} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark px-4 py-2.5 text-xs font-extrabold text-white transition-all cursor-pointer shadow-md">New Audit</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 space-y-6">
                        <div className="flex gap-1.5 border-b border-[#1E1C18]/10 pb-px overflow-x-auto">
                          <button id="tab-btn-spreadsheet" onClick={() => setActiveTab("spreadsheet")} className={`pb-3.5 px-5 text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab==="spreadsheet"?"border-brand-gold text-brand-gold":"border-transparent text-[#1E1C18]/50 hover:text-[#1E1C18]"}`}><FileSpreadsheet className="h-4 w-4" />1. Room Cost Estimator</button>
                          <button id="tab-btn-boq" onClick={() => setActiveTab("boq")} className={`pb-3.5 px-5 text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab==="boq"?"border-brand-gold text-brand-gold":"border-transparent text-[#1E1C18]/50 hover:text-[#1E1C18]"}`}><Layers className="h-4 w-4" />2. Material BoQ Breakdown</button>
                          <button id="tab-btn-chat" onClick={() => setActiveTab("chat")} className={`pb-3.5 px-5 text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab==="chat"?"border-brand-gold text-brand-gold":"border-transparent text-[#1E1C18]/50 hover:text-[#1E1C18]"}`}><MessageSquare className="h-4 w-4" />3. Ask AI Agent</button>
                        </div>

                        {activeTab === "spreadsheet" && (
                          <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="bg-white border border-[#1E1C18]/5 rounded-3xl shadow-sm p-6 lg:p-8 space-y-6">
                              <div className="flex items-center justify-between border-b border-[#1E1C18]/5 pb-4"><h3 className="text-base font-black text-[#1E1C18] flex items-center gap-2"><Scale className="h-5 w-5 text-brand-gold" />Pricing Audit Parameters</h3><span className="text-[10px] font-extrabold text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-full px-3 py-1 uppercase tracking-wider">Interactive Estimator</span></div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div><label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Project Name</label><input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner" /></div>
                                <div><label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Contractor Name</label><input type="text" value={contractorName} onChange={(e) => setContractorName(e.target.value)} className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner" /></div>
                                <div><label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Quoted Price ($)</label><input type="number" value={quotedPrice} onChange={(e) => setQuotedPrice(parseInt(e.target.value)||0)} className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner" /></div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div><label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Materials &amp; Finish Quality</label><select value={qualityTier} onChange={(e) => setQualityTier(e.target.value)} className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all cursor-pointer"><option value="standard">Standard Level Finishes (~$350/m²)</option><option value="premium">Premium Level Finishes (~$480/m²)</option><option value="luxury">Luxury Level Finishes (~$680/m²)</option></select></div>
                                <div className={`rounded-2xl border p-4 flex flex-col justify-between shadow-sm transition-all duration-300 ${auditColor}`}><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-wider">AI Audit Assessment</span>{auditStatus==="danger"?<AlertTriangle className="h-4.5 w-4.5" />:<CheckCircle className="h-4.5 w-4.5" />}</div><div className="my-2"><h4 className="text-base font-black tracking-tight">{auditTitle}</h4><p className="text-xs opacity-85 leading-relaxed mt-1 font-medium">{auditMessage}</p></div><div className="w-full bg-black/5 rounded-full h-2 overflow-hidden shadow-inner"><div className={`h-full ${auditProgressColor} transition-all duration-500 rounded-full`} style={{ width: `${Math.min(100,Math.max(10,100-Math.abs(markupPercentage)))}%` }} /></div></div>
                              </div>
                            </div>

                            <div className="bg-white border border-[#1E1C18]/5 rounded-3xl shadow-sm overflow-hidden">
                              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E1C18]/5 px-6 py-5">
                                <div><h3 className="text-base font-black text-[#1E1C18] flex items-center gap-2"><Layers className="h-5 w-5 text-brand-gold" />Room Dimension Grid</h3><p className="text-xs text-[#1E1C18]/50">Adjust room sizes to compute structural cost estimates in real-time.</p></div>
                                <div className="flex bg-[#FAF7F0] border border-[#1E1C18]/5 p-1 rounded-xl shadow-inner">
                                  {Array.from(new Set(rooms.map(r => r.floor))).sort().map(floor => (<button key={floor} onClick={() => setSelectedFloor(floor)} className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${selectedFloor===floor?"bg-brand-gold text-white shadow-sm":"text-[#1E1C18]/65 hover:bg-[#1E1C18]/5"}`}>{floor}</button>))}
                                </div>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] border-collapse">
                                  <thead><tr className="bg-[#FAF7F0]/60 border-b border-[#1E1C18]/5 text-left"><th className="px-6 py-4 text-[10px] font-black text-[#1E1C18]/60 uppercase tracking-wider">Room Name / Specifications</th><th className="px-4 py-4 text-[10px] font-black text-[#1E1C18]/60 uppercase tracking-wider">Category</th><th className="px-4 py-4 text-[10px] font-black text-[#1E1C18]/60 uppercase tracking-wider">Floor</th><th className="px-4 py-4 text-[10px] font-black text-[#1E1C18]/60 uppercase tracking-wider text-center">Width (m)</th><th className="px-4 py-4 text-[10px] font-black text-[#1E1C18]/60 uppercase tracking-wider text-center">Length (m)</th><th className="px-4 py-4 text-[10px] font-black text-[#1E1C18]/60 uppercase tracking-wider text-center">Area</th><th className="px-6 py-4 text-[10px] font-black text-[#1E1C18]/60 tracking-wider text-right">Action</th></tr></thead>
                                  <tbody className="divide-y divide-[#1E1C18]/5">
                                    {rooms.filter(r => r.floor===selectedFloor).map((room) => {
                                      const catStyle = getCategoryTheme(room.category);
                                      return (<tr key={room.id} onMouseEnter={() => setHoveredRoomId(room.id)} onMouseLeave={() => setHoveredRoomId(null)} className={`transition-all duration-200 hover:bg-brand-gold/5 ${hoveredRoomId===room.id?"bg-brand-gold/5":""}`}>
                                        <td className="px-6 py-4"><div className="space-y-1"><input type="text" value={room.name} onChange={(e) => updateRoomField(room.id,"name",e.target.value)} className="w-full text-xs font-extrabold text-[#1E1C18] bg-transparent hover:bg-[#1E1C18]/5 focus:bg-[#FAF7F0] border border-transparent focus:border-brand-gold/30 rounded-lg px-2.5 py-1.5 focus:outline-none transition-all" /><input type="text" value={room.notes} onChange={(e) => updateRoomField(room.id,"notes",e.target.value)} placeholder="Add spec notes" className="w-full text-[10px] text-[#1E1C18]/45 bg-transparent hover:bg-[#1E1C18]/5 focus:bg-[#FAF7F0] border border-transparent focus:border-brand-gold/30 rounded-lg px-2.5 py-1 focus:outline-none transition-all font-medium" /></div></td>
                                        <td className="px-4 py-4"><select value={room.category} onChange={(e) => updateRoomField(room.id,"category",e.target.value)} className={`text-[10px] font-extrabold border rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-sm ${catStyle.color}`}>{CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}</select></td>
                                        <td className="px-4 py-4"><select value={room.floor} onChange={(e) => updateRoomField(room.id,"floor",e.target.value)} className="text-xs font-extrabold text-[#1E1C18] bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-inner">{FLOORS.map(f => <option key={f} value={f}>{f}</option>)}</select></td>
                                        <td className="px-4 py-4"><div className="flex items-center justify-center gap-1.5"><input type="number" step="0.1" min="0.5" max="15.0" value={room.width} onChange={(e) => updateRoomField(room.id,"width",e.target.value)} className="w-16 text-center text-xs font-black text-[#1E1C18] bg-[#1E1C18]/5 focus:bg-white border border-[#1E1C18]/10 focus:border-brand-gold rounded-xl py-2 focus:outline-none transition-all shadow-inner" /><span className="text-[10px] font-black text-[#1E1C18]/40">m</span></div></td>
                                        <td className="px-4 py-4"><div className="flex items-center justify-center gap-1.5"><input type="number" step="0.1" min="0.5" max="15.0" value={room.length} onChange={(e) => updateRoomField(room.id,"length",e.target.value)} className="w-16 text-center text-xs font-black text-[#1E1C18] bg-[#1E1C18]/5 focus:bg-white border border-[#1E1C18]/10 focus:border-brand-gold rounded-xl py-2 focus:outline-none transition-all shadow-inner" /><span className="text-[10px] font-black text-[#1E1C18]/40">m</span></div></td>
                                        <td className="px-4 py-4 text-center"><span className="text-xs font-black text-[#1E1C18] bg-[#1E1C18]/5 border border-[#1E1C18]/5 rounded-lg px-2.5 py-1">{(room.width*room.length).toFixed(1)} m²</span></td>
                                        <td className="px-6 py-4 text-right"><button onClick={() => deleteRoom(room.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center border border-transparent hover:border-rose-100"><Trash2 className="h-4 w-4" /></button></td>
                                      </tr>);
                                    })}
                                    {rooms.filter(r => r.floor===selectedFloor).length===0&&(<tr><td colSpan={7} className="px-6 py-12 text-center text-xs text-[#1E1C18]/40 font-semibold">No rooms on this floor.</td></tr>)}
                                  </tbody>
                                </table>
                              </div>
                              <div className="bg-[#FAF7F0]/40 border-t border-[#1E1C18]/5 px-6 py-5 flex items-center justify-between">
                                <button onClick={addRoom} className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold hover:bg-brand-gold-dark px-5 py-2.5 text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"><Plus className="h-4 w-4" />Add Room to {selectedFloor}</button>
                                <div className="text-xs text-[#1E1C18]/55 font-bold">Floor Area: <span className="text-brand-gold font-black bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-xl ml-1">{rooms.filter(r=>r.floor===selectedFloor).reduce((acc,r)=>acc+(r.width*r.length),0).toFixed(1)} m²</span></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "boq" && (
                          <div className="bg-white border border-[#1E1C18]/5 rounded-3xl shadow-sm p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
                            <div><h3 className="text-lg font-black text-[#1E1C18] flex items-center gap-2"><Layers className="h-5 w-5 text-brand-gold" />BoQ Line-Item Auditor</h3><p className="text-xs text-[#1E1C18]/50">AI-extracted raw material quantities. Click <span className="font-extrabold text-brand-gold">Explain</span> for plain language breakdowns.</p></div>
                            <div className="space-y-4">
                              {getBoqItems().map((item) => {
                                const isExpanded = expandedBoqItem === item.id;
                                return (
                                  <div key={item.id} className={`border rounded-2xl transition-all duration-300 ${isExpanded?"border-brand-gold bg-[#FAF7F0] shadow-sm":"border-[#1E1C18]/10 bg-white hover:border-[#1E1C18]/20 hover:shadow-sm"}`}>
                                    <div onClick={() => setExpandedBoqItem(isExpanded?null:item.id)} className="flex flex-wrap items-center justify-between gap-4 p-5 cursor-pointer select-none">
                                      <div className="flex items-center gap-3.5"><div className="h-10 w-10 bg-[#FAF7F0] border border-[#1E1C18]/5 rounded-xl flex items-center justify-center text-lg shadow-sm">{item.id==="cement"?"🧱":item.id==="steel"?"🏗️":item.id==="bricks"?"🧱":item.id==="labor"?"👷":item.id==="paint"?"🎨":"⚡"}</div><div><h4 className="text-sm font-black text-[#1E1C18] leading-tight">{item.name}</h4><p className="text-[11px] text-[#1E1C18]/50 font-semibold mt-1">Quantity: <strong className="text-[#1E1C18] font-extrabold">{item.quantity}</strong></p></div></div>
                                      <div className="flex items-center gap-5"><div className="text-right"><span className="text-[10px] text-[#1E1C18]/45 font-extrabold block uppercase tracking-wider">Benchmark Rate</span><span className="text-xs font-black text-[#1E1C18]">${item.unitPrice.toFixed(2)}</span></div><div className="text-right"><span className="text-[10px] text-[#1E1C18]/45 font-extrabold block uppercase tracking-wider">Estimated Cost</span><span className="text-xs font-black text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/25">${Math.round(item.total).toLocaleString()}</span></div><button className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${isExpanded?"bg-brand-gold text-white shadow-md":"bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/25"}`}>Explain</button></div>
                                    </div>
                                    {isExpanded&&(<div className="px-5 pb-5 pt-1 border-t border-[#1E1C18]/5 animate-in slide-in-from-top-2 duration-300"><div className="bg-[#FAF7F0] border border-brand-gold/20 rounded-xl p-4 flex gap-3.5 text-xs text-[#1E1C18]/85 leading-relaxed shadow-inner font-semibold"><div className="flex-shrink-0 text-brand-gold mt-0.5"><Sparkles className="h-4.5 w-4.5 animate-pulse" /></div><div><strong className="text-brand-gold block font-black text-xs uppercase tracking-wide mb-1">AI Auditing Rationale</strong>{item.explanation}</div></div></div>)}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {activeTab === "chat" && (
                          <div className="bg-white border border-[#1E1C18]/5 rounded-3xl shadow-sm flex flex-col h-[550px] overflow-hidden animate-in fade-in duration-200">
                            <div className="bg-[#FAF7F0] border-b border-[#1E1C18]/5 px-6 py-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /><div><h3 className="text-xs font-black text-[#1E1C18] uppercase tracking-wider">DomNak AI Consultant</h3><p className="text-[10px] text-[#1E1C18]/45 font-bold">Active on project data & Cambodian metrics</p></div></div><span className="text-[9px] font-extrabold text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-full px-2.5 py-1 tracking-wider uppercase">Private Audit Agent</span></div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF7F0]/30 shadow-inner">
                              {chatMessages.map((msg,index) => (<div key={index} className={`flex ${msg.sender==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3.5 text-xs leading-relaxed whitespace-pre-line shadow-sm border font-semibold ${msg.sender==="user"?"bg-[#1E1C18] text-white border-transparent rounded-tr-none":"bg-white text-[#1E1C18] border-[#1E1C18]/5 rounded-tl-none"}`}>{msg.sender==="ai"&&(<div className="flex items-center gap-1.5 text-[9px] font-black text-brand-gold tracking-wider uppercase mb-2"><Sparkles className="h-3 w-3" /><span>DomNak Agent</span></div>)}{msg.text}</div></div>))}
                              {isChatTyping&&(<div className="flex justify-start"><div className="bg-white text-[#1E1C18] border border-[#1E1C18]/5 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-sm flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#1E1C18]/30 animate-bounce" /><span className="h-2 w-2 rounded-full bg-[#1E1C18]/30 animate-bounce [animation-delay:0.2s]" /><span className="h-2 w-2 rounded-full bg-[#1E1C18]/30 animate-bounce [animation-delay:0.4s]" /></div></div>)}
                              <div ref={chatBottomRef} />
                            </div>
                            <div className="px-6 py-3 border-t border-[#1E1C18]/5 bg-white flex flex-wrap gap-2">
                              <button id="btn-chat-redflags" onClick={() => handleChatSubmit("Analyze Red Flags in this Quote")} className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-3.5 py-2 rounded-full cursor-pointer transition-colors shadow-sm">🚩 Analyze Red Flags</button>
                              <button id="btn-chat-benchmarks" onClick={() => handleChatSubmit("Compare with Phnom Penh Averages")} className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-brand-gold bg-brand-gold/10 border border-brand-gold/15 hover:bg-brand-gold/20 px-3.5 py-2 rounded-full cursor-pointer transition-colors shadow-sm">🏢 Check Local Averages</button>
                              <button id="btn-chat-savings" onClick={() => handleChatSubmit("How can I lower construction cost by 15%?")} className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-3.5 py-2 rounded-full cursor-pointer transition-colors shadow-sm">💡 Show Savings Tips</button>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleChatSubmit(chatInput); }} className="border-t border-[#1E1C18]/5 bg-[#FAF7F0] p-4 flex gap-2.5">
                              <input id="chat-input-text" type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask AI: 'Is the brick count normal?' or 'How can I save cost?'..." className="flex-grow bg-white border border-[#1E1C18]/10 rounded-full px-5 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all shadow-inner font-medium" />
                              <button id="chat-send-btn" type="submit" disabled={!chatInput.trim()||isChatTyping} className="h-10 w-10 bg-brand-gold hover:bg-brand-gold-dark text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors shadow cursor-pointer"><Send className="h-4 w-4" /></button>
                            </form>
                          </div>
                        )}
                      </div>

                      {/* Right: Financial Summary */}
                      <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[#1E1C18] text-white rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-28 h-28 bg-brand-gold/15 rounded-bl-full pointer-events-none -z-10" />
                          <h3 className="text-base font-black tracking-tight border-b border-white/10 pb-3.5 flex items-center gap-2"><Scale className="h-4.5 w-4.5 text-brand-gold" />BoQ Financial Summary</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-semibold text-white/70"><span>Aggregate Floor Area</span><span className="font-extrabold text-sm text-white">{totalArea.toFixed(1)} m²</span></div>
                            <div className="flex justify-between items-center text-xs font-semibold text-white/70"><span>Extracted Rooms Count</span><span className="font-extrabold text-sm text-white">{rooms.length} Spaces</span></div>
                            <div className="flex justify-between items-center text-xs font-semibold text-white/70"><span>Material Finish Tier</span><span className="font-extrabold text-brand-gold uppercase tracking-wider text-xs">{qualityTier}</span></div>
                            <hr className="border-white/10" />
                            <div className="flex justify-between items-center text-[11px] text-white/60 font-semibold"><span>Baseline ({totalArea.toFixed(0)}m² × ${BASE_COSTS[qualityTier]}/m²)</span><span>${baselineCost.toLocaleString("en-US",{maximumFractionDigits:0})}</span></div>
                            <div className="flex justify-between items-center text-[11px] text-white/60 font-semibold"><span>Engineering & Permits (15%)</span><span>${(baselineCost*0.15).toLocaleString("en-US",{maximumFractionDigits:0})}</span></div>
                            <div className="flex justify-between items-center text-sm font-black border-t border-dashed border-white/15 pt-3.5"><span className="text-brand-gold">DomNak Fair Market Value</span><span className="text-brand-gold text-lg">${fairMarketEstimate.toLocaleString("en-US",{maximumFractionDigits:0})}</span></div>
                            <div className="flex justify-between items-center text-xs font-black bg-white/5 border border-white/10 rounded-xl p-3.5"><span className="text-white/75 uppercase tracking-wider text-[10px]">Contractor's Quoted Cost</span><span className="text-white text-sm">${quotedPrice.toLocaleString()}</span></div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/50"><span>Quote Position</span><span className={markupPercentage>25?"text-rose-400":markupPercentage>8?"text-amber-400":"text-emerald-400"}>{markupPercentage>0?`+${markupPercentage.toFixed(1)}% Markup`:`${markupPercentage.toFixed(1)}% Saving`}</span></div>
                              <div className="relative w-full h-3.5 bg-white/10 rounded-full overflow-hidden border border-white/5 flex"><div className="w-[30%] bg-emerald-500/30 border-r border-white/10" /><div className="w-[45%] bg-amber-500/30 border-r border-white/10" /><div className="w-[25%] bg-rose-500/30" /><div className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 bg-brand-gold rounded-full shadow-[0_0_8px_#b38e42] transition-all duration-500 border border-white" style={{ left: `${Math.min(97,Math.max(3,30+(markupPercentage*1.5)))}%` }} /></div>
                              <div className="flex justify-between text-[8px] font-black text-white/35 uppercase"><span>Competitive</span><span>Moderate</span><span>Overpriced</span></div>
                            </div>
                            <div className={`p-4 rounded-2xl flex items-start gap-3 border text-xs font-semibold shadow-sm transition-all duration-300 ${auditColor}`}><div className="flex-shrink-0 mt-0.5"><Info className="h-4 w-4" /></div><div className="leading-relaxed">{priceDifference>0?<span>The quote is <strong className="font-black">${Math.abs(priceDifference).toLocaleString("en-US",{maximumFractionDigits:0})}</strong> higher than our local pricing index averages.</span>:<span>The quote is <strong className="font-black">${Math.abs(priceDifference).toLocaleString("en-US",{maximumFractionDigits:0})}</strong> lower than our average rate baseline. Good value!</span>}</div></div>
                          </div>
                          <button onClick={() => showToast("Exporting Floor Plan specifications...")} className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark px-4 py-3 text-xs font-black text-white transition-all cursor-pointer shadow hover:shadow-md"><Download className="h-4 w-4" />Export Blueprint Specs</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ──── ESTIMATOR TAB ─────────────────────────────────────── */}
            {sidebarTab === "history" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 bg-white border border-[#1E1C18]/5 rounded-3xl p-6 lg:p-8 shadow-sm">
                    <h3 className="font-black text-lg text-[#1E1C18] border-b border-[#1E1C18]/5 pb-4 mb-6 flex items-center gap-2"><Calculator className="h-5 w-5 text-brand-gold" />Budget Estimator Settings</h3>
                    <form onSubmit={(e) => { e.preventDefault(); saveProfile(profileLocation, profileBudget, profileStartDate); }} className="space-y-5">
                      <div><label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Build Site Location</label><input type="text" value={profileLocation} onChange={(e) => setProfileLocation(e.target.value)} className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner" placeholder="e.g. Phnom Penh, Toul Kork" /></div>
                      <div><label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Target Budget ($)</label><input type="number" value={profileBudget} onChange={(e) => setProfileBudget(parseInt(e.target.value)||0)} className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner" /></div>
                      <div><label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Target Construction Start</label><input type="text" value={profileStartDate} onChange={(e) => setProfileStartDate(e.target.value)} className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner" placeholder="e.g. Q3 2026" /></div>
                      <div><label className="block text-[10px] font-black text-[#1E1C18]/55 uppercase tracking-wider mb-2">Property Style</label><select value={profilePropertyType} onChange={(e) => { setProfilePropertyType(e.target.value); localStorage.setItem("domnak_profile_property_type",e.target.value); }} className="w-full text-xs bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-4 py-3 font-extrabold text-[#1E1C18] focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all cursor-pointer"><option value="villa">Premium Family Villa</option><option value="condo">Urban Condo</option><option value="townhouse">Modern Townhouse</option><option value="penthouse">Skyline Penthouse</option></select></div>
                      <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-white px-6 py-3.5 text-xs font-black shadow-md transition-all cursor-pointer"><CheckCircle className="h-4 w-4" />Save Settings</button>
                    </form>
                  </div>

                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="font-black text-lg text-[#1E1C18] flex items-center gap-2"><History className="h-5 w-5 text-brand-gold" />Saved Audit History</h3>
                    {auditHistory.length === 0 ? (
                      <div className="text-center py-16 bg-white border border-[#1E1C18]/5 rounded-3xl shadow-sm">
                        <div className="h-14 w-14 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mx-auto mb-4 border border-brand-gold/20"><History className="h-6 w-6" /></div>
                        <h3 className="font-extrabold text-lg text-[#1E1C18]">No Saved Audits</h3>
                        <p className="text-xs text-[#1E1C18]/50 mt-1.5 max-w-sm mx-auto font-semibold leading-relaxed">Upload a contractor proposal in the Quotes tab to start an audit.</p>
                        <button onClick={() => setSidebarTab("quotes")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-gold hover:bg-brand-gold-dark px-5 py-3 text-xs font-black text-white transition-all shadow-md cursor-pointer"><Building className="h-4 w-4" />Start Quote Audit</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {auditHistory.map((audit) => {
                          const savedArea = audit.rooms?.reduce((acc,r) => acc+(r.width*r.length),0)||0;
                          return (
                            <div key={audit.id} className="bg-white border border-[#1E1C18]/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-gold/40 group-hover:bg-brand-gold transition-colors rounded-l-3xl" />
                              <div className="pl-2">
                                <div className="flex justify-between items-start gap-4"><span className="text-[10px] font-mono text-[#1E1C18]/40 font-semibold flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{audit.date}</span><span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2.5 py-1 rounded-md">{audit.qualityTier} finish</span></div>
                                <h4 className="font-black text-lg text-[#1E1C18] mt-3 tracking-tight">{audit.projectName}</h4>
                                <p className="text-xs text-[#1E1C18]/50 font-semibold mt-1">Contractor: <strong className="text-[#1E1C18] font-extrabold">{audit.contractorName}</strong></p>
                                <div className="flex items-center gap-6 mt-4 bg-[#FAF7F0] border border-[#1E1C18]/5 p-4 rounded-xl shadow-inner"><div><span className="text-[9px] text-[#1E1C18]/40 font-black uppercase tracking-wider block">Quoted Price</span><span className="text-sm font-black text-[#1E1C18]">${audit.quotedPrice.toLocaleString()}</span></div><div className="h-8 w-[1px] bg-[#1E1C18]/10" /><div><span className="text-[9px] text-[#1E1C18]/40 font-black uppercase tracking-wider block">Estimated Area</span><span className="text-sm font-black text-[#1E1C18]">{savedArea.toFixed(1)} m²</span></div></div>
                              </div>
                              <div className="flex gap-3 mt-5 pl-2 border-t border-[#1E1C18]/5 pt-4">
                                <button onClick={() => loadSavedAudit(audit)} className="flex-grow inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-white px-4 py-2.5 text-xs font-black shadow transition-all cursor-pointer"><FileSpreadsheet className="h-3.5 w-3.5" />Load Audit</button>
                                <button onClick={() => deleteSavedAudit(audit.id)} className="inline-flex items-center justify-center p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-all cursor-pointer shadow-sm"><Trash2 className="h-4.5 w-4.5" /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ──── SUPPLIERS TAB ─────────────────────────────────────── */}
            {sidebarTab === "suppliers" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-[#1E1C18] text-white rounded-3xl p-8 lg:p-10 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-bl-full" />
                  <div className="relative z-10 space-y-4 max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold border border-brand-gold/30 rounded-full px-3 py-1 text-xs font-bold"><Store className="h-3.5 w-3.5" /> Supplier Directory</div>
                    <h2 className="text-2xl font-black tracking-tight">Browse Verified Suppliers Near You</h2>
                    <p className="text-sm text-white/65 leading-relaxed">Find trusted building material suppliers, hardware stores, and construction service providers in your area. All listings are verified by the DomNak team.</p>
                    <Link href="/supplier" className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-white font-black text-sm rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all cursor-pointer">Open Supplier Directory <ArrowRight className="h-4 w-4" /></Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { name:"Camel Cement Cambodia",    category:"Cement & Concrete",    badge:"⭐ Top Rated", location:"Phnom Penh" },
                    { name:"Siam Cement Group",        category:"Structural Materials", badge:"🏆 Premium",   location:"Kandal Province" },
                    { name:"Heng Hardware Co.",        category:"Steel & Rebars",       badge:"✅ Verified",  location:"Toul Kork" },
                    { name:"Angkor Tiles & Ceramics",  category:"Flooring & Tiles",     badge:"✅ Verified",  location:"Chamkar Mon" },
                    { name:"PPM Electrical Supply",    category:"Electrical Works",     badge:"⭐ Top Rated", location:"Sen Sok" },
                    { name:"PhnomPenh Lumber Co.",     category:"Timber & Doors",       badge:"✅ Verified",  location:"Russei Keo" },
                  ].map((s,i) => (
                    <div key={i} className="bg-white border border-[#1E1C18]/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3"><div className="h-10 w-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold font-black text-base border border-brand-gold/20">{s.name.charAt(0)}</div><span className="text-[10px] font-extrabold text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-full px-2.5 py-1">{s.badge}</span></div>
                      <h4 className="font-black text-sm text-[#1E1C18] leading-tight">{s.name}</h4>
                      <p className="text-xs text-[#1E1C18]/50 font-semibold mt-1">{s.category}</p>
                      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-[#1E1C18]/40 font-semibold"><MapPin className="h-3 w-3 text-brand-gold" />{s.location}</div>
                      <button onClick={() => showToast(`Contacting ${s.name}...`)} className="mt-4 w-full text-xs font-black text-brand-gold bg-brand-gold/8 hover:bg-brand-gold/15 border border-brand-gold/20 rounded-xl py-2.5 transition-all cursor-pointer">Contact Supplier</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ──── CHAT TAB ──────────────────────────────────────────── */}
            {sidebarTab === "chat" && (
              <div className="animate-in fade-in duration-300">
                <ChatUI
                  contacts={[{
                    id: "architect",
                    name: "Sopheap Meas",
                    role: "Senior Structural Architect",
                    initials: "SM",
                    lastMsg: architectChat[architectChat.length - 1]?.text || "No messages yet",
                    time: architectChat[architectChat.length - 1]?.time || "",
                    project: "Angkor Architecture Studio",
                  }]}
                  selectedId="architect"
                  onSelectContact={() => {}}
                  messages={architectChat.map(m => ({
                    sender: m.sender === "user" ? "me" : "other",
                    text: m.text,
                    time: m.time,
                  }))}
                  onSendMessage={(text) => {
                    const userMsg = { sender: "user", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
                    setArchitectChat(prev => [...prev, userMsg]);
                    setTimeout(() => {
                      let replyText = "Understood. I am cross-referencing your request with local BoQ building standards. Let me make those adjustments and get back to you.";
                      const t = text.toLowerCase();
                      if (t.includes("budget") || t.includes("cost") || t.includes("price")) replyText = "To keep aligned, we can optimize the masonry brick count or transition to standard-tier tile finishes for guest rooms.";
                      else if (t.includes("dimensions") || t.includes("room") || t.includes("floor")) replyText = "Let me adjust the grid partition coordinates. Conforming to a tighter grid will reduce concrete formwork and steel costs.";
                      setArchitectChat(prev => [...prev, { sender: "architect", text: replyText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
                    }, 1500);
                  }}
                  isTyping={false}
                  activeContact={{ name: "Sopheap Meas", role: "Senior Structural Architect", project: "Angkor Studio", initials: "SM" }}
                  placeholder="Type a message to Sopheap…"
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
