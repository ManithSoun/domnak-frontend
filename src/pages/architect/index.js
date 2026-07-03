import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import ChatUI from "@/components/ChatUI";
import { useAuth } from "../../../router/useAuth";
import {
  Compass,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Download,
  UploadCloud,
  CheckCircle,
  DollarSign,
  Layers,
  Send,
  Briefcase,
  Grid,
  Info,
  MapPin,
  Clock,
  ArrowRight,
  Phone,
  Mail as MailIcon,
  RotateCcw,
  Sparkles,
  ScanLine,
  X,
  FileImage,
  BarChart2,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  History
} from "lucide-react";

export default function ArchitectPage() {
  const { user, logout } = useAuth();

  // Dashboard state
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "floorplan" | "boq" | "files" | "messages" | "settings"
  const [selectedClientId, setSelectedClientId] = useState("c1");
  const [customNotification, setCustomNotification] = useState(null);

  // AI Floor Plan Generator state
  const [rooms, setRooms] = useState({
    bedroom: 1,
    livingRoom: 1,
    bathroom: 1,
    diningRoom: 0,
    kitchen: "open" // "open" | "closed"
  });
  const [grossArea, setGrossArea] = useState(120);
  const [areaUnit, setAreaUnit] = useState("metric"); // "metric" | "imperial"
  const [floorStyle, setFloorStyle] = useState("3D"); // "technical" | "2.5D" | "3D"
  const [aspectRatio, setAspectRatio] = useState("3:2");
  const [prompt, setPrompt] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentPlanImage, setCurrentPlanImage] = useState("/assets/floorplan_3d.png");

  // Clients database mock
  const [clients, setClients] = useState([
    { id: "c1", name: "Sophal Chan", project: "2-Story Premium Family Villa", location: "Phnom Penh, Toul Kork", budget: 150000, status: "Design Phase", dateConnected: "June 12, 2026", email: "sophal@example.com", phone: "+855 89 223 114" },
    { id: "c2", name: "Nisay Seng", project: "Modern 1-Bedroom Urban Condo", location: "Phnom Penh, BKK1", budget: 50000, status: "Planning", dateConnected: "June 18, 2026", email: "nisay@example.com", phone: "+855 12 445 778" },
    { id: "c3", name: "Vicheka Oum", project: "Luxury Skyline Penthouse Suite", location: "Siem Reap", budget: 320000, status: "Contract Phase", dateConnected: "June 05, 2026", email: "vicheka@example.com", phone: "+855 95 334 889" }
  ]);

  // BoQ pricing template builder state
  const [boqMaterials, setBoqMaterials] = useState([
    { id: "m1", name: "Portland Cement (Masonry)", unit: "bags", rate: 6.50, quantity: 800, markup: 15 },
    { id: "m2", name: "Reinforcement Steel Rebars", unit: "tons", rate: 780.00, quantity: 1.2, markup: 15 },
    { id: "m3", name: "Solid & Hollow Clay Bricks", unit: "pieces", rate: 0.08, quantity: 11000, markup: 15 },
    { id: "m4", name: "Masonry & Structural Labor", unit: "man-days", rate: 22.00, quantity: 60, markup: 15 },
    { id: "m5", name: "Skim Coat finishes & Paint", unit: "m²", rate: 9.00, quantity: 420, markup: 15 }
  ]);

  const [newMaterial, setNewMaterial] = useState({ name: "", unit: "bags", rate: 0, quantity: 0, markup: 15 });

  // Shared design documents list
  const [sharedFiles, setSharedFiles] = useState([
    { id: "f1", name: "Angkor_PremiumVilla_LayoutPlan_V3.pdf", type: "PDF Plan", size: "8.5 MB", date: "Shared 2 days ago" },
    { id: "f2", name: "LivingRoom_3DRender_InteriorOptions.png", type: "3D Render", size: "14.2 MB", date: "Shared 2 days ago" },
    { id: "f3", name: "StructuralFoundation_ReinforcementDetails.pdf", type: "PDF Spec", size: "4.1 MB", date: "Shared 5 days ago" }
  ]);

  // Client Chat history matching homeowners correspondence
  const [clientChats, setClientChats] = useState({
    c1: [
      { sender: "architect", text: "Hello! I reviewed your latest budget audit for the villa. We might want to optimize the master bathroom fixtures to stay under the $150k target.", time: "10:30 AM" },
      { sender: "user", text: "Hi! Yes, I agree. Can we look at standard grade tiles for the kids bedroom as well?", time: "10:45 AM" },
      { sender: "architect", text: "Absolutely, that can trim about $2,500. I have updated the shared 3D plans to reflect standard layout configurations.", time: "11:00 AM" }
    ],
    c2: [
      { sender: "user", text: "Hi Sopheap, have you checked the L-shaped kitchenette configuration?", time: "09:15 AM" },
      { sender: "architect", text: "Yes, Nisay. It maximizes spatial flow for standard condos. I'll share the render draft soon.", time: "09:30 AM" }
    ],
    c3: [
      { sender: "architect", text: "Good morning Vicheka, did you receive the skylight framing cost estimates?", time: "Yesterday" },
      { sender: "user", text: "Yes, looks solid. Let's finalize the contract details tomorrow.", time: "Yesterday" }
    ]
  });

  const [chatInput, setChatInput] = useState("");
  const [isClientTyping, setIsClientTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // ── Plan Analyzer state ──────────────────────────────────────────────────
  const [scanFile, setScanFile] = useState(null);         // { name, type, size, previewUrl }
  const [isScanAnalyzing, setIsScanAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);   // extracted metrics
  const [scanBoq, setScanBoq] = useState([]);             // auto-generated BOQ
  const [scanQuoteClientId, setScanQuoteClientId] = useState("c1");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [sentQuotesList, setSentQuotesList] = useState([]);

  // Initialize and load custom templates from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBoq = localStorage.getItem("domnak_architect_boq");
      if (savedBoq) {
        try { setBoqMaterials(JSON.parse(savedBoq)); } catch (e) { console.error(e); }
      }
      const savedFiles = localStorage.getItem("domnak_architect_files");
      if (savedFiles) {
        try { setSharedFiles(JSON.parse(savedFiles)); } catch (e) { console.error(e); }
      }
      const savedSentQuotes = localStorage.getItem("domnak_sent_quotes");
      if (savedSentQuotes) {
        try { setSentQuotesList(JSON.parse(savedSentQuotes)); } catch (e) { console.error(e); }
      }
    }
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [clientChats, isClientTyping]);

  const showToast = (msg) => {
    setCustomNotification(msg);
    setTimeout(() => setCustomNotification(null), 4000);
  };

  const getActiveClient = () => {
    return clients.find(c => c.id === selectedClientId) || clients[0];
  };

  // Add material to BoQ List
  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!newMaterial.name.trim()) return;
    const item = {
      id: `m_${Date.now()}`,
      name: newMaterial.name,
      unit: newMaterial.unit,
      rate: parseFloat(newMaterial.rate) || 0,
      quantity: parseFloat(newMaterial.quantity) || 0,
      markup: parseFloat(newMaterial.markup) || 0
    };
    const updated = [...boqMaterials, item];
    setBoqMaterials(updated);
    localStorage.setItem("domnak_architect_boq", JSON.stringify(updated));
    setNewMaterial({ name: "", unit: "bags", rate: 0, quantity: 0, markup: 15 });
    showToast("Material added to BoQ template!");
  };

  const deleteMaterial = (id) => {
    const updated = boqMaterials.filter(m => m.id !== id);
    setBoqMaterials(updated);
    localStorage.setItem("domnak_architect_boq", JSON.stringify(updated));
    showToast("Material removed from template.");
  };

  const updateMaterialField = (id, field, val) => {
    const updated = boqMaterials.map(m => {
      if (m.id === id) {
        return { ...m, [field]: field === "name" || field === "unit" ? val : parseFloat(val) || 0 };
      }
      return m;
    });
    setBoqMaterials(updated);
    localStorage.setItem("domnak_architect_boq", JSON.stringify(updated));
  };

  const handleDocumentUpload = (e) => {
    e.preventDefault();
    const newFile = {
      id: `f_${Date.now()}`,
      name: `Angkor_ProposalDraft_${Date.now().toString().slice(-4)}.pdf`,
      type: "PDF Document",
      size: "3.2 MB",
      date: "Shared just now"
    };
    const updated = [newFile, ...sharedFiles];
    setSharedFiles(updated);
    localStorage.setItem("domnak_architect_files", JSON.stringify(updated));
    showToast("Document shared with client workspace!");
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const activeClient = getActiveClient();
    const updatedHistory = [
      ...(clientChats[selectedClientId] || []),
      { sender: "architect", text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];

    setClientChats(prev => ({
      ...prev,
      [selectedClientId]: updatedHistory
    }));
    setChatInput("");
    setIsClientTyping(true);

    // Simulate Client Response after 1.5 seconds
    setTimeout(() => {
      let clientText = `Thanks for updating me, Sopheap! Let's verify the dimensions on the estimator to make sure it matches regional Phnom Penh indexes.`;
      const text = chatInput.toLowerCase();

      if (text.includes("price") || text.includes("cost") || text.includes("budget") || text.includes("save")) {
        clientText = `That sounds fair. Can you update the partition walls outline to trim cement bag consumption by another 5%?`;
      } else if (text.includes("drawing") || text.includes("layout") || text.includes("render") || text.includes("pdf")) {
        clientText = `Got it. I'll download the updated layout spec and run it through the DOMNAK scanner tool now.`;
      }

      setClientChats(prev => ({
        ...prev,
        [selectedClientId]: [
          ...(prev[selectedClientId] || []),
          { sender: "user", text: clientText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      }));
      setIsClientTyping(false);
    }, 1500);
  };

  // Totals calculations
  const calculateMaterialTotal = (m) => {
    const base = m.rate * m.quantity;
    const markupVal = base * (m.markup / 100);
    return base + markupVal;
  };

  const calculateGrandTotal = () => {
    return boqMaterials.reduce((acc, m) => acc + calculateMaterialTotal(m), 0);
  };

  // ── Plan Analyzer helpers ────────────────────────────────────────────────
  const generateScanBoq = (results) => {
    const { area, wallLength, roofArea, roomCount, bathroomCount } = results;
    return [
      { id: "sb1",  name: "Concrete Foundation Works",        unit: "m³",       rate: 85.00,  quantity: parseFloat((area * 0.15).toFixed(1)),         markup: 15 },
      { id: "sb2",  name: "Steel Reinforcement Rebars",       unit: "tons",     rate: 780.00, quantity: parseFloat((area * 0.008).toFixed(2)),        markup: 15 },
      { id: "sb3",  name: "Clay Bricks (Structural Walls)",   unit: "pieces",   rate: 0.08,   quantity: Math.round(wallLength * 50),                  markup: 15 },
      { id: "sb4",  name: "Portland Cement (Masonry)",        unit: "bags",     rate: 6.50,   quantity: Math.round(area * 6),                         markup: 15 },
      { id: "sb5",  name: "Roof Sheeting (Metal / Tile)",     unit: "m²",       rate: 18.50,  quantity: parseFloat(roofArea.toFixed(1)),               markup: 15 },
      { id: "sb6",  name: "Timber Roof Frame Structure",      unit: "lin.m",    rate: 12.00,  quantity: parseFloat((roofArea * 0.4).toFixed(1)),      markup: 15 },
      { id: "sb7",  name: "Electrical Rough-in (Points)",     unit: "points",   rate: 45.00,  quantity: roomCount * 12,                               markup: 15 },
      { id: "sb8",  name: "Plumbing & Sanitary Works",        unit: "points",   rate: 65.00,  quantity: bathroomCount * 8,                            markup: 15 },
      { id: "sb9",  name: "Floor Screed & Tiling",            unit: "m²",       rate: 14.00,  quantity: parseFloat((area * 0.85).toFixed(1)),         markup: 15 },
      { id: "sb10", name: "Wall Skim Coat & Paint",           unit: "m²",       rate: 9.00,   quantity: parseFloat((wallLength * 2.8).toFixed(1)),    markup: 15 },
      { id: "sb11", name: "Doors, Windows & Frames",          unit: "units",    rate: 280.00, quantity: roomCount + 2,                                markup: 15 },
      { id: "sb12", name: "Construction Labor (General)",     unit: "man-days", rate: 22.00,  quantity: Math.round(area * 1.2),                       markup: 15 },
    ];
  };

  const calculateScanBoqTotal = () =>
    scanBoq.reduce((acc, m) => acc + m.rate * m.quantity * (1 + m.markup / 100), 0);

  const updateScanBoqField = (id, field, val) => {
    setScanBoq(prev => prev.map(m =>
      m.id === id ? { ...m, [field]: (field === "name" || field === "unit") ? val : parseFloat(val) || 0 } : m
    ));
  };

  const deleteScanBoqItem = (id) => setScanBoq(prev => prev.filter(m => m.id !== id));

  const resetScanState = () => { setScanFile(null); setScanResults(null); setScanBoq([]); };

  const handleLoadSavedQuote = (quote) => {
    setScanFile({
      name: quote.fileName || "Loaded BoQ Plan",
      type: "application/pdf",
      size: "Generated BOQ"
    });
    setScanResults({
      area: quote.area || 120,
      wallLength: Math.round(quote.area * 0.9) || 100,
      roofArea: Math.round(quote.area * 1.2) || 140,
      roomCount: 4,
      bathroomCount: 2
    });
    setScanBoq(JSON.parse(JSON.stringify(quote.boq)));
    setActiveTab("floorplan");
    showToast(`Loaded Quote: ${quote.clientName}`);
  };

  const handleDeleteSavedQuote = (id) => {
    const updated = sentQuotesList.filter(q => q.id !== id);
    setSentQuotesList(updated);
    localStorage.setItem("domnak_sent_quotes", JSON.stringify(updated));
    showToast("Quote deleted successfully.");
  };

  const handleSaveDraftQuote = () => {
    const quote = {
      id: `q_${Date.now()}`,
      clientId: "draft",
      clientName: "Draft / Unassigned",
      fileName: scanFile?.name || "Scanned Plan",
      area: scanResults?.area || 120,
      total: Math.round(calculateScanBoqTotal()),
      boq: scanBoq,
      sentAt: new Date().toISOString(),
    };
    const updated = [quote, ...sentQuotesList];
    setSentQuotesList(updated);
    localStorage.setItem("domnak_sent_quotes", JSON.stringify(updated));
    showToast("✅ Draft quote saved successfully!");
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleScanFileSelect = (file) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf";
    if (!isPdf) { showToast("Please upload a PDF file only."); return; }
    setScanFile({ name: file.name, type: file.type, size: (file.size / 1024 / 1024).toFixed(2) + " MB", previewUrl: null });
    setScanResults(null);
    setScanBoq([]);
  };

  const handleScanFileChange = (e) => handleScanFileSelect(e.target.files?.[0]);
  const handleScanDrop       = (e) => { e.preventDefault(); handleScanFileSelect(e.dataTransfer.files?.[0]); };

  const handleScanAnalyze = () => {
    if (!scanFile) return;
    setIsScanAnalyzing(true);
    setScanStep(0);
    setScanProgress(0);
    const steps = [
      { duration: 1300, progress: 25 },
      { duration: 1600, progress: 50 },
      { duration: 1400, progress: 75 },
      { duration: 1100, progress: 100 },
    ];
    const runStep = (idx) => {
      if (idx >= steps.length) {
        const area          = Math.round(80  + Math.random() * 220);
        const wallLength    = parseFloat((area * (0.7  + Math.random() * 0.2)).toFixed(1));
        const roofArea      = parseFloat((area * (1.1  + Math.random() * 0.15)).toFixed(1));
        const roomCount     = Math.floor(3 + Math.random() * 4);
        const bathroomCount = Math.floor(1 + Math.random() * 3);
        const results = { area, wallLength, roofArea, roomCount, bathroomCount };
        setTimeout(() => {
          setIsScanAnalyzing(false);
          setScanResults(results);
          setScanBoq(generateScanBoq(results));
          showToast("AI analysis complete — BOQ auto-generated!");
        }, 400);
        return;
      }
      setScanStep(idx);
      setScanProgress(steps[idx].progress);
      setTimeout(() => runStep(idx + 1), steps[idx].duration);
    };
    runStep(0);
  };

  const activeClient = getActiveClient();

  return (
    <>
      <Head>
        <title>Architect Studio Portal | DomNak - Estimations & BoQ Designer</title>
        <meta name="description" content="Collaborate with homeowners. Compile dynamic Bill of Quantities, configure material markup values, and coordinate interior design templates." />
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
          <nav className="flex-1 px-3 space-y-0.5 pt-4">
            {[
              { id: "overview",      label: "Overview",       icon: Briefcase },
              { id: "scanAnalyzer",  label: "Plan Analyzer",  icon: ScanLine },

              { id: "boq",           label: "BOQ Builder",    icon: Grid },
              { id: "files",         label: "Shared Files",   icon: FileText },
              { id: "messages",      label: "Client Chat",    icon: MessageSquare },
              { id: "settings",      label: "Studio Settings",icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === id
                    ? "bg-brand-gold text-white shadow-md shadow-brand-gold/10"
                    : "text-[#FAF7F0]/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
              </button>
            ))}
          </nav>

          {/* User profile section at the bottom */}
          <div className="p-4 border-t border-[#FAF7F0]/10 flex items-center justify-between gap-3 bg-black/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-brand-gold flex items-center justify-center font-bold text-white shadow-sm select-none uppercase shrink-0">
                {user?.company ? user.company.substring(0, 2) : "AS"}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-black text-white block truncate leading-tight">
                  {user?.company || "Angkor Studio"}
                </span>
                <span className="text-[9px] text-[#FAF7F0]/40 font-semibold block uppercase tracking-wider mt-0.5">
                  Architect Portal
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-[#FAF7F0]/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer shrink-0"
              title="Log Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </aside>

        {/* ── Main content area ────────────────────────────────────────── */}
        <div className="flex-grow flex flex-col h-full overflow-hidden">
          
          {/* Header bar */}
          <header className="bg-white border-b border-[#1E1C18]/5 h-16 flex items-center justify-between px-8 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-brand-dark/45 uppercase tracking-wider">
                {activeTab === "overview" && "Dashboard"}
                {activeTab === "scanAnalyzer" && "Plan Analyzer"}
                {activeTab === "floorplan" && "AI Floor Planner"}
                {activeTab === "boq" && "BoQ Builder"}
                {activeTab === "files" && "Shared Drawings"}
                {activeTab === "messages" && "Client Chat"}
                {activeTab === "settings" && "Settings"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-xs font-semibold text-brand-dark/70">
                Studio: <strong className="text-brand-dark">{user?.company || "Angkor Architecture Studio"}</strong>
              </span>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto bg-[#FAF7F0]/40 relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#b38e42_1px,transparent_1px)] [background-size:20px_20px]" />
            
            {/* Global toast status bar */}
            {customNotification && (
              <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-xl bg-brand-dark px-5 py-4 text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
                <Sparkles className="h-4 w-4 text-brand-gold animate-pulse" />
                <span>{customNotification}</span>
              </div>
            )}

            <div className="p-8 max-w-7xl mx-auto space-y-8">
              
              {/* Header section with page title */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E1C18]/5 pb-6">
                <div>
                  <h1 className="text-2xl font-black text-brand-dark tracking-tight">
                    {activeTab === "overview"      && "Studio Management & Overview"}
                    {activeTab === "floorplan"     && "AI Floor Plan Generator"}
                    {activeTab === "boq"           && "Interactive BoQ Template Builder"}
                    {activeTab === "scanAnalyzer"  && "AI Plan Analyzer & BOQ Generator"}
                    {activeTab === "files"         && "Shared Drawings & Design Files"}
                    {activeTab === "messages"      && `Client Messages: ${activeClient.name}`}
                    {activeTab === "settings"      && "Studio Profile Configurations"}
                  </h1>
                  <p className="text-xs text-brand-dark/50 mt-1 max-w-2xl font-semibold leading-relaxed">
                    {activeTab === "overview"      && "Track client project milestones, coordinate shared folders, and review requests."}
                    {activeTab === "floorplan"     && "Generate optimized 2D/3D floor layouts using AI. Adjust rooms, styles, and prompt parameters."}
                    {activeTab === "boq"           && "Adjust structural masonry rates, coordinate markups, and construct standard cost models."}
                    {activeTab === "scanAnalyzer"  && "Upload a floor plan image or PDF — AI extracts dimensions, walls, roof & foundation, then auto-generates a full BOQ ready to send to your client."}
                    {activeTab === "files"         && "Maintain blueprints, upload rendering proposals, and audit client structural specs."}
                    {activeTab === "messages"      && "Coordinate client alignment meetings, verify layout changes, and clarify budgets."}
                    {activeTab === "settings"      && "Configure studio portfolio descriptions, active location settings, and studio credentials."}
                  </p>
                </div>
              </div>

              {/* TAB CONTENTS */}

          {/* 1. OVERVIEW & CLIENTS TAB */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
              
              {/* Clients directory grid */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-brand-dark/5 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-brand-dark/5">
                    <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
                      <Users className="h-5 w-5 text-brand-gold" />
                      Active Client Directory
                    </h3>
                    <p className="text-xs text-brand-dark/50">Manage your connected homeowners and build locations.</p>
                  </div>

                  <div className="divide-y divide-brand-dark/5">
                    {clients.map((client) => {
                      const isActive = selectedClientId === client.id;
                      return (
                        <div 
                          key={client.id}
                          className={`p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${isActive ? "bg-brand-gold/5 border-l-4 border-l-brand-gold" : "hover:bg-brand-gold/5"}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-brand-dark">{client.name}</h4>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/25 uppercase">
                                {client.status}
                              </span>
                            </div>
                            <span className="text-xs text-brand-dark/50 font-bold block">{client.project}</span>
                            <span className="text-[10px] text-brand-dark/45 font-semibold flex items-center gap-1 mt-1.5">
                              <MapPin className="h-3 w-3 text-brand-gold" />
                              {client.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedClientId(client.id);
                                setActiveTab("messages");
                              }}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-dark/5 hover:bg-brand-dark/10 px-4 py-2.5 text-xs font-black text-brand-dark transition-all border border-brand-dark/5 cursor-pointer shadow-sm"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Message
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClientId(client.id);
                                showToast(`Loaded project file workspace for ${client.name}.`);
                              }}
                              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer shadow-md ${isActive ? "bg-brand-gold text-white" : "bg-white border border-brand-dark/10 text-brand-dark"}`}
                            >
                              Select Client
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Saved & Sent Quotes Directory */}
                <div className="bg-white border border-brand-dark/5 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-brand-dark/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
                        <History className="h-5 w-5 text-brand-gold" />
                        Saved &amp; Sent BOQ Quotes
                      </h3>
                      <p className="text-xs text-brand-dark/50">Load, review, or edit client BoQ statements and drafts.</p>
                    </div>
                  </div>

                  <div className="divide-y divide-brand-dark/5">
                    {sentQuotesList.length === 0 ? (
                      <div className="p-8 text-center text-xs text-brand-dark/40 font-semibold uppercase tracking-widest">
                        No saved quotes found
                      </div>
                    ) : (
                      sentQuotesList.map((quote) => (
                        <div key={quote.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-brand-gold/5 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-brand-dark">{quote.clientName}</h4>
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/25 uppercase">
                                ${quote.total.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-xs text-brand-dark/50 font-bold block truncate max-w-[250px]">
                              File: {quote.fileName || "Scanned Plan"} ({quote.area} m²)
                            </span>
                            <span className="text-[10px] text-brand-dark/45 font-semibold block mt-1">
                              Saved: {new Date(quote.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleLoadSavedQuote(quote)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-gold text-white px-4 py-2.5 text-xs font-black hover:bg-brand-gold-dark transition-all cursor-pointer shadow-md"
                            >
                              <FileText className="h-4 w-4" />
                              Load &amp; Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSavedQuote(quote.id)}
                              className="p-2.5 rounded-xl hover:bg-rose-500/10 text-brand-dark/40 hover:text-rose-500 transition-all cursor-pointer border border-transparent hover:border-rose-500/10"
                              title="Delete quote"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar stats panel */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Stats cards grid */}
                <div className="bg-brand-dark text-white rounded-3xl p-6 lg:p-8 space-y-5 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-brand-gold/15 rounded-bl-full pointer-events-none" />
                  
                  <h3 className="font-black text-sm tracking-tight border-b border-white/10 pb-3 flex items-center gap-2">
                    <Compass className="h-4.5 w-4.5 text-brand-gold" />
                    Studio Snapshot
                  </h3>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white/60">Active Homeowners</span>
                      <span className="font-extrabold text-white">3 Projects</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-white/60">Total Budget Value</span>
                      <span className="font-extrabold text-white">$520,000</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-white/60">Shared Layouts</span>
                      <span className="font-extrabold text-white">{sharedFiles.length} Drawings</span>
                    </div>
                  </div>
                </div>

                {/* Milestone review card */}
                <div className="bg-white border border-brand-dark/5 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-black text-sm text-brand-dark flex items-center gap-2 border-b border-brand-dark/5 pb-3 flex items-center">
                    <Clock className="h-4.5 w-4.5 text-brand-gold" />
                    Selected Client: {activeClient.name}
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-brand-dark/50">Location:</span>
                      <span className="font-bold text-brand-dark">{activeClient.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/50">Budget:</span>
                      <span className="font-bold text-brand-dark">${activeClient.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-dark/50">Joined:</span>
                      <span className="font-bold text-brand-dark">{activeClient.dateConnected}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* AI FLOOR PLAN GENERATOR TAB */}
          {activeTab === "floorplan" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
              
              {/* Left Side: Sidebar Control Panel */}
              <div className="lg:col-span-4 bg-white border border-brand-dark/5 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Rooms selection section */}
                <div>
                  <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider mb-4">Rooms</h3>
                  <div className="space-y-3.5">
                    {/* Bedroom counter */}
                    <div className="flex items-center justify-between bg-[#FAF7F0]/60 border border-brand-dark/5 px-4 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛏️</span>
                        <span className="text-xs font-bold text-brand-dark/80">Bedroom</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setRooms(prev => ({ ...prev, bedroom: Math.max(1, prev.bedroom - 1) }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-brand-dark/10 hover:border-brand-gold text-brand-dark text-xs font-bold transition-colors cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-brand-dark w-4 text-center">{rooms.bedroom}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(prev => ({ ...prev, bedroom: prev.bedroom + 1 }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-brand-dark/10 hover:border-brand-gold text-brand-dark text-xs font-bold transition-colors cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Living Room counter */}
                    <div className="flex items-center justify-between bg-[#FAF7F0]/60 border border-brand-dark/5 px-4 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛋️</span>
                        <span className="text-xs font-bold text-brand-dark/80">Living Room</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setRooms(prev => ({ ...prev, livingRoom: Math.max(1, prev.livingRoom - 1) }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-brand-dark/10 hover:border-brand-gold text-brand-dark text-xs font-bold transition-colors cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-brand-dark w-4 text-center">{rooms.livingRoom}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(prev => ({ ...prev, livingRoom: prev.livingRoom + 1 }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-brand-dark/10 hover:border-brand-gold text-brand-dark text-xs font-bold transition-colors cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Bathroom counter */}
                    <div className="flex items-center justify-between bg-[#FAF7F0]/60 border border-brand-dark/5 px-4 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛁</span>
                        <span className="text-xs font-bold text-brand-dark/80">Bathroom</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setRooms(prev => ({ ...prev, bathroom: Math.max(1, prev.bathroom - 1) }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-brand-dark/10 hover:border-brand-gold text-brand-dark text-xs font-bold transition-colors cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-brand-dark w-4 text-center">{rooms.bathroom}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(prev => ({ ...prev, bathroom: prev.bathroom + 1 }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-brand-dark/10 hover:border-brand-gold text-brand-dark text-xs font-bold transition-colors cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Dining Room counter */}
                    <div className="flex items-center justify-between bg-[#FAF7F0]/60 border border-brand-dark/5 px-4 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🍽️</span>
                        <span className="text-xs font-bold text-brand-dark/80">Dining Room</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setRooms(prev => ({ ...prev, diningRoom: Math.max(0, prev.diningRoom - 1) }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-brand-dark/10 hover:border-brand-gold text-brand-dark text-xs font-bold transition-colors cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-brand-dark w-4 text-center">{rooms.diningRoom}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(prev => ({ ...prev, diningRoom: prev.diningRoom + 1 }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-brand-dark/10 hover:border-brand-gold text-brand-dark text-xs font-bold transition-colors cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Kitchen type toggle */}
                    <div className="flex items-center justify-between bg-[#FAF7F0]/60 border border-brand-dark/5 px-4 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🍳</span>
                        <span className="text-xs font-bold text-brand-dark/80">Kitchen</span>
                      </div>
                      <div className="flex bg-white border border-brand-dark/10 rounded-lg p-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setRooms(prev => ({ ...prev, kitchen: "open" }))}
                          className={`px-3 py-1 text-[10px] font-extrabold rounded-md cursor-pointer transition-all ${rooms.kitchen === "open" ? "bg-brand-dark text-white shadow-sm" : "text-brand-dark/60 hover:text-brand-dark"}`}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => setRooms(prev => ({ ...prev, kitchen: "closed" }))}
                          className={`px-3 py-1 text-[10px] font-extrabold rounded-md cursor-pointer transition-all ${rooms.kitchen === "closed" ? "bg-brand-dark text-white shadow-sm" : "text-brand-dark/60 hover:text-brand-dark"}`}
                        >
                          Closed
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gross Area section */}
                <div>
                  <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider mb-3">Gross Area</h3>
                  <div className="flex items-center gap-2 bg-[#FAF7F0]/60 border border-brand-dark/5 p-2 rounded-xl">
                    <input
                      type="number"
                      value={grossArea}
                      onChange={(e) => setGrossArea(Math.max(10, parseInt(e.target.value) || 0))}
                      className="flex-grow bg-white border border-brand-dark/10 focus:border-brand-gold focus:outline-none rounded-lg px-3 py-2 text-xs font-bold text-brand-dark shadow-sm text-center"
                    />
                    <div className="flex bg-white border border-brand-dark/10 rounded-lg p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setAreaUnit("metric")}
                        className={`px-2.5 py-1.5 text-[10px] font-extrabold rounded-md cursor-pointer transition-all ${areaUnit === "metric" ? "bg-brand-dark text-white" : "text-brand-dark/60 hover:text-brand-dark"}`}
                      >
                        m²
                      </button>
                      <button
                        type="button"
                        onClick={() => setAreaUnit("imperial")}
                        className={`px-2.5 py-1.5 text-[10px] font-extrabold rounded-md cursor-pointer transition-all ${areaUnit === "imperial" ? "bg-brand-dark text-white" : "text-brand-dark/60 hover:text-brand-dark"}`}
                      >
                        sq ft
                      </button>
                    </div>
                  </div>
                </div>

                {/* Style selection section */}
                <div>
                  <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider mb-3">Style</h3>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Technical style card */}
                    <button
                      type="button"
                      onClick={() => setFloorStyle("technical")}
                      className={`flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all cursor-pointer ${floorStyle === "technical" ? "border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold" : "border-brand-dark/5 hover:border-brand-gold/30 bg-[#FAF7F0]/40"}`}
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-white border border-brand-dark/5 mb-2 flex items-center justify-center p-1">
                        <img src="/assets/floorplan_technical.png" alt="Technical thumbnail" className="w-full h-full object-cover rounded-md" />
                      </div>
                      <span className="text-[10px] font-black text-brand-dark uppercase tracking-wider">Technical</span>
                    </button>

                    {/* 2.5D style card */}
                    <button
                      type="button"
                      onClick={() => setFloorStyle("2.5D")}
                      className={`flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all cursor-pointer ${floorStyle === "2.5D" ? "border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold" : "border-brand-dark/5 hover:border-brand-gold/30 bg-[#FAF7F0]/40"}`}
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-white border border-brand-dark/5 mb-2 flex items-center justify-center p-1">
                        <img src="/assets/floorplan_25d.png" alt="2.5D thumbnail" className="w-full h-full object-cover rounded-md" />
                      </div>
                      <span className="text-[10px] font-black text-brand-dark uppercase tracking-wider">2.5D</span>
                    </button>

                    {/* 3D style card */}
                    <button
                      type="button"
                      onClick={() => setFloorStyle("3D")}
                      className={`flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all cursor-pointer ${floorStyle === "3D" ? "border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold" : "border-brand-dark/5 hover:border-brand-gold/30 bg-[#FAF7F0]/40"}`}
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-white border border-brand-dark/5 mb-2 flex items-center justify-center p-1">
                        <img src="/assets/floorplan_3d.png" alt="3D thumbnail" className="w-full h-full object-cover rounded-md" />
                      </div>
                      <span className="text-[10px] font-black text-brand-dark uppercase tracking-wider">3D Layout</span>
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio selector */}
                <div>
                  <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider mb-2">Aspect Ratio</h3>
                  <div className="relative">
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full text-xs font-bold text-brand-dark bg-[#FAF7F0]/60 border border-brand-dark/5 rounded-xl px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-sm"
                    >
                      <option value="3:2">3:2 (Standard Layout)</option>
                      <option value="4:3">4:3 (Traditional Layout)</option>
                      <option value="16:9">16:9 (Panoramic/Wide Layout)</option>
                      <option value="1:1">1:1 (Square Layout)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-dark/50 text-xs">▼</div>
                  </div>
                </div>

                {/* Prompt textarea input */}
                <div>
                  <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider mb-2">Prompt (Optional)</h3>
                  <textarea
                    rows={3}
                    placeholder="e.g. Cozy modern apartment with bright natural light, simple décor, and calming color accents."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-[#FAF7F0]/60 border border-brand-dark/5 rounded-xl px-4 py-3 text-xs font-semibold text-brand-dark placeholder:text-brand-dark/35 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-inner resize-none"
                  />
                </div>

                {/* Submit action button */}
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => {
                    setIsGenerating(true);
                    setGeneratingStep(0);
                    setGenerationProgress(0);
                    
                    // Progressive simulation
                    const stepIntervals = [
                      { text: "Parsing room constraints & aspect ratio...", progress: 25, duration: 1000 },
                      { text: "Synthesizing structural walls & pathways...", progress: 50, duration: 1500 },
                      { text: "Populating interior furniture & fixtures...", progress: 75, duration: 1200 },
                      { text: "Rendering material textures & shadows...", progress: 100, duration: 1000 }
                    ];
                    
                    const runStep = (idx) => {
                      if (idx >= stepIntervals.length) {
                        setTimeout(() => {
                          setIsGenerating(false);
                          let imgPath = "/assets/floorplan_3d.png";
                          if (floorStyle === "technical") imgPath = "/assets/floorplan_technical.png";
                          else if (floorStyle === "2.5D") imgPath = "/assets/floorplan_25d.png";
                          setCurrentPlanImage(imgPath);
                          showToast("AI Floor Plan generated successfully!");
                        }, 500);
                        return;
                      }
                      
                      setGeneratingStep(idx);
                      setGenerationProgress(stepIntervals[idx].progress);
                      
                      setTimeout(() => {
                        runStep(idx + 1);
                      }, stepIntervals[idx].duration);
                    };
                    
                    runStep(0);
                  }}
                  className="w-full bg-brand-dark hover:bg-brand-gold hover:shadow-brand-gold/15 text-white rounded-xl py-3.5 px-6 font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-4 w-4 text-brand-gold animate-pulse" />
                  <span>{isGenerating ? "Synthesizing Layout..." : "Creator Floor Plan"}</span>
                </button>
              </div>

              {/* Right Side: Preview Panel */}
              <div className="lg:col-span-8 bg-gradient-to-tr from-[#FAF7F0] to-white border border-brand-dark/5 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col h-[700px] overflow-hidden relative group">
                <div className="absolute inset-0 opacity-2 bg-[radial-gradient(#b38e42_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-brand-dark/5 pb-4 mb-6 z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-gold font-extrabold tracking-widest text-lg">AI</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                    <h3 className="text-xs font-black text-brand-dark/50 uppercase tracking-widest">Floor Plan Generator</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
                    <span className="text-[10px] font-extrabold text-brand-dark/40 uppercase tracking-wider">Ready to Generate</span>
                  </div>
                </div>

                {/* Sub-grid of Generation Steps & Rendering Canvas */}
                <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch min-h-0 z-10">
                  
                  {/* Left steps preview sidebar */}
                  <div className="md:col-span-2 flex flex-row md:flex-col justify-between md:justify-start gap-3">
                    <div className="flex-1 flex flex-col items-center">
                      <div className={`w-full aspect-[4/3] md:aspect-square rounded-xl border flex flex-col items-center justify-center p-1 bg-white shadow-sm overflow-hidden transition-all duration-300 ${isGenerating && generatingStep >= 0 ? "border-brand-gold ring-1 ring-brand-gold" : "border-brand-dark/5"}`}>
                        <div className="w-full h-full relative group/img bg-[#FAF7F0] rounded-lg overflow-hidden flex items-center justify-center">
                          <span className="text-lg">✏️</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-black text-brand-dark/50 uppercase tracking-wider mt-1.5">1. Sketch</span>
                    </div>

                    <div className="hidden md:flex flex-col items-center py-1.5">
                      <div className="h-5 w-px border-l-2 border-dashed border-brand-dark/15" />
                    </div>

                    <div className="flex-1 flex flex-col items-center">
                      <div className={`w-full aspect-[4/3] md:aspect-square rounded-xl border flex flex-col items-center justify-center p-1 bg-white shadow-sm overflow-hidden transition-all duration-300 ${isGenerating && generatingStep >= 1 ? "border-brand-gold ring-1 ring-brand-gold" : "border-brand-dark/5"}`}>
                        <div className="w-full h-full relative group/img bg-[#FAF7F0] rounded-lg overflow-hidden flex items-center justify-center">
                          <span className="text-lg">🧱</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-black text-brand-dark/50 uppercase tracking-wider mt-1.5">2. Walls</span>
                    </div>

                    <div className="hidden md:flex flex-col items-center py-1.5">
                      <div className="h-5 w-px border-l-2 border-dashed border-brand-dark/15" />
                    </div>

                    <div className="flex-1 flex flex-col items-center">
                      <div className={`w-full aspect-[4/3] md:aspect-square rounded-xl border flex flex-col items-center justify-center p-1 bg-white shadow-sm overflow-hidden transition-all duration-300 ${isGenerating && generatingStep >= 2 ? "border-brand-gold ring-1 ring-brand-gold" : "border-brand-dark/5"}`}>
                        <div className="w-full h-full relative group/img bg-[#FAF7F0] rounded-lg overflow-hidden flex items-center justify-center">
                          <span className="text-lg">🛋️</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-black text-brand-dark/50 uppercase tracking-wider mt-1.5">3. Furniture</span>
                    </div>
                  </div>

                  {/* Main Canvas rendering frame */}
                  <div className="md:col-span-10 bg-white border border-brand-dark/5 rounded-3xl overflow-hidden relative flex items-center justify-center shadow-inner group/canvas min-h-[300px]">
                    
                    {/* Background grid */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#201b12_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

                    {isGenerating ? (
                      /* Rendering overlay loading state */
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 space-y-6 animate-in fade-in duration-300">
                        {/* Glowing radial wave */}
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full bg-brand-gold/10 border-2 border-brand-gold/30 animate-ping" style={{ animationDuration: "1.5s" }} />
                          <div className="absolute inset-2 rounded-full bg-brand-gold/20 border border-brand-gold/40 animate-pulse" />
                          <div className="relative w-14 h-14 rounded-full bg-brand-dark border border-brand-gold/30 flex items-center justify-center shadow-lg">
                            <Sparkles className="h-6 w-6 text-brand-gold animate-spin" style={{ animationDuration: "3s" }} />
                          </div>
                        </div>
                        
                        <div className="text-center space-y-2 max-w-sm">
                          <h4 className="text-sm font-black text-brand-dark tracking-tight">
                            {generatingStep === 0 && "Analyzing spatial design matrix..."}
                            {generatingStep === 1 && "Extrapolating wall dimensions..."}
                            {generatingStep === 2 && "Synthesizing interior floor configurations..."}
                            {generatingStep === 3 && "Adding premium shadows & light raytracing..."}
                          </h4>
                          <p className="text-[10px] text-brand-dark/50 font-semibold tracking-wide">
                            Generating a custom {rooms.bedroom}BR apartment layout ({grossArea} {areaUnit === "metric" ? "m²" : "sq ft"} • {floorStyle} Style)
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-64 space-y-2">
                          <div className="h-1.5 w-full bg-brand-dark/5 rounded-full overflow-hidden shadow-inner border border-brand-dark/5">
                            <div 
                              className="h-full bg-brand-gold transition-all duration-500 ease-out shadow-sm"
                              style={{ width: `${generationProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-black text-brand-dark/55">
                            <span>{generationProgress}% COMPLETED</span>
                            <span>Region: Phnom Penh Index</span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Floor Plan Display Image */}
                    <div className="w-full h-full relative flex items-center justify-center p-4">
                      <img 
                        src={currentPlanImage} 
                        alt="AI Floor Plan Layout" 
                        className={`max-w-full max-h-full object-contain rounded-2xl shadow-md transition-all duration-700 ease-out transform ${isGenerating ? "scale-95 opacity-50 blur-sm" : "scale-100 opacity-100 blur-0"}`} 
                      />
                    </div>

                    {/* Floating circular icon controls at bottom of canvas */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-brand-dark/5 rounded-full px-4 py-2 flex items-center gap-3.5 shadow-lg opacity-80 hover:opacity-100 transition-opacity duration-300 z-10">
                      <button type="button" onClick={() => showToast("Showing furniture templates")} title="Living furniture" className="w-7.5 h-7.5 rounded-full bg-[#FAF7F0] hover:bg-brand-gold/15 text-brand-dark text-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95">🛋️</button>
                      <button type="button" onClick={() => showToast("Showing bedroom layout configurations")} title="Bed configurations" className="w-7.5 h-7.5 rounded-full bg-[#FAF7F0] hover:bg-brand-gold/15 text-brand-dark text-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95">🛏️</button>
                      <button type="button" onClick={() => showToast("Showing cabinet layouts")} title="Cabinets & drawers" className="w-7.5 h-7.5 rounded-full bg-[#FAF7F0] hover:bg-brand-gold/15 text-brand-dark text-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95">🗄️</button>
                      <button type="button" onClick={() => showToast("Showing bathroom fixtures")} title="Bathroom fixtures" className="w-7.5 h-7.5 rounded-full bg-[#FAF7F0] hover:bg-brand-gold/15 text-brand-dark text-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95">🛀</button>
                      <button type="button" onClick={() => showToast("Showing indoor landscape items")} title="Decor & plants" className="w-7.5 h-7.5 rounded-full bg-[#FAF7F0] hover:bg-brand-gold/15 text-brand-dark text-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95">🪴</button>
                    </div>
                  </div>

                </div>

                {/* Bottom Canvas Toolbar - Export / Download */}
                <div className="border-t border-brand-dark/5 pt-4 mt-4 flex justify-between items-center z-10">
                  <span className="text-[10px] text-brand-dark/45 font-bold flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-brand-gold" />
                    Layout matches design specifications for a {rooms.bedroom}BR house.
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => showToast("Downloading layout files...")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-brand-dark/10 hover:border-brand-gold px-4 py-2.5 text-xs font-black text-brand-dark hover:text-brand-gold transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Pack</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => showToast("Layout plan successfully linked to client files!")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-white px-4 py-2.5 text-xs font-black shadow-sm transition-all cursor-pointer"
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span>Assign to Workspace</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 2. BOQ TEMPLATE BUILDER TAB */}
          {activeTab === "boq" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Material Rates Table */}
              <div className="bg-white border border-brand-dark/5 rounded-3xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-dark/5 px-6 py-5">
                  <div>
                    <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
                      <Grid className="h-5 w-5 text-brand-gold" />
                      Cost Template Manager
                    </h3>
                    <p className="text-xs text-brand-dark/50">Set standard material unit prices, quantities, and overhead markup percentages.</p>
                  </div>
                  <div className="bg-[#FAF7F0] border border-brand-dark/5 px-4 py-2.5 rounded-2xl shadow-inner text-xs font-black text-brand-dark">
                    Est. Grand Total: <span className="text-brand-gold ml-1 bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/20">${Math.round(calculateGrandTotal()).toLocaleString()}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F0]/60 border-b border-brand-dark/5 text-left">
                        <th className="px-6 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider">Material / Structural Item</th>
                        <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Unit</th>
                        <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Unit Rate ($)</th>
                        <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Quantity</th>
                        <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Markup (%)</th>
                        <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-right">Aggregate</th>
                        <th className="px-6 py-4 text-[10px] font-black text-brand-dark/60 tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark/5">
                      {boqMaterials.map((item) => (
                        <tr key={item.id} className="hover:bg-brand-gold/5 transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateMaterialField(item.id, "name", e.target.value)}
                              className="w-full text-xs font-extrabold text-brand-dark bg-transparent border border-transparent hover:bg-brand-dark/5 focus:bg-[#FAF7F0] focus:border-brand-gold/20 rounded-lg px-2 py-1.5 focus:outline-none transition-all shadow-none focus:shadow-inner"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => updateMaterialField(item.id, "unit", e.target.value)}
                              className="w-16 text-center text-xs font-semibold text-brand-dark bg-transparent border border-transparent hover:bg-brand-dark/5 focus:bg-[#FAF7F0] focus:border-brand-gold/20 rounded-lg px-1 py-1 focus:outline-none transition-all"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center">
                              <input
                                type="number"
                                step="0.01"
                                value={item.rate}
                                onChange={(e) => updateMaterialField(item.id, "rate", e.target.value)}
                                className="w-20 text-center text-xs font-extrabold text-brand-dark bg-brand-dark/5 focus:bg-white border border-brand-dark/10 focus:border-brand-gold rounded-xl py-2 focus:outline-none transition-all shadow-inner"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center">
                              <input
                                type="number"
                                step="0.1"
                                value={item.quantity}
                                onChange={(e) => updateMaterialField(item.id, "quantity", e.target.value)}
                                className="w-20 text-center text-xs font-extrabold text-brand-dark bg-brand-dark/5 focus:bg-white border border-brand-dark/10 focus:border-brand-gold rounded-xl py-2 focus:outline-none transition-all shadow-inner"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                value={item.markup}
                                onChange={(e) => updateMaterialField(item.id, "markup", e.target.value)}
                                className="w-14 text-center text-xs font-extrabold text-brand-dark bg-brand-dark/5 focus:bg-white border border-brand-dark/10 focus:border-brand-gold rounded-xl py-2 focus:outline-none transition-all shadow-inner"
                              />
                              <span className="text-[10px] text-brand-dark/40 font-bold">%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-xs font-black text-brand-dark">
                              ${Math.round(calculateMaterialTotal(item)).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deleteMaterial(item.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center border border-transparent hover:border-rose-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add new item form row */}
                <form onSubmit={handleAddMaterial} className="bg-[#FAF7F0]/40 border-t border-brand-dark/5 px-6 py-5 flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[9px] font-black text-brand-dark/50 uppercase tracking-wider mb-2">Item Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Roof Shingles (Standard)"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full text-xs bg-white border border-brand-dark/10 rounded-xl px-4 py-3 font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-sm"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[9px] font-black text-brand-dark/50 uppercase tracking-wider mb-2">Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="bags, m², pcs"
                      value={newMaterial.unit}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full text-xs bg-white border border-brand-dark/10 rounded-xl px-4 py-3 font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-sm text-center"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-[9px] font-black text-brand-dark/50 uppercase tracking-wider mb-2">Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newMaterial.rate || ""}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, rate: e.target.value }))}
                      className="w-full text-xs bg-white border border-brand-dark/10 rounded-xl px-4 py-3 font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-sm text-center"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-[9px] font-black text-brand-dark/50 uppercase tracking-wider mb-2">Quantity</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newMaterial.quantity || ""}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full text-xs bg-white border border-brand-dark/10 rounded-xl px-4 py-3 font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-sm text-center"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark px-5 py-3 text-xs font-extrabold text-white transition-all shadow-md hover:shadow-lg cursor-pointer transform active:scale-97"
                    >
                      <Plus className="h-4 w-4" />
                      Add to BoQ
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* PLAN ANALYZER TAB */}
          {activeTab === "scanAnalyzer" && (
            <div className="animate-in fade-in duration-300">

              {/* ── Quote Modal Overlay ─────────────────────────────── */}
              {showQuoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 space-y-6 border border-brand-dark/5 relative animate-in zoom-in-95 duration-200">
                    <button
                      onClick={() => setShowQuoteModal(false)}
                      className="absolute top-4 right-4 p-2 rounded-full hover:bg-brand-dark/5 text-brand-dark/40 hover:text-brand-dark transition-all cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                          <Send className="h-4.5 w-4.5 text-brand-gold" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-brand-dark">Send Quote to Client</h3>
                          <p className="text-xs text-brand-dark/50">Review details before sending.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-brand-dark/50 uppercase tracking-wider mb-2">Select Client</label>
                        <div className="relative">
                          <select
                            value={scanQuoteClientId}
                            onChange={(e) => setScanQuoteClientId(e.target.value)}
                            className="w-full text-xs font-bold text-brand-dark bg-[#FAF7F0] border border-brand-dark/10 rounded-xl px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-sm"
                          >
                            {clients.map(c => (
                              <option key={c.id} value={c.id}>{c.name} — {c.project}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-dark/40 text-xs">▼</div>
                        </div>
                      </div>

                      <div className="bg-[#FAF7F0] border border-brand-dark/5 rounded-2xl p-4 space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-brand-dark/55 font-semibold">Floor Plan File</span>
                          <span className="font-extrabold text-brand-dark truncate max-w-[55%] text-right">{scanFile?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-dark/55 font-semibold">Analyzed Area</span>
                          <span className="font-extrabold text-brand-dark">{scanResults?.area} m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-dark/55 font-semibold">Total BOQ Line Items</span>
                          <span className="font-extrabold text-brand-dark">{scanBoq.length} items</span>
                        </div>
                        <div className="h-px bg-brand-dark/10" />
                        <div className="flex justify-between items-center">
                          <span className="text-brand-dark/55 font-semibold">Estimated Grand Total</span>
                          <span className="font-black text-brand-gold text-base">${Math.round(calculateScanBoqTotal()).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-dark/55 font-semibold">Quote Date</span>
                          <span className="font-extrabold text-brand-dark">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => setShowQuoteModal(false)}
                        className="flex-1 py-3 rounded-xl border border-brand-dark/10 text-xs font-black text-brand-dark hover:bg-brand-dark/5 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const selectedClient = clients.find(c => c.id === scanQuoteClientId);
                          const quote = {
                            id: `q_${Date.now()}`,
                            clientId: scanQuoteClientId,
                            clientName: selectedClient?.name,
                            fileName: scanFile?.name,
                            area: scanResults?.area,
                            total: Math.round(calculateScanBoqTotal()),
                            boq: scanBoq,
                            sentAt: new Date().toISOString(),
                          };
                          const existing = JSON.parse(localStorage.getItem("domnak_sent_quotes") || "[]");
                          const updated = [quote, ...existing];
                          localStorage.setItem("domnak_sent_quotes", JSON.stringify(updated));
                          setSentQuotesList(updated);
                          setShowQuoteModal(false);
                          showToast(`✅ Quote sent to ${selectedClient?.name}!`);
                        }}
                        className="flex-1 py-3 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Confirm & Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Phase 1: Empty upload zone ──────────────────────── */}
              {!scanFile && !isScanAnalyzing && !scanResults && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-white border border-brand-dark/5 rounded-3xl p-8 lg:p-10 shadow-sm text-center space-y-7">

                    <div className="space-y-3">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mx-auto shadow-sm">
                        <ScanLine className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-black text-brand-dark tracking-tight">Upload a Floor Plan</h3>
                      <p className="text-sm text-brand-dark/60 max-w-sm mx-auto leading-relaxed">
                        Our AI reads dimensions, walls, roof geometry, and foundation to instantly generate a full Bill of Quantities.
                      </p>
                    </div>

                    <label
                      className="flex flex-col items-center justify-center border-2 border-dashed border-brand-gold/40 hover:border-brand-gold bg-[#FAF7F0]/50 hover:bg-[#FAF7F0] rounded-2xl p-10 cursor-pointer transition-all duration-300 group shadow-inner"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleScanDrop}
                    >
                      <div className="h-14 w-14 rounded-2xl bg-white border border-brand-gold/20 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:border-brand-gold/50 transition-all">
                        <UploadCloud className="h-7 w-7 text-brand-gold group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-sm font-black text-brand-dark mb-1">Drag & drop your floor plan here</span>
                      <span className="text-xs text-brand-dark/40 font-semibold">or click to browse files</span>
                      <span className="text-[10px] text-brand-dark/30 mt-4 bg-brand-dark/5 px-5 py-1.5 rounded-full font-bold tracking-wide uppercase">PDF — Max 30 MB</span>
                      <input type="file" className="hidden" accept=".pdf" onChange={handleScanFileChange} />
                    </label>


                  </div>
                </div>
              )}

              {/* ── Phase 1b: File selected, ready to analyze ───────── */}
              {scanFile && !isScanAnalyzing && !scanResults && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* File preview card */}
                  <div className="lg:col-span-5 bg-white border border-brand-dark/5 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-brand-dark/5 pb-4">
                      <h3 className="text-sm font-black text-brand-dark flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-brand-gold" />
                        Uploaded Floor Plan
                      </h3>
                      <button
                        onClick={resetScanState}
                        className="p-1.5 rounded-lg hover:bg-brand-dark/5 text-brand-dark/40 hover:text-rose-500 transition-all cursor-pointer"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="aspect-video bg-[#FAF7F0] border border-brand-dark/5 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                      {scanFile.previewUrl ? (
                        <img src={scanFile.previewUrl} alt="Floor Plan Preview" className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-brand-dark/40">
                          <FileText className="h-14 w-14 text-brand-gold/50" />
                          <span className="text-xs font-black text-brand-dark/50 uppercase tracking-widest">PDF Document</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#FAF7F0] rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-brand-dark/50 font-semibold">File name</span>
                        <span className="font-extrabold text-brand-dark truncate max-w-[55%] text-right">{scanFile.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-dark/50 font-semibold">File type</span>
                        <span className="font-extrabold text-brand-dark uppercase">{scanFile.type.includes("pdf") ? "PDF" : "Image"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-dark/50 font-semibold">File size</span>
                        <span className="font-extrabold text-brand-dark">{scanFile.size}</span>
                      </div>
                    </div>

                    <label className="flex items-center justify-center gap-2 text-xs font-bold text-brand-dark/35 hover:text-brand-gold cursor-pointer transition-colors group">
                      <RotateCcw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
                      Change file
                      <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" onChange={handleScanFileChange} />
                    </label>
                  </div>

                  {/* Analysis pipeline info + CTA */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="bg-white border border-brand-dark/5 rounded-3xl p-6 shadow-sm space-y-5">
                      <h3 className="text-sm font-black text-brand-dark border-b border-brand-dark/5 pb-3 flex items-center gap-2">
                        <ScanLine className="h-4 w-4 text-brand-gold" />
                        AI Analysis Pipeline
                      </h3>
                      <div className="space-y-3">
                        {[
                          { step: "01", label: "File Structure & Orientation",       desc: "Reads scale, page size, and orientation markers" },
                          { step: "02", label: "Wall, Door & Window Detection",       desc: "Identifies structural and partition lines" },
                          { step: "03", label: "Area & Roof Geometry Computation",   desc: "Calculates m² per zone + roof slope estimates" },
                          { step: "04", label: "BOQ Auto-Generation",                desc: "Maps extracted metrics to material cost formulas" },
                        ].map(item => (
                          <div key={item.step} className="flex items-start gap-4 p-3.5 bg-[#FAF7F0]/60 border border-brand-dark/5 rounded-xl">
                            <span className="text-[10px] font-black text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-lg px-2 py-1 min-w-[28px] text-center mt-0.5">{item.step}</span>
                            <div>
                              <p className="text-xs font-black text-brand-dark">{item.label}</p>
                              <p className="text-[10px] text-brand-dark/45 font-semibold mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      id="btn-analyze-floor-plan"
                      onClick={handleScanAnalyze}
                      className="w-full bg-brand-dark hover:bg-brand-gold text-white rounded-2xl py-4 px-6 font-extrabold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer transform active:scale-97 text-sm group"
                    >
                      <ScanLine className="h-5 w-5 text-brand-gold group-hover:text-white transition-colors" />
                      Analyze Floor Plan &amp; Generate BOQ
                    </button>
                  </div>
                </div>
              )}

              {/* ── Phase 2: Analysis animation ─────────────────────── */}
              {isScanAnalyzing && (
                <div className="flex items-center justify-center min-h-[500px]">
                  <div className="bg-white border border-brand-dark/5 rounded-3xl p-10 lg:p-14 shadow-sm max-w-lg w-full space-y-8 text-center animate-in fade-in duration-300">

                    {/* Pulsing radial orb */}
                    <div className="relative w-28 h-28 flex items-center justify-center mx-auto">
                      <div className="absolute inset-0 rounded-full bg-brand-gold/10 border-2 border-brand-gold/20 animate-ping" style={{ animationDuration: "2s" }} />
                      <div className="absolute inset-3 rounded-full bg-brand-gold/15 border border-brand-gold/30 animate-pulse" />
                      <div className="relative w-16 h-16 rounded-full bg-brand-dark border border-brand-gold/30 flex items-center justify-center shadow-xl">
                        <ScanLine className="h-7 w-7 text-brand-gold animate-spin" style={{ animationDuration: "4s" }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-black text-brand-dark tracking-tight">
                        {scanStep === 0 && "Reading file structure & orientation..."}
                        {scanStep === 1 && "Detecting walls, doors & window openings..."}
                        {scanStep === 2 && "Computing floor area & roof geometry..."}
                        {scanStep === 3 && "Generating Bill of Quantities..."}
                      </h4>
                      <p className="text-xs text-brand-dark/50 font-semibold">Step {scanStep + 1} of 4 &mdash; {scanFile?.name}</p>
                    </div>

                    {/* Dot step indicator */}
                    <div className="flex items-center justify-center gap-2">
                      {[0, 1, 2, 3].map(s => (
                        <div
                          key={s}
                          className={`rounded-full transition-all duration-500 ${
                            s === scanStep ? "w-6 h-2.5 bg-brand-gold" :
                            s < scanStep  ? "w-2.5 h-2.5 bg-brand-gold/50" :
                                            "w-2.5 h-2.5 bg-brand-dark/10"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-brand-dark/5 rounded-full overflow-hidden border border-brand-dark/5">
                        <div
                          className="h-full bg-gradient-to-r from-brand-gold/80 to-brand-gold transition-all duration-500 ease-out rounded-full shadow-sm"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-black text-brand-dark/40">
                        <span>{scanProgress}% COMPLETE</span>
                        <span>AI Analysis Engine</span>
                      </div>
                    </div>

                    {/* Step checklist */}
                    <div className="text-left space-y-2.5">
                      {[
                        "File structure & orientation",
                        "Wall & door detection",
                        "Area & roof geometry",
                        "BOQ generation",
                      ].map((label, i) => (
                        <div key={i} className={`flex items-center gap-3 text-xs font-semibold transition-all ${
                          i < scanStep  ? "text-brand-gold" :
                          i === scanStep ? "text-brand-dark font-black" :
                                          "text-brand-dark/25"
                        }`}>
                          <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            i < scanStep  ? "bg-brand-gold" :
                            i === scanStep ? "bg-brand-dark animate-pulse" :
                                            "bg-brand-dark/10"
                          }`} />
                          {label}
                          {i < scanStep && <CheckCircle className="h-3.5 w-3.5 text-brand-gold ml-auto" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Phase 3: Results ─────────────────────────────────── */}
              {scanResults && !isScanAnalyzing && (
                <div className="space-y-6">

                  <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                      body * {
                        visibility: hidden;
                      }
                      #printable-boq-area, #printable-boq-area * {
                        visibility: visible;
                      }
                      #printable-boq-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                      }
                      .no-print, aside, header, nav, button, input[type="text"], input[type="number"], select {
                        border: none !important;
                        background: transparent !important;
                        box-shadow: none !important;
                      }
                    }
                  `}} />

                  {/* Top action bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-brand-dark/5 rounded-2xl px-5 py-4 shadow-sm no-print">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-200 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-brand-dark">Analysis Complete</p>
                        <p className="text-xs text-brand-dark/50">{scanFile?.name} &nbsp;·&nbsp; {scanResults.area} m² detected</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleExportPDF}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-dark/10 text-xs font-black text-brand-dark hover:bg-brand-dark/5 transition-all cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Save PDF
                      </button>
                      <button
                        onClick={handleSaveDraftQuote}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-dark/10 text-xs font-black text-brand-dark hover:bg-brand-dark/5 transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Save Draft
                      </button>
                      <button
                        id="btn-new-analysis"
                        onClick={resetScanState}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-dark/10 text-xs font-black text-brand-dark hover:bg-brand-dark/5 transition-all cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        New Analysis
                      </button>
                      <button
                        id="btn-send-quote-top"
                        onClick={() => setShowQuoteModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send Quote to Client
                      </button>
                    </div>
                  </div>

                  <div id="printable-boq-area" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left: Analysis summary */}
                    <div className="lg:col-span-4 space-y-4">

                      {/* Image preview (images only) */}
                      {scanFile?.previewUrl && (
                        <div className="bg-white border border-brand-dark/5 rounded-3xl overflow-hidden shadow-sm">
                          <div className="aspect-video bg-[#FAF7F0] border-b border-brand-dark/5 overflow-hidden">
                            <img src={scanFile.previewUrl} alt="Floor Plan" className="w-full h-full object-contain" />
                          </div>
                          <div className="px-4 py-3">
                            <p className="text-xs font-black text-brand-dark truncate">{scanFile.name}</p>
                            <p className="text-[10px] text-brand-dark/40 font-semibold">{scanFile.size}</p>
                          </div>
                        </div>
                      )}

                      {/* Extracted metrics card */}
                      <div className="bg-brand-dark text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/15 rounded-bl-full pointer-events-none" />
                        <h3 className="font-black text-xs tracking-widest uppercase border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-brand-gold" />
                          Extracted Metrics
                        </h3>
                        <div className="space-y-3 text-xs relative z-10">
                          {[
                            { label: "Total Floor Area",   value: `${scanResults.area} m²` },
                            { label: "Wall Length (est.)", value: `${scanResults.wallLength} lin.m` },
                            { label: "Roof Area (est.)",   value: `${scanResults.roofArea} m²` },
                            { label: "Room Count",         value: `${scanResults.roomCount} rooms` },
                            { label: "Bathrooms",          value: `${scanResults.bathroomCount} units` },
                            { label: "Foundation Type",    value: "Pad & Strip" },
                          ].map(metric => (
                            <div key={metric.label} className="flex justify-between items-center">
                              <span className="text-white/55 font-semibold">{metric.label}</span>
                              <span className="font-black text-white">{metric.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Grand total chip */}
                      <div className="bg-brand-gold/10 border border-brand-gold/25 rounded-2xl p-5 text-center space-y-1">
                        <p className="text-[10px] font-black text-brand-dark/60 uppercase tracking-widest">Estimated Grand Total</p>
                        <p className="text-3xl font-black text-brand-dark tracking-tight">${Math.round(calculateScanBoqTotal()).toLocaleString()}</p>
                        <p className="text-[10px] text-brand-dark/40 font-semibold">Including 15% overhead markup</p>
                      </div>
                    </div>

                    {/* Right: Editable BOQ Table */}
                    <div className="lg:col-span-8 bg-white border border-brand-dark/5 rounded-3xl shadow-sm overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-dark/5 px-6 py-5">
                        <div>
                          <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
                            <Grid className="h-5 w-5 text-brand-gold" />
                            Auto-Generated Bill of Quantities
                          </h3>
                          <p className="text-xs text-brand-dark/50 mt-0.5">Extracted from floor plan. Adjust rates, quantities & markup as needed.</p>
                        </div>
                        <div className="bg-[#FAF7F0] border border-brand-dark/5 px-4 py-2.5 rounded-2xl shadow-inner text-xs font-black text-brand-dark">
                          Grand Total: <span className="text-brand-gold ml-1 bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/20">${Math.round(calculateScanBoqTotal()).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[660px] border-collapse">
                          <thead>
                            <tr className="bg-[#FAF7F0]/60 border-b border-brand-dark/5 text-left">
                              <th className="px-6 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider">Item Description</th>
                              <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Unit</th>
                              <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Rate ($)</th>
                              <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Qty</th>
                              <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Mkp%</th>
                              <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-right">Total</th>
                              <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 text-center">Del</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-dark/5">
                            {scanBoq.map((item) => (
                              <tr key={item.id} className="hover:bg-brand-gold/5 transition-colors">
                                <td className="px-6 py-3">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateScanBoqField(item.id, "name", e.target.value)}
                                    className="w-full text-xs font-extrabold text-brand-dark bg-transparent border border-transparent hover:bg-brand-dark/5 focus:bg-[#FAF7F0] focus:border-brand-gold/20 rounded-lg px-2 py-1.5 focus:outline-none transition-all"
                                  />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="text"
                                    value={item.unit}
                                    onChange={(e) => updateScanBoqField(item.id, "unit", e.target.value)}
                                    className="w-16 text-center text-xs font-semibold text-brand-dark bg-transparent border border-transparent hover:bg-brand-dark/5 focus:bg-[#FAF7F0] focus:border-brand-gold/20 rounded-lg px-1 py-1 focus:outline-none transition-all"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number" step="0.01"
                                    value={item.rate}
                                    onChange={(e) => updateScanBoqField(item.id, "rate", e.target.value)}
                                    className="w-20 text-center text-xs font-extrabold text-brand-dark bg-brand-dark/5 focus:bg-white border border-brand-dark/10 focus:border-brand-gold rounded-xl py-1.5 focus:outline-none transition-all shadow-inner"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number" step="0.1"
                                    value={item.quantity}
                                    onChange={(e) => updateScanBoqField(item.id, "quantity", e.target.value)}
                                    className="w-20 text-center text-xs font-extrabold text-brand-dark bg-brand-dark/5 focus:bg-white border border-brand-dark/10 focus:border-brand-gold rounded-xl py-1.5 focus:outline-none transition-all shadow-inner"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      value={item.markup}
                                      onChange={(e) => updateScanBoqField(item.id, "markup", e.target.value)}
                                      className="w-12 text-center text-xs font-extrabold text-brand-dark bg-brand-dark/5 focus:bg-white border border-brand-dark/10 focus:border-brand-gold rounded-xl py-1.5 focus:outline-none transition-all shadow-inner"
                                    />
                                    <span className="text-[10px] text-brand-dark/40 font-bold">%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-xs font-black text-brand-dark">
                                    ${Math.round(item.rate * item.quantity * (1 + item.markup / 100)).toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => deleteScanBoqItem(item.id)}
                                    className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center border border-transparent hover:border-rose-100"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-[#FAF7F0]/80 border-t-2 border-brand-gold/20">
                              <td colSpan={5} className="px-6 py-4 text-xs font-black text-brand-dark">Grand Total (incl. markup)</td>
                              <td className="px-4 py-4 text-right">
                                <span className="text-sm font-black text-brand-gold">${Math.round(calculateScanBoqTotal()).toLocaleString()}</span>
                              </td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Footer send CTA */}
                      <div className="border-t border-brand-dark/5 px-6 py-5 flex flex-wrap items-center justify-between gap-4 bg-[#FAF7F0]/30">
                        <span className="text-xs text-brand-dark/45 font-semibold flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5 text-brand-gold" />
                          Quantities derived from {scanResults.area} m² floor plan analysis
                        </span>
                        <button
                          id="btn-send-quote-bottom"
                          onClick={() => setShowQuoteModal(true)}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-white px-6 py-3 text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                          <Send className="h-4 w-4" />
                          Send Quote to Client
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* 3. SHARED FILES TAB */}
          {activeTab === "files" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
              
              {/* Shared files list repository */}
              <div className="lg:col-span-8 bg-white border border-brand-dark/5 rounded-3xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-dark/5 px-6 py-5">
                  <div>
                    <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand-gold" />
                      Active Drawings Workspace
                    </h3>
                    <p className="text-xs text-brand-dark/50">Blueprints and render specs shared with {activeClient.name}.</p>
                  </div>
                </div>

                <div className="divide-y divide-brand-dark/5">
                  {sharedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-5 hover:bg-brand-gold/5 transition-colors">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-10 w-10 bg-[#FAF7F0] border border-brand-dark/5 rounded-xl flex items-center justify-center text-lg shadow-inner flex-shrink-0">
                          {file.type.includes("PDF") ? "📄" : "🎨"}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-brand-dark block truncate">{file.name}</span>
                          <span className="text-[10px] text-brand-dark/45 font-semibold block mt-0.5">
                            {file.type} • {file.size} • {file.date}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => showToast(`Downloading ${file.name}...`)}
                        className="inline-flex items-center justify-center p-2.5 rounded-xl bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-white transition-all cursor-pointer shadow-sm border border-brand-gold/15"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share new drawing uploader card */}
              <div className="lg:col-span-4 bg-white border border-brand-dark/5 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-black text-sm text-brand-dark flex items-center gap-2 border-b border-brand-dark/5 pb-3 flex items-center">
                    <UploadCloud className="h-4.5 w-4.5 text-brand-gold" />
                    Share Design with Client
                  </h3>
                  <p className="text-xs text-brand-dark/50 mt-1">Upload layout plan maps or layout photos directly for client view.</p>
                </div>

                <form onSubmit={handleDocumentUpload} className="space-y-4">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-gold/30 hover:border-brand-gold bg-brand-cream/35 hover:bg-brand-cream-dark/50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group shadow-inner">
                    <UploadCloud className="h-7 w-7 text-brand-gold group-hover:scale-105 transition-transform mb-2" />
                    <span className="text-xs font-bold text-brand-dark block">Select PDF or image</span>
                    <span className="text-[10px] text-brand-dark/40 block mt-0.5">Max 15MB file size limit</span>
                    <input type="file" className="hidden" onChange={handleDocumentUpload} />
                  </label>

                  <button
                    type="submit"
                    className="w-full bg-brand-gold hover:bg-brand-gold-dark text-white rounded-xl py-3 px-6 font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    Share Proposal Document
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* 4. CLIENT MESSAGING TAB */}
          {activeTab === "messages" && (
            <div className="animate-in fade-in duration-300">
              <ChatUI
                contacts={clients.map(c => {
                  const chats = clientChats[c.id] || [];
                  const last = chats[chats.length - 1];
                  return {
                    id: c.id,
                    name: c.name,
                    role: c.project,
                    initials: c.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
                    lastMsg: last?.text || "No messages yet",
                    time: last?.time || "",
                    project: c.project,
                  };
                })}
                selectedId={selectedClientId}
                onSelectContact={(id) => setSelectedClientId(id)}
                messages={(clientChats[selectedClientId] || []).map(m => ({
                  sender: m.sender === "architect" ? "me" : "other",
                  text: m.text,
                  time: m.time,
                }))}
                onSendMessage={(text) => {
                  const updatedHistory = [
                    ...(clientChats[selectedClientId] || []),
                    { sender: "architect", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
                  ];
                  setClientChats(prev => ({ ...prev, [selectedClientId]: updatedHistory }));
                  setIsClientTyping(true);
                  setTimeout(() => {
                    let clientText = `Thanks for the update! Let me verify the dimensions on the estimator.`;
                    const t = text.toLowerCase();
                    if (t.includes("price") || t.includes("cost") || t.includes("budget")) clientText = `That sounds fair. Can you update partition walls to trim cement consumption by 5%?`;
                    else if (t.includes("drawing") || t.includes("layout") || t.includes("pdf")) clientText = `Got it. I'll run it through the DOMNAK scanner tool now.`;
                    setClientChats(prev => ({ ...prev, [selectedClientId]: [...(prev[selectedClientId] || []), { sender: "user", text: clientText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }] }));
                    setIsClientTyping(false);
                  }, 1500);
                }}
                isTyping={isClientTyping}
                activeContact={(() => {
                  const c = clients.find(x => x.id === selectedClientId) || clients[0];
                  return {
                    name: c.name,
                    role: c.project,
                    project: c.project,
                    initials: c.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
                  };
                })()}
                placeholder={`Message ${(clients.find(x => x.id === selectedClientId) || clients[0])?.name}…`}
              />
            </div>
          )}

          {/* 5. STUDIO SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto bg-white border border-brand-dark/5 rounded-3xl p-6 lg:p-8 shadow-sm animate-in fade-in duration-300">
              <h3 className="font-black text-lg text-brand-dark border-b border-brand-dark/5 pb-4 mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand-gold" />
                Studio Profile Settings
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast("Studio profile details updated!");
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-brand-dark/55 uppercase tracking-wider mb-2">Studio / Company Name</label>
                    <input
                      type="text"
                      required
                      defaultValue={user?.company || "Angkor Architecture Studio"}
                      className="w-full text-xs bg-[#FAF7F0] border border-brand-dark/10 rounded-xl px-4 py-3 font-extrabold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark/55 uppercase tracking-wider mb-2">Lead Architect Name</label>
                    <input
                      type="text"
                      required
                      defaultValue={user?.name || "Sopheap Meas"}
                      className="w-full text-xs bg-[#FAF7F0] border border-brand-dark/10 rounded-xl px-4 py-3 font-extrabold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark/55 uppercase tracking-wider mb-2">Studio Specialization</label>
                    <input
                      type="text"
                      defaultValue="Residential Villas & Penthouse Suites"
                      className="w-full text-xs bg-[#FAF7F0] border border-brand-dark/10 rounded-xl px-4 py-3 font-extrabold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark/55 uppercase tracking-wider mb-2">Build Site Range</label>
                    <input
                      type="text"
                      defaultValue="Phnom Penh & Siem Reap Provinces"
                      className="w-full text-xs bg-[#FAF7F0] border border-brand-dark/10 rounded-xl px-4 py-3 font-extrabold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-brand-dark/5 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-white px-6 py-3.5 text-xs font-black shadow-md hover:shadow-brand-gold/15 transition-all cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Save Studio Settings
                  </button>
                </div>
              </form>
            </div>
          )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
