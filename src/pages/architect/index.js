import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import ChatUI from "@/components/ChatUI";
import CostHelperChatbot from "@/components/chatbot/CostHelperChatbot";
import { useAuth } from "../../../router/useAuth";

import { jsPDF } from "jspdf";

import autoTable from "jspdf-autotable";
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  BorderStyle 
} from "docx";
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
  History,
  Bell,
  ChevronDown,
  User as UserIcon,
  Armchair,
  Bed,
  FolderOpen,
  Bath,
  Flower,
  Bot,
  Menu
} from "lucide-react";

// ── Floor plan API helpers (inline to avoid module-resolution issues) ──────
const _API = process.env.NEXT_PUBLIC_API_URL || "";
function _authFetch(path, opts = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const validToken = token && token !== "mock-token-xyz" && token !== "undefined" && token !== "null" ? token : null;
  return fetch(`${_API}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(validToken && { Authorization: `Bearer ${validToken}` }), ...opts.headers },
  }).then((r) => r.json());
}
function getFloorPlans() { return _authFetch("/api/floor-plan/"); }
function deleteFloorPlan(id) { return _authFetch(`/api/floor-plan/${id}`, { method: "DELETE" }); }
// ────────────────────────────────────────────────────────────────────────────

export default function ArchitectPage() {
  const { user, logout } = useAuth();

  const capitalizeName = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  // Dashboard state
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "floorplan" | "boq" | "files" | "messages" | "settings"
  const [dashboardSidebarOpen, setDashboardSidebarOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [customNotification, setCustomNotification] = useState(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: "", project: "", location: "", budget: 150000 });

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

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
  const [clients, setClients] = useState([]);

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
    c1: [],
    c2: [],
    c3: []
  });

  const [chatInput, setChatInput] = useState("");
  const [isClientTyping, setIsClientTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // ── AI Chatbot state (Shared Files tab) ──────────────────────────────────
  const [aiBotMessages, setAiBotMessages] = useState([]);
  const [isAiBotTyping, setIsAiBotTyping] = useState(false);

  // ── Plan Analyzer state ──────────────────────────────────────────────────
  const [scanFile, setScanFile] = useState(null);         // { name, type, size, previewUrl }
  const [scanFileObject, setScanFileObject] = useState(null); // Real File object
  const [isScanAnalyzing, setIsScanAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);   // extracted metrics
  const [scanBoq, setScanBoq] = useState([]);             // auto-generated BOQ
  const [floorPlanId, setFloorPlanId] = useState(null);   // backend UUID from last analysis
  const [scanRooms, setScanRooms] = useState([
    { id: "r1", name: "Living Room", width: 5.0, length: 6.0 },
    { id: "r2", name: "Bedroom 1",  width: 4.0, length: 4.0 },
    { id: "r3", name: "Bedroom 2",  width: 3.5, length: 4.0 },
    { id: "r4", name: "Kitchen",    width: 4.0, length: 3.5 },
    { id: "r5", name: "Bathroom",   width: 3.0, length: 2.5 }
  ]);

  useEffect(() => {
    if (scanResults && scanRooms.length > 0) {
      const computedArea = scanRooms.reduce((acc, r) => acc + (r.width * r.length), 0);
      setScanResults(prev => {
        if (!prev) return null;
        if (prev.area === parseFloat(computedArea.toFixed(1))) return prev;
        return {
          ...prev,
          area: parseFloat(computedArea.toFixed(1))
        };
      });
    }
  }, [scanRooms, scanResults]);
  const [scanQuoteClientId, setScanQuoteClientId] = useState("c1");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [sentQuotesList, setSentQuotesList] = useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Initialize AI bot welcome message (same as homeowner chatbot)
  useEffect(() => {
    setAiBotMessages([{
      sender: "ai",
      text: "Hello! I'm DomNak AI, your construction cost assistant. Ask me anything about building material prices, BOQ rates, or contractor benchmarks in Cambodia.",
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSavedHistory = () => {
    if (!user) return;
    getFloorPlans()
      .then((response) => {
        if (!response || !response.data) return;
        let localQuotes = [];
        try { localQuotes = JSON.parse(localStorage.getItem("domnak_sent_quotes") || "[]"); } catch (_) {}

        const backendItems = response.data.map((fp) => {
          const local = localQuotes.find((q) => q.floorPlanId === fp.id);
          return {
            id: fp.id,
            floorPlanId: fp.id,
            clientId: local?.clientId || "draft",
            clientName: local?.clientName || "Draft / Unassigned",
            fileName: fp.file_name,
            area: fp.total_area,
            total: Math.round(fp.boq?.total_estimated_cost || local?.total || 0),
            boq: local?.boq || [],
            sentAt: fp.created_at,
          };
        });

        const localOnly = localQuotes.filter(
          (q) => !q.floorPlanId || !response.data.some((fp) => fp.id === q.floorPlanId)
        );

        const merged = [...backendItems, ...localOnly];
        setSentQuotesList(merged);
        localStorage.setItem("domnak_sent_quotes", JSON.stringify(merged));
      })
      .catch((err) => console.log("Offline – using localStorage for saved history:", err));
  };

  // Fetch on login
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadSavedHistory(); }, [user]);

  // Re-fetch every time the user opens the Saved History tab
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (activeTab === "boq") loadSavedHistory(); }, [activeTab]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [clientChats, isClientTyping]);

  const showToast = (msg) => {
    setCustomNotification(msg);
    setTimeout(() => setCustomNotification(null), 4000);
  };

  const getActiveClient = () => {
    return clients.find(c => c.id === selectedClientId) || clients[0] || {
      id: "none",
      name: "No Connected Client",
      project: "No active projects",
      location: "—",
      budget: 0,
      status: "N/A",
      dateConnected: "—"
    };
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClientData.name.trim() || !newClientData.project.trim()) return;
    const client = {
      id: `c_${Date.now()}`,
      name: newClientData.name,
      project: newClientData.project,
      location: newClientData.location || "Phnom Penh",
      budget: parseFloat(newClientData.budget) || 100000,
      status: "Planning",
      dateConnected: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      email: `${newClientData.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      phone: "+855 12 345 678"
    };
    setClients(prev => [...prev, client]);
    setClientChats(prev => ({ ...prev, [client.id]: [] }));
    setSelectedClientId(client.id);
    setShowAddClientModal(false);
    setNewClientData({ name: "", project: "", location: "", budget: 150000 });
    showToast(`Connected client: ${client.name}!`);
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
    const { area, wallLength, roofArea, roomCount, bathroomCount, foundationType = "Pad & Strip" } = results;
    
    let foundationRate = 8.50;
    let foundationName = "Portland Cement (Masonry & Foundation)";
    let foundationUnit = "bags";
    let foundationQty = Math.round(area * 3.5);

    if (foundationType === "Pile foundation") {
      foundationRate = 120.00;
      foundationName = "High-Strength Cast-in-Situ Concrete Piles";
      foundationUnit = "m³";
      foundationQty = Math.round(area * 0.35);
    } else if (foundationType === "Raft / Slab foundation") {
      foundationRate = 95.00;
      foundationName = "Reinforced Slab Concrete Foundation";
      foundationUnit = "m³";
      foundationQty = Math.round(area * 0.25);
    }

    return [
      { id: "sb_1",  name: foundationName,                     unit: foundationUnit, rate: foundationRate, quantity: foundationQty,                            markup: 15 },
      { id: "sb_2",  name: "High-Tensile Steel Deformed Rebars",      unit: "tons",         rate: 850.00,         quantity: parseFloat((area * 0.04).toFixed(2)),   markup: 15 },
      { id: "sb_3",  name: "Solid & Hollow Clay Bricks (Standard)",   unit: "pieces",       rate: 0.08,           quantity: Math.round(wallLength * 860),            markup: 15 },
      { id: "sb_4",  name: "Graded Fine Sand (Concrete & Masonry)",   unit: "m³",           rate: 45.00,          quantity: Math.round(area * 0.25),                 markup: 15 },
      { id: "sb_5",  name: "Crushed Coarse Aggregates (10-20mm)",     unit: "m³",           rate: 40.00,          quantity: Math.round(area * 0.2),                  markup: 15 },
      { id: "sb_6",  name: "Acrylic Emulsion Paint & Primer Base",    unit: "liters",       rate: 12.00,          quantity: Math.round(area * 0.8),                  markup: 15 },
      { id: "sb_7",  name: "Premium Ceramic Floor & Wall Tiling",     unit: "m²",           rate: 15.00,          quantity: area,                                    markup: 15 },
      { id: "sb_8",  name: "Electrical Conduit & FRLS Cabling",       unit: "meters",       rate: 2.50,           quantity: Math.round(area * 8),                    markup: 15 },
      { id: "sb_9",  name: "PVC Drainage & Water Supply Piping",      unit: "meters",       rate: 3.00,           quantity: Math.round(area * 5),                    markup: 15 },
      { id: "sb_10", name: "Construction Labor & Project Supervision",unit: "lump sum",     rate: 22000.00,        quantity: 1,                                       markup: 0  }
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

  const handleAddScanBoqItem = () => {
    const newItem = {
      id: `sb_custom_${Date.now()}`,
      name: "Custom Material Item Description",
      unit: "pcs",
      rate: 10.00,
      quantity: 1,
      markup: 15
    };
    setScanBoq(prev => [...prev, newItem]);
    showToast("Custom BOQ item added!");
  };

  const updateScanResultField = (field, val) => {
    setScanResults(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const updateScanRoomField = (id, field, val) => {
    setScanRooms(prev => prev.map(r => {
      if (r.id === id) {
        const numVal = parseFloat(val) || 0;
        return { ...r, [field]: (field === "name") ? val : numVal };
      }
      return r;
    }));
  };

  const handleAddScanRoom = () => {
    const newRoom = {
      id: `r_custom_${Date.now()}`,
      name: `Room ${scanRooms.length + 1}`,
      width: 3.0,
      length: 3.0
    };
    setScanRooms(prev => [...prev, newRoom]);
    showToast("Added new room to breakdown!");
  };

  const handleDeleteScanRoom = (id) => {
    setScanRooms(prev => prev.filter(r => r.id !== id));
    showToast("Room deleted from breakdown.");
  };

  const handleRecalculateBoq = () => {
    if (!scanResults) return;
    const updatedBoq = generateScanBoq(scanResults);
    setScanBoq(updatedBoq);
    showToast("BOQ recalculated successfully based on new parameters!");
  };

  const resetScanState = () => {
    setScanFile(null);
    setScanFileObject(null);
    setScanResults(null);
    setScanBoq([]);
    setFloorPlanId(null);
  };

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
      bathroomCount: 2,
      foundationType: "Pad & Strip"
    });
    setScanBoq(JSON.parse(JSON.stringify(quote.boq)));
    setFloorPlanId(quote.floorPlanId || quote.id || null);
    setActiveTab("scanAnalyzer");
    showToast(`Loaded Quote: ${quote.clientName}`);
  };

  const handleDeleteSavedQuote = async (id) => {
    const toDelete = sentQuotesList.find((q) => q.id === id);
    const updated = sentQuotesList.filter((q) => q.id !== id);
    setSentQuotesList(updated);
    localStorage.setItem("domnak_sent_quotes", JSON.stringify(updated));
    // Remove from backend if it has a real floor_plan record
    if (toDelete?.floorPlanId && user) {
      try { await deleteFloorPlan(toDelete.floorPlanId); } catch (e) { console.error("Backend delete error:", e); }
    }
    showToast("Quote deleted successfully.");
  };

  const handleSaveDraftQuote = () => {
    const quote = {
      id: floorPlanId || `q_${Date.now()}`,
      floorPlanId: floorPlanId,
      clientId: "draft",
      clientName: "Draft / Unassigned",
      fileName: scanFile?.name || "Scanned Plan",
      area: scanResults?.area || 120,
      total: Math.round(calculateScanBoqTotal()),
      boq: scanBoq,
      sentAt: new Date().toISOString(),
    };
    const updated = [quote, ...sentQuotesList.filter(q => q.id !== quote.id)];
    setSentQuotesList(updated);
    localStorage.setItem("domnak_sent_quotes", JSON.stringify(updated));
    setNotifications(prev => [{ id: `n_draft_${Date.now()}`, text: `Saved draft estimate for ${quote.fileName}`, unread: true }, ...prev]);
    showToast("Draft quote saved successfully!");
    // Re-sync from backend so Saved History is immediately up to date
    setTimeout(() => loadSavedHistory(), 300);
  };

  const handleExportPDF = () => {
    showToast("Generating professional PDF report...");
    generateJsPDFReport();
  };

  const generateJsPDFReport = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const primaryColor = [166, 138, 61]; // Gold #A68A3D
      const darkColor = [26, 26, 26];

      // 1. Document Title & Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text("BILL OF QUANTITIES (BOQ)", 105, 20, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("DETAILED ESTIMATE & CONSTRUCTION COST MODEL", 105, 26, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated via DomNak AI Core Engine | Project Ref ID: ${Date.now().toString().slice(-6)}`, 105, 31, { align: "center" });

      // Draw a line separator
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(15, 35, 195, 35);

      // 2. Project Metadata block
      doc.setFillColor(250, 247, 240); // #FAF7F0
      doc.rect(15, 40, 180, 28, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("PROJECT DETAILS:", 20, 45);
      doc.text("ARCHITECT & STUDIO:", 110, 45);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(`Source File: ${scanFile?.name || "Scanned Drawing"}`, 20, 50);
      doc.text(`Total Floor Area: ${scanResults.area} m²`, 20, 55);
      doc.text(`Est. Wall Length: ${scanResults.wallLength} lin.m`, 20, 60);
      doc.text(`Est. Roof Area: ${scanResults.roofArea} m²`, 20, 65);

      doc.text(`Studio: ${user?.company || "Angkor Architecture Studio"}`, 110, 50);
      doc.text(`Lead Architect: ${user?.name || "Sopheap Meas"}`, 110, 55);
      doc.text(`Rooms Layout: ${scanResults.roomCount} Rooms / ${scanResults.bathroomCount} Bath`, 110, 60);
      doc.text(`Report Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 110, 65);

      // 3. BOQ Table (using AutoTable plugin)
      const tableHeaders = [["Item Description", "Unit", "Rate ($)", "Quantity", "Markup", "Total ($)"]];
      const tableRows = scanBoq.map(item => {
        const totalVal = item.rate * item.quantity * (1 + item.markup / 100);
        return [
          item.name,
          item.unit,
          `$${item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          item.quantity.toString(),
          `${item.markup}%`,
          `$${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
      });

      autoTable(doc, {
        startY: 75,
        head: tableHeaders,
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
          halign: "left"
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 20, halign: "center" },
          2: { cellWidth: 25, halign: "right" },
          3: { cellWidth: 20, halign: "right" },
          4: { cellWidth: 20, halign: "right" },
          5: { cellWidth: 25, halign: "right" }
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: "middle"
        },
        didParseCell: (data) => {
          if (data.section === "head" && (data.column.index === 1)) {
            data.cell.styles.halign = "center";
          }
          if (data.section === "head" && (data.column.index >= 2)) {
            data.cell.styles.halign = "right";
          }
        }
      });

      let finalY = doc.lastAutoTable.finalY + 10;

      // Check if we need to add a new page for totals and signatures to avoid cutoffs
      if (finalY > 230) {
        doc.addPage();
        finalY = 20;
      }

      // 4. Summary Cost Block
      const subtotal = scanBoq.filter(i => i.name !== "Construction Labor & Project Supervision").reduce((acc, i) => acc + (i.rate * i.quantity), 0);
      const totalMarkup = scanBoq.reduce((acc, i) => acc + (i.rate * i.quantity * (i.markup / 100)), 0);
      const laborVal = scanBoq.find(i => i.name === "Construction Labor & Project Supervision")?.rate || 0;
      const grandTotal = calculateScanBoqTotal();

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      
      doc.text("Estimated Material Subtotal:", 120, finalY);
      doc.text(`$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 195, finalY, { align: "right" });

      doc.text("Total Markup Applied:", 120, finalY + 5);
      doc.text(`$${totalMarkup.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 195, finalY + 5, { align: "right" });

      doc.text("Labor & Supervision:", 120, finalY + 10);
      doc.text(`$${laborVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 195, finalY + 10, { align: "right" });

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(120, finalY + 13, 195, finalY + 13);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Grand Total (incl. markup):", 120, finalY + 18);
      doc.text(`$${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 195, finalY + 18, { align: "right" });

      finalY = finalY + 35;

      if (finalY > 240) {
        doc.addPage();
        finalY = 20;
      }

      // 5. Signature Blocks
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(15, finalY + 20, 85, finalY + 20);
      doc.line(115, finalY + 20, 185, finalY + 20);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("PREPARED & VERIFIED BY", 15, finalY);
      doc.text("APPROVED & ACCEPTED BY", 115, finalY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(user?.name || "Sopheap Meas", 15, finalY + 24);
      doc.text("Client Signature", 115, finalY + 24);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Lead Architect, ${user?.company || "Angkor Studio"}`, 15, finalY + 28);
      doc.text("Date: ____ / ____ / ________", 115, finalY + 28);

      // Save PDF directly to user's downloads folder!
      doc.save(`${scanFile?.name?.replace(/\.[^/.]+$/, "") || "BOQ"}_estimate.pdf`);
      showToast("PDF document downloaded successfully!");
    } catch (e) {
      console.error("jsPDF generation failed:", e);
      showToast("PDF Generation failed. Opening print window as fallback.");
      window.print();
    }
  };

  const handleExportWord = () => {
    if (!scanBoq || scanBoq.length === 0) return;
    showToast("Generating native Word Document (.docx)...");

    const projName = scanFile?.name || "Scanned Drawing";
    const areaVal = `${scanResults?.area || 120} m²`;
    const wallVal = `${scanResults?.wallLength || 100} lin.m`;
    const roofVal = `${scanResults?.roofArea || 140} m²`;
    const roomsVal = `${scanResults?.roomCount || 4} Rooms / ${scanResults?.bathroomCount || 1} Bath`;
    const dateVal = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const studioVal = user?.company || "Angkor Architecture Studio";
    const architectVal = user?.name || "Sopheap Meas";

    // 1. Header Paragraphs
    const titleParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "BILL OF QUANTITIES (BOQ)",
          bold: true,
          size: 36,
          font: "Arial",
        }),
      ],
    });

    const subtitleParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: "DETAILED ESTIMATE & CONSTRUCTION COST MODEL",
          bold: true,
          size: 20,
          color: "A68A3D",
          font: "Arial",
        }),
      ],
    });

    // 2. Metadata Grid Table (2 columns, 1 row)
    const metadataTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: "FAF9F6" },
              margins: { top: 100, bottom: 100, left: 150, right: 150 },
              children: [
                new Paragraph({ children: [new TextRun({ text: "PROJECT DETAILS", bold: true, size: 16, color: "888888" })] }),
                new Paragraph({ children: [new TextRun({ text: "Source File: ", bold: true, size: 18 }), new TextRun({ text: projName, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: "Total Floor Area: ", bold: true, size: 18 }), new TextRun({ text: areaVal, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: "Est. Wall Length: ", bold: true, size: 18 }), new TextRun({ text: wallVal, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: "Est. Roof Area: ", bold: true, size: 18 }), new TextRun({ text: roofVal, size: 18 })] }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: "FAF9F6" },
              margins: { top: 100, bottom: 100, left: 150, right: 150 },
              children: [
                new Paragraph({ children: [new TextRun({ text: "ARCHITECT & STUDIO", bold: true, size: 16, color: "888888" })] }),
                new Paragraph({ children: [new TextRun({ text: "Studio: ", bold: true, size: 18 }), new TextRun({ text: studioVal, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: "Lead Architect: ", bold: true, size: 18 }), new TextRun({ text: architectVal, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: "Rooms Layout: ", bold: true, size: 18 }), new TextRun({ text: roomsVal, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: "Report Date: ", bold: true, size: 18 }), new TextRun({ text: dateVal, size: 18 })] }),
              ],
            }),
          ],
        }),
      ],
    });

    const spacingParagraph = new Paragraph({ spacing: { after: 240 } });

    // 3. BOQ Table Rows
    const tableHeaderRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Item Description", bold: true, color: "FFFFFF", size: 18 })] })], shading: { fill: "A68A3D" } }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Unit", bold: true, color: "FFFFFF", size: 18 })] })], shading: { fill: "A68A3D" } }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Rate ($)", bold: true, color: "FFFFFF", size: 18 })] })], shading: { fill: "A68A3D" } }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Quantity", bold: true, color: "FFFFFF", size: 18 })] })], shading: { fill: "A68A3D" } }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Markup", bold: true, color: "FFFFFF", size: 18 })] })], shading: { fill: "A68A3D" } }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Total ($)", bold: true, color: "FFFFFF", size: 18 })] })], shading: { fill: "A68A3D" } }),
      ],
    });

    const boqTableRows = [tableHeaderRow];
    scanBoq.forEach((item, index) => {
      const totalVal = item.rate * item.quantity * (1 + item.markup / 100);
      const isEven = index % 2 === 1;
      const cellFill = isEven ? "FCFBFA" : "FFFFFF";

      boqTableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.name, bold: true, size: 17 })] })], shading: { fill: cellFill } }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.unit, size: 17 })] })], shading: { fill: cellFill } }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `$${item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, size: 17 })] })], shading: { fill: cellFill } }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: item.quantity.toString(), size: 17 })] })], shading: { fill: cellFill } }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${item.markup}%`, size: 17 })] })], shading: { fill: cellFill } }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `$${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, bold: true, size: 17 })] })], shading: { fill: cellFill } }),
          ],
        })
      );
    });

    const boqTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: boqTableRows,
    });

    // 4. Summaries Block
    const subtotal = scanBoq.filter(i => i.name !== "Construction Labor & Project Supervision").reduce((acc, i) => acc + (i.rate * i.quantity), 0);
    const totalMarkup = scanBoq.reduce((acc, i) => acc + (i.rate * i.quantity * (i.markup / 100)), 0);
    const laborVal = scanBoq.find(i => i.name === "Construction Labor & Project Supervision")?.rate || 0;
    const grandTotal = calculateScanBoqTotal();

    const summaryParagraph = new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 240 },
      children: [
        new TextRun({ text: "Estimated Material Subtotal: ", size: 18 }),
        new TextRun({ text: `$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`, bold: true, size: 18 }),
        new TextRun({ text: "Total Markup Applied: ", size: 18 }),
        new TextRun({ text: `$${totalMarkup.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`, bold: true, size: 18 }),
        new TextRun({ text: "Labor & Supervision: ", size: 18 }),
        new TextRun({ text: `$${laborVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`, bold: true, size: 18 }),
        new TextRun({ text: "Grand Total (incl. markup): ", size: 19, color: "A68A3D" }),
        new TextRun({ text: `$${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, bold: true, size: 20, color: "A68A3D" }),
      ],
    });

    // 5. Sign-off Boxes
    const signatureTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: "PREPARED & VERIFIED BY", bold: true, size: 15, color: "888888" })] }),
                new Paragraph({ spacing: { before: 600 } }), // gap for signature
                new Paragraph({ children: [new TextRun({ text: "____________________________________", bold: true, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: architectVal, bold: true, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: `Lead Architect, ${studioVal}`, size: 16, color: "666666" })] }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: "APPROVED & ACCEPTED BY", bold: true, size: 15, color: "888888" })] }),
                new Paragraph({ spacing: { before: 600 } }), // gap for signature
                new Paragraph({ children: [new TextRun({ text: "____________________________________", bold: true, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: "Client Signature", bold: true, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: "Date: ____ / ____ / ________", size: 16, color: "666666" })] }),
              ],
            }),
          ],
        }),
      ],
    });

    // Build Word Document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            titleParagraph,
            subtitleParagraph,
            metadataTable,
            spacingParagraph,
            boqTable,
            summaryParagraph,
            new Paragraph({ spacing: { before: 360 } }),
            signatureTable,
          ],
        },
      ],
    });

    // Generate and download
    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${projName.replace(/\.[^/.]+$/, "") || "BOQ"}_estimate.docx`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Word Document (.docx) downloaded! Ready to edit.");
    }).catch(err => {
      console.error(err);
      showToast("Word export failed.");
    });
  };

  const handleExportCSV = () => {
    if (!scanBoq || scanBoq.length === 0) return;
    let csvContent = "Item Description,Unit,Rate ($),Quantity,Markup (%),Total Price ($)\n";
    scanBoq.forEach(item => {
      const totalPrice = item.rate * item.quantity * (1 + item.markup / 100);
      const cleanName = item.name.replace(/,/g, "");
      csvContent += `${cleanName},${item.unit},${item.rate},${item.quantity},${item.markup},${totalPrice.toFixed(2)}\n`;
    });
    const grandTotal = calculateScanBoqTotal();
    csvContent += `\n,,,Grand Total (incl. markup),,${grandTotal.toFixed(2)}\n`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${scanFile?.name?.replace(/\.[^/.]+$/, "") || "BOQ"}_estimate.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("BOQ exported as CSV successfully!");
  };

  const handleScanFileSelect = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    if (!isImage) { 
      showToast("Please upload a floor plan image (PNG, JPG, JPEG) to analyze."); 
      return; 
    }
    const previewUrl = URL.createObjectURL(file);
    setScanFileObject(file);
    setScanFile({ 
      name: file.name, 
      type: file.type, 
      size: (file.size / 1024 / 1024).toFixed(2) + " MB", 
      previewUrl 
    });
    setScanResults(null);
    setScanBoq([]);
  };

  const handleScanFileChange = (e) => handleScanFileSelect(e.target.files?.[0]);
  const handleScanDrop       = (e) => { e.preventDefault(); handleScanFileSelect(e.dataTransfer.files?.[0]); };

  const handleScanAnalyze = async () => {
    if (!scanFileObject) {
      showToast("Please select a floor plan image file first.");
      return;
    }
    
    setIsScanAnalyzing(true);
    setScanStep(0);
    setScanProgress(10);
    
    // Animate progress visually while performing API request
    const progressTimer = setInterval(() => {
      setScanProgress(p => {
        if (p >= 90) return p;
        return p + 5;
      });
    }, 450);

    // Track simulated step changes for user UI
    const stepTimer1 = setTimeout(() => { setScanStep(1); }, 1000); // OCR extraction
    const stepTimer2 = setTimeout(() => { setScanStep(2); }, 2200); // Llama 3 analysis

    try {
      const formData = new FormData();
      formData.append("file", scanFileObject);
      
      let token = localStorage.getItem("access_token");
      if (!token || token === "mock-token-xyz" || token === "undefined" || token === "null") token = null;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/floor-plan/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      clearInterval(progressTimer);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Analysis failed");
      }

      const responseData = await res.json();
      const apiData = responseData.data;

      // Track the backend floor_plan UUID so saves / deletes can reference it
      setFloorPlanId(apiData.floor_plan_id || null);

      // Extract results returned from the backend Llama + OCR engine
      const totalArea = apiData.total_area || 120;
      const roomsList = apiData.analysis?.rooms || [];
      const roomCount = apiData.rooms_count || roomsList.length || 4;
      const bathroomCount = roomsList.filter(r => r.name.toLowerCase().includes("bathroom")).length || 1;
      const wallLength = roomsList.length > 0 ? Math.round(roomsList.reduce((acc, r) => acc + ((r.width || 4) + (r.length || 4)) * 2, 0)) : Math.round(totalArea * 0.9);
      const roofArea = Math.round(totalArea * 1.2);

      setScanStep(3); // Calculating BOQ
      setScanProgress(95);

      // Map backend BOQ quantities to professional frontend BOQ table rows
      const backendBoq = apiData.boq;
      const mappedBoq = [];
      let idx = 1;

      if (backendBoq && backendBoq.quantities) {
        Object.entries(backendBoq.quantities).forEach(([key, val]) => {
          let name = "";
          let unit = val.unit || "units";
          let rate = val.price_per_unit || val.price || 0;
          let qty = val.quantity || 0;
          let markup = 15; // default markup 15%

          switch (key) {
            case "cement_bags":
              name = "Portland Cement (Masonry & Foundation)";
              unit = "bags";
              break;
            case "steel_kg":
              name = "High-Tensile Steel Deformed Rebars";
              unit = "tons";
              rate = rate * 1000; // $0.85/kg -> $850/ton
              qty = parseFloat((qty / 1000).toFixed(3)); // convert kg to tons
              break;
            case "bricks":
              name = "Solid & Hollow Clay Bricks (Standard)";
              unit = "pieces";
              qty = Math.round(qty);
              break;
            case "sand_cubic_meters":
              name = "Graded Fine Sand (Concrete & Masonry)";
              unit = "m³";
              break;
            case "gravel_cubic_meters":
              name = "Crushed Coarse Aggregates (10-20mm)";
              unit = "m³";
              break;
            case "paint_liters":
              name = "Acrylic Emulsion Paint & Primer Base";
              unit = "liters";
              break;
            case "tiles_sqm":
              name = "Premium Ceramic Floor & Wall Tiling";
              unit = "m²";
              break;
            case "electrical_wire_m":
              name = "Electrical Conduit & FRLS Cabling";
              unit = "meters";
              break;
            case "pvc_pipes_m":
              name = "PVC Drainage & Water Supply Piping";
              unit = "meters";
              break;
            default:
              name = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          }

          mappedBoq.push({
            id: `sb_${idx++}`,
            name,
            unit,
            rate,
            quantity: qty,
            markup
          });
        });

        if (backendBoq.labor_cost) {
          mappedBoq.push({
            id: `sb_${idx++}`,
            name: "Construction Labor & Project Supervision",
            unit: "lump sum",
            rate: backendBoq.labor_cost,
            quantity: 1,
            markup: 0
          });
        }
      } else {
        mappedBoq.push(...generateScanBoq({
          area: totalArea,
          wallLength,
          roofArea,
          roomCount,
          bathroomCount
        }));
      }

      setScanProgress(100);
      
      setTimeout(() => {
        setIsScanAnalyzing(false);
        setScanResults({
          area: totalArea,
          wallLength,
          roofArea,
          roomCount,
          bathroomCount,
          foundationType: "Pad & Strip"
        });
        setScanBoq(mappedBoq);
        showToast("AI analysis complete — BOQ auto-generated!");
      }, 500);

    } catch (err) {
      clearInterval(progressTimer);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      
      console.warn("Backend floor-plan upload failed, using offline simulation fallback:", err);
      showToast("Backend offline/unauthorized. Running local simulation...");
      
      // Fallback to simulation generator
      const totalArea = 120 + Math.floor(Math.random() * 80);
      const roomCount = 4;
      const bathroomCount = 2;
      const wallLength = Math.round(totalArea * 0.9);
      const roofArea = Math.round(totalArea * 1.2);
      
      const mappedBoq = [
        { id: "sb_1",  name: "Portland Cement (Masonry & Foundation)", unit: "bags",   rate: 8.50,   quantity: Math.round(totalArea * 3.5),                 markup: 15 },
        { id: "sb_2",  name: "High-Tensile Steel Deformed Rebars",      unit: "tons",   rate: 850.00, quantity: parseFloat((totalArea * 0.04).toFixed(2)),   markup: 15 },
        { id: "sb_3",  name: "Solid & Hollow Clay Bricks (Standard)",   unit: "pieces", rate: 0.08,   quantity: Math.round(wallLength * 860),                markup: 15 },
        { id: "sb_4",  name: "Graded Fine Sand (Concrete & Masonry)",   unit: "m³",     rate: 45.00,  quantity: Math.round(totalArea * 0.25),                markup: 15 },
        { id: "sb_5",  name: "Crushed Coarse Aggregates (10-20mm)",     unit: "m³",     rate: 40.00,  quantity: Math.round(totalArea * 0.2),                 markup: 15 },
        { id: "sb_6",  name: "Acrylic Emulsion Paint & Primer Base",    unit: "liters", rate: 12.00,  quantity: Math.round(totalArea * 0.8),                 markup: 15 },
        { id: "sb_7",  name: "Premium Ceramic Floor & Wall Tiling",     unit: "m²",     rate: 15.00,  quantity: totalArea,                                   markup: 15 },
        { id: "sb_8",  name: "Electrical Conduit & FRLS Cabling",       unit: "meters", rate: 2.50,   quantity: Math.round(totalArea * 8),                   markup: 15 },
        { id: "sb_9",  name: "PVC Drainage & Water Supply Piping",      unit: "meters", rate: 3.00,   quantity: Math.round(totalArea * 5),                   markup: 15 },
        { id: "sb_10", name: "Construction Labor & Project Supervision",unit: "lump sum",rate: 22000.00,quantity: 1,                                            markup: 0  }
      ];

      setScanStep(3);
      setScanProgress(100);
      
      setTimeout(() => {
        setIsScanAnalyzing(false);
        setScanResults({
          area: totalArea,
          wallLength,
          roofArea,
          roomCount,
          bathroomCount,
          foundationType: "Pad & Strip"
        });
        setScanBoq(mappedBoq);
        showToast("Local analysis complete — BOQ auto-generated!");
      }, 800);
    }
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

        {/* Overlay cover when dashboard sidebar is open in drawer mode */}
        {activeTab !== "overview" && dashboardSidebarOpen && (
          <div 
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
            onClick={() => setDashboardSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className={`w-64 bg-[#A68A3D] flex flex-col justify-between shrink-0 shadow-xl ${
          activeTab === "overview"
            ? "relative z-25"
            : `fixed inset-y-0 left-0 z-[60] transition-transform duration-300 ease-in-out ${
                dashboardSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
        }`}>
          
          {/* Subtle top decoration */}
          <div className="h-1.5 bg-gradient-to-r from-brand-gold to-brand-gold-dark w-full shrink-0 absolute top-0 left-0 z-10" />

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 mt-8 pt-4">
            <Link 
              href="/" 
              className="w-full flex items-center gap-3 px-4.5 py-3.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer relative text-white/80 hover:text-white hover:bg-white/10 group mb-2"
            >
              <div className="h-5 w-5 rounded-full border border-white/50 flex items-center justify-center group-hover:border-white transition-colors duration-200">
                <ArrowLeft className="h-3 w-3 text-white/80 group-hover:text-white" />
              </div>
              <span>Home</span>
            </Link>

            {[
              { id: "overview",      label: "Overview",       icon: Briefcase },
              { id: "scanAnalyzer",  label: "Plan Analyzer",  icon: ScanLine },
              { id: "boq",           label: "Saved History",  icon: History },
              { id: "files",         label: "Chatbot",        icon: Bot },
              { id: "messages",      label: "Client Chat",    icon: MessageSquare },
              { id: "settings",      label: "Studio Settings",icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setDashboardSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4.5 py-3.5 rounded-lg text-sm transition-all duration-200 cursor-pointer relative ${
                  activeTab === id
                    ? "bg-[#FAF5DB] text-[#806626] font-black shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10 font-bold"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-300 ${
                  activeTab === id ? "text-[#806626]" : "text-white/80"
                }`} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* User profile section at the bottom */}
          <div className="px-4 pb-8 pt-5 border-t border-white/20 flex items-center justify-between gap-3 bg-transparent shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-gold to-brand-gold-dark flex items-center justify-center text-white text-xs font-black flex-shrink-0 select-none uppercase shadow-md border border-white/10 ring-2 ring-brand-gold/20">
                {(user?.company || user?.name || "AS").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-white/95 block truncate tracking-tight">
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
          {activeTab !== "files" && (
            <header className="bg-[#fffbee]/85 backdrop-blur-md border-b border-brand-dark/10 h-20 flex items-center justify-between px-8 shrink-0 relative z-30">
              <div className="flex items-center space-x-3">
                {activeTab !== "overview" && (
                  <button
                    type="button"
                    onClick={() => setDashboardSidebarOpen(!dashboardSidebarOpen)}
                    className="p-2 text-[#201b12]/60 hover:text-[#b38e42] hover:bg-[#201b12]/5 rounded-xl transition-all cursor-pointer"
                    title="Toggle sidebar"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                )}
                <h1 className="text-2xl font-black italic text-[#A68A3D] tracking-wide">
                  {activeTab === "overview" && "Dashboard"}
                  {activeTab === "scanAnalyzer" && "Plan Analyzer"}
                  {activeTab === "floorplan" && "AI Floor Planner"}
                  {activeTab === "boq" && "Saved History"}
                  {activeTab === "files" && "AI Chatbot"}
                  {activeTab === "messages" && "Client Chat"}
                  {activeTab === "settings" && "Settings"}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Bell icon */}
                <div 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="h-8 w-8 rounded-full bg-[#FAF7F0] border border-[#1E1C18]/5 flex items-center justify-center relative cursor-pointer hover:bg-brand-cream-dark transition-all shadow-sm"
                >
                  <Bell className="h-5 w-5 text-[#A68A3D] hover:scale-105 transition-transform" />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-rose-600 rounded-full flex items-center justify-center text-[8px] font-black text-white border border-white">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </div>

                {/* User profile icon */}
                <div 
                  onClick={() => setActiveTab("settings")}
                  className="h-8 w-8 rounded-full bg-[#FAF7F0] border border-[#1E1C18]/5 flex items-center justify-center relative cursor-pointer hover:bg-brand-cream-dark transition-all shadow-sm"
                >
                  <UserIcon className="h-5 w-5 text-[#A68A3D] hover:scale-105 transition-transform" />
                </div>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-8 top-16 w-80 bg-white border border-[#1E1C18]/10 rounded-3xl shadow-xl p-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="flex items-center justify-between border-b border-[#1E1C18]/5 pb-3 mb-3">
                        <span className="text-xs font-black text-[#1E1C18]">Notifications</span>
                        <button 
                          onClick={() => {
                            setNotifications(notifications.map(n => ({ ...n, unread: false })));
                            showToast("All notifications marked as read!");
                          }}
                          className="text-[9px] font-black text-[#A68A3D] hover:text-[#806626] uppercase tracking-wider transition-colors"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-5 text-center text-xs text-brand-dark/40 font-semibold italic">
                            No new notifications
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                setNotifications(notifications.map(item => item.id === n.id ? { ...item, unread: false } : item));
                                setShowNotifications(false);
                                if (n.text.includes("plan") || n.text.includes("Plan")) setActiveTab("scanAnalyzer");
                                if (n.text.includes("feedback") || n.text.includes("BOQ")) setActiveTab("boq");
                              }}
                              className={`p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                                n.unread ? "bg-brand-gold/5 hover:bg-brand-gold/10 font-bold border-l-2 border-brand-gold" : "hover:bg-[#FAF7F0] text-brand-dark/70"
                              }`}
                            >
                              {n.text}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </header>
          )}

          {/* Page content */}
          {activeTab === "files" ? (
            <div className="flex-grow flex flex-col overflow-hidden p-4 md:p-6 bg-[#FAF7F0]/40">
              <CostHelperChatbot 
                layoutMode="embedded" 
                onBack={() => setActiveTab("overview")} 
                userOverride={user} 
                logoutOverride={logout} 
                dashboardSidebarOpen={dashboardSidebarOpen}
                setDashboardSidebarOpen={setDashboardSidebarOpen}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-[#FAF7F0]/40 relative flex flex-col">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#b38e42_1px,transparent_1px)] [background-size:20px_20px]" />
            
            {/* Global toast status bar */}
            {customNotification && (
              <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-xl bg-brand-dark px-5 py-4 text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
                <Sparkles className="h-4 w-4 text-brand-gold animate-pulse" />
                <span>{customNotification}</span>
              </div>
            )}

            {activeTab === "overview" && sentQuotesList.length === 0 ? (
              <div className="p-8 flex-grow flex flex-col min-h-0">
                <div 
                  className="relative flex-grow overflow-hidden flex flex-col justify-center px-8 sm:px-12 select-none bg-cover bg-center shrink-0 rounded-3xl animate-in fade-in duration-300 shadow-sm"
                  style={{ backgroundImage: "url('/assets/domnak-landing.png')" }}
                >
                  {/* Overlays to match home page hero */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#201b12]/95 via-[#201b12]/75 to-transparent z-0" />
                  <div className="absolute inset-0 bg-[#201b12]/20 backdrop-brightness-[0.9] z-0" />
                  
                  <div className="relative z-10 max-w-xl space-y-5 flex flex-col items-start pl-8 sm:pl-12 md:pl-16">
                    <h2 className="text-white text-5xl sm:text-6xl md:text-6xl font-extrabold leading-tight tracking-tight relative z-10">
                      Welcome to Architecture Hub
                      <br />
                      <span className="text-brand-gold italic font-semibold text-5xl sm:text-6xl md:text-6xl block mt-1 select-text relative z-10">
                        {capitalizeName(user?.name || "Sopheap Meas")}
                      </span>
                    </h2>
                    <div className="flex items-center gap-6 mt-4 flex-wrap relative z-10">
                      <button 
                        onClick={() => setActiveTab("scanAnalyzer")}
                        className="inline-flex items-center justify-center rounded-full border-2 border-brand-gold px-8 py-3.5 text-sm font-bold text-white bg-brand-gold/15 hover:bg-brand-gold hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-brand-gold/20 cursor-pointer relative z-10"
                      >
                        Analyze Plan
                      </button>
                      <span 
                        onClick={() => setActiveTab("boq")}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-brand-gold transition-all duration-200 cursor-pointer relative z-10 group"
                      >
                        View Saved Estimates
                        <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 max-w-7xl mx-auto space-y-8 w-full flex-grow flex flex-col">
                
                {/* Header section with page title */}
                {activeTab !== "scanAnalyzer" && (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E1C18]/5 pb-6">
                    <div>
                      <h1 className="text-2xl font-black text-brand-dark tracking-tight">
                        {activeTab === "overview"      && "Studio Management & Overview"}
                        {activeTab === "floorplan"     && "AI Floor Plan Generator"}
                        {activeTab === "boq"           && "Saved Estimates & Drafts History"}
                        {activeTab === "files"         && "AI Chatbot"}
                        {activeTab === "messages"      && `Client Messages: ${activeClient.name}`}
                        {activeTab === "settings"      && "Studio Profile Configurations"}
                      </h1>
                      <p className="text-xs text-brand-dark/50 mt-1 max-w-2xl font-semibold leading-relaxed">
                        {activeTab === "overview"      && "Track client project milestones, coordinate shared folders, and review requests."}
                        {activeTab === "floorplan"     && "Generate optimized 2D/3D floor layouts using AI. Adjust rooms, styles, and prompt parameters."}
                        {activeTab === "boq"           && "Browse, download, or edit your saved drafts and sent estimates."}
                        {activeTab === "files"         && "Maintain blueprints, upload rendering proposals, and audit client structural specs."}
                        {activeTab === "messages"      && "Coordinate client alignment meetings, verify layout changes, and clarify budgets."}
                        {activeTab === "settings"      && "Configure studio portfolio descriptions, active location settings, and studio credentials."}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB CONTENTS */}

                {/* 1. OVERVIEW & CLIENTS TAB */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
              
              {/* Clients directory grid */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-brand-dark/5 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-brand-dark/5 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
                        <Users className="h-5 w-5 text-brand-gold" />
                        Active Client Directory
                      </h3>
                      <p className="text-xs text-brand-dark/50">Manage your connected homeowners and build locations.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddClientModal(true)}
                      className="bg-[#A68A3D] hover:bg-[#8d7431] text-white text-[11px] font-black px-4 py-2.5 rounded-xl cursor-pointer shadow transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Connect Client
                    </button>
                  </div>

                  <div className="divide-y divide-brand-dark/5">
                    {clients.length === 0 ? (
                      <div className="p-12 text-center space-y-3 animate-in fade-in duration-300">
                        <Users className="h-10 w-10 text-brand-dark/20 mx-auto" />
                        <p className="text-sm font-black text-brand-dark">No connected clients found</p>
                        <p className="text-xs text-brand-dark/45 max-w-sm mx-auto">
                          Start by connecting a client to collaborate on floor plan analyses and estimates.
                        </p>
                      </div>
                    ) : (
                      clients.map((client) => {
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
                    })
                  )}
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
                      <span className="font-extrabold text-white">{clients.length} Projects</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-white/60">Total Budget Value</span>
                      <span className="font-extrabold text-white">${clients.reduce((acc, c) => acc + c.budget, 0).toLocaleString()}</span>
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

              {/* Connect Homeowner Client Modal */}
              {showAddClientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                  <form onSubmit={handleAddClient} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 space-y-6 border border-brand-dark/5 relative animate-in zoom-in-95 duration-200">
                    <button
                      type="button"
                      onClick={() => setShowAddClientModal(false)}
                      className="absolute top-4 right-4 p-2 rounded-full hover:bg-brand-dark/5 text-brand-dark/40 hover:text-brand-dark transition-all cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                          <Users className="h-4.5 w-4.5 text-brand-gold" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-brand-dark">Connect Homeowner</h3>
                          <p className="text-xs text-brand-dark/50 font-medium">Create a new client collaboration profile.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-brand-dark/50 uppercase tracking-wider mb-2">Homeowner Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sophal Chan"
                          value={newClientData.name}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full text-xs font-bold text-brand-dark bg-[#FAF7F0] border border-brand-dark/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-brand-dark/50 uppercase tracking-wider mb-2">Project Name / Property Type</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2-Story Premium Family Villa"
                          value={newClientData.project}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, project: e.target.value }))}
                          className="w-full text-xs font-bold text-brand-dark bg-[#FAF7F0] border border-brand-dark/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-brand-dark/50 uppercase tracking-wider mb-2">Build Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Phnom Penh, BKK1"
                            value={newClientData.location}
                            onChange={(e) => setNewClientData(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full text-xs font-bold text-brand-dark bg-[#FAF7F0] border border-brand-dark/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-brand-dark/50 uppercase tracking-wider mb-2">Total Budget ($)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 150000"
                            value={newClientData.budget}
                            onChange={(e) => setNewClientData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                            className="w-full text-xs font-bold text-brand-dark bg-[#FAF7F0] border border-brand-dark/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold shadow-sm text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddClientModal(false)}
                        className="flex-grow py-3 rounded-xl border border-brand-dark/10 text-xs font-black text-brand-dark hover:bg-brand-dark/5 transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-grow py-3 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                      >
                        Save Connection
                      </button>
                    </div>
                  </form>
                </div>
              )}
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
                      <button type="button" onClick={() => showToast("Showing furniture templates")} title="Living furniture" className="w-7.5 h-7.5 rounded-full bg-[#FAF7F0] hover:bg-brand-gold/15 text-brand-dark flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"><Armchair className="h-4 w-4 text-brand-gold" /></button>
                      <button type="button" onClick={() => showToast("Showing bedroom layout configurations")} title="Bed configurations" className="w-7.5 h-7.5 rounded-full bg-[#FAF7F0] hover:bg-brand-gold/15 text-brand-dark flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"><Bed className="h-4 w-4 text-brand-gold" /></button>
                      <button type="button" onClick={() => showToast("Showing cabinet layouts")} title="Cabinets & drawers" className="w-7.5 h-7.5 rounded-full bg-[#FAF7F0] hover:bg-brand-gold/15 text-brand-dark flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"><FolderOpen className="h-4 w-4 text-brand-gold" /></button>
                      <button type="button" onClick={() => showToast("Showing bathroom fixtures")} title="Bathroom fixtures" className="w-7.5 h-7.5 rounded-full bg-[#FAF7F0] hover:bg-brand-gold/15 text-brand-dark flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"><Bath className="h-4 w-4 text-brand-gold" /></button>
                      <button type="button" onClick={() => showToast("Showing indoor landscape items")} title="Decor & plants" className="w-7.5 h-7.5 rounded-full bg-[#FAF7F0] hover:bg-brand-gold/15 text-brand-dark flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"><Flower className="h-4 w-4 text-brand-gold" /></button>
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

          {/* 2. SAVED ESTIMATES & DRAFTS HISTORY TAB */}
          {activeTab === "boq" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Saved Estimates List Card */}
              <div className="bg-white border border-brand-dark/5 rounded-3xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-dark/5 px-6 py-5">
                  <div>
                    <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
                      <History className="h-5 w-5 text-brand-gold" />
                      Saved Estimates &amp; Drafts
                    </h3>
                    <p className="text-xs text-brand-dark/50">Browse and manage estimates you have saved as drafts or sent to clients.</p>
                  </div>
                  <div className="bg-[#FAF7F0] border border-brand-dark/5 px-4 py-2.5 rounded-2xl shadow-inner text-xs font-black text-brand-dark">
                    Total Saved: <span className="text-brand-gold ml-1 bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/20">{sentQuotesList.length}</span>
                  </div>
                </div>

                {sentQuotesList.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <History className="h-10 w-10 text-brand-dark/20 mx-auto" />
                    <p className="text-sm font-black text-brand-dark">No saved estimates or drafts found.</p>
                    <p className="text-xs text-brand-dark/45 max-w-sm mx-auto">
                      Go to the Plan Analyzer, upload a floor plan, and click &quot;Save Draft&quot; or &quot;Send Quote to Client&quot; to save your estimates here.
                    </p>
                    <button
                      onClick={() => setActiveTab("scanAnalyzer")}
                      className="bg-brand-gold hover:bg-brand-gold-dark text-white text-xs font-black px-4 py-2 rounded-xl mt-4 cursor-pointer shadow transition-all"
                    >
                      Open Plan Analyzer
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse">
                      <thead>
                        <tr className="bg-[#FAF7F0]/60 border-b border-brand-dark/5 text-left">
                          <th className="px-6 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider">Project / Drawing Name</th>
                          <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Floor Area</th>
                          <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Grand Total</th>
                          <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Recipient / Status</th>
                          <th className="px-4 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider text-center">Date Saved</th>
                          <th className="px-6 py-4 text-[10px] font-black text-brand-dark/60 tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-dark/5 text-xs">
                        {sentQuotesList.map((quote) => (
                          <tr key={quote.id} className="hover:bg-brand-gold/5 transition-colors">
                            <td className="px-6 py-4 font-extrabold text-brand-dark">
                              <span className="truncate block max-w-xs">{quote.fileName || "Scanned Plan"}</span>
                            </td>
                            <td className="px-4 py-4 text-center font-bold text-brand-dark/70">
                              {quote.area || "—"} m²
                            </td>
                            <td className="px-4 py-4 text-center font-black text-brand-gold">
                              ${Math.round(quote.total).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {quote.clientId === "draft" ? (
                                <span className="bg-brand-dark/5 text-brand-dark/70 px-2.5 py-1 rounded-lg border border-brand-dark/10 font-bold uppercase text-[9px] tracking-wider">
                                  Draft
                                </span>
                              ) : (
                                <span className="bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold uppercase text-[9px] tracking-wider">
                                  {quote.clientName || "Sent"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-center font-semibold text-brand-dark/45">
                              {new Date(quote.sentAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleLoadSavedQuote(quote)}
                                className="bg-brand-gold hover:bg-brand-gold-dark text-white px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                              >
                                Open Estimate
                              </button>
                              <button
                                onClick={() => handleDeleteSavedQuote(quote.id)}
                                className="bg-rose-500/10 hover:bg-rose-50 text-rose-500 hover:text-white border border-rose-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer inline-flex items-center justify-center"
                                title="Delete Estimate"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                            id: floorPlanId || `q_${Date.now()}`,
                            floorPlanId: floorPlanId,
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
                          setNotifications(prev => [{ id: `n_sent_${Date.now()}`, text: `Estimate sent to ${selectedClient?.name || "Client"}`, unread: true }, ...prev]);
                          showToast(`Quote sent to ${selectedClient?.name}!`);
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
                      <span className="text-[10px] text-brand-dark/30 mt-4 bg-brand-dark/5 px-5 py-1.5 rounded-full font-bold tracking-wide uppercase">PNG, JPG, JPEG — Max 10 MB</span>
                      <input type="file" className="hidden" accept=".png,.jpg,.jpeg" onChange={handleScanFileChange} />
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
                      <input type="file" className="hidden" accept=".png,.jpg,.jpeg" onChange={handleScanFileChange} />
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
                      /* Reset Tailwind layouts for printing */
                      html, body, #__next, [class*="h-screen"], [class*="overflow-hidden"], [class*="overflow-y-auto"] {
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                        position: static !important;
                      }
                      
                      /* Hide everything by default */
                      body * {
                        visibility: hidden;
                      }
                      
                      /* Show only the BOQ area and its children */
                      #printable-boq-area, #printable-boq-area * {
                        visibility: visible !important;
                      }
                      
                      /* Align BOQ area at top left of print canvas */
                      #printable-boq-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        display: block !important;
                        background: white !important;
                      }
                      
                      /* Hard hide interface items like buttons and sidebars */
                      .no-print, button, aside, header, nav, select, input {
                        display: none !important;
                        visibility: hidden !important;
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
                      {/* Export Dropdown */}
                      <div className="relative" ref={exportDropdownRef}>
                        <button
                          onClick={() => setShowExportDropdown(!showExportDropdown)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-dark/10 text-xs font-black text-brand-dark hover:bg-brand-dark/5 transition-all cursor-pointer bg-white"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export As
                          <ChevronDown className="h-3 w-3 text-brand-dark/50 ml-0.5" />
                        </button>
                        
                        {showExportDropdown && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-brand-dark/5 rounded-2xl shadow-xl py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={() => { handleExportPDF(); setShowExportDropdown(false); }}
                              className="w-full text-left px-4 py-2.5 text-xs text-brand-dark hover:bg-brand-gold/10 hover:text-brand-gold font-bold transition-all flex items-center gap-2.5 cursor-pointer"
                            >
                              <FileText className="h-4 w-4 text-brand-gold" />
                              PDF Document (.pdf)
                            </button>
                            <button
                              onClick={() => { handleExportWord(); setShowExportDropdown(false); }}
                              className="w-full text-left px-4 py-2.5 text-xs text-brand-dark hover:bg-brand-gold/10 hover:text-brand-gold font-bold transition-all flex items-center gap-2.5 cursor-pointer"
                            >
                              <FileText className="h-4 w-4 text-brand-gold" />
                              Word Document (.docx)
                            </button>
                            <button
                              onClick={() => { handleExportCSV(); setShowExportDropdown(false); }}
                              className="w-full text-left px-4 py-2.5 text-xs text-brand-dark hover:bg-brand-gold/10 hover:text-brand-gold font-bold transition-all flex items-center gap-2.5 cursor-pointer"
                            >
                              <FileText className="h-4 w-4 text-brand-gold" />
                              Spreadsheet (.csv)
                            </button>
                          </div>
                        )}
                      </div>
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

                  <div id="screen-boq-area" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:hidden">

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

                      {/* Room Breakdown Card */}
                      <div className="bg-white border border-brand-dark/5 rounded-3xl p-6 shadow-sm space-y-4">
                        <h3 className="font-black text-xs text-brand-dark tracking-widest uppercase border-b border-brand-dark/5 pb-3 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-brand-gold" />
                            Room Breakdown
                          </span>
                          <button
                            onClick={handleAddScanRoom}
                            className="text-[10px] bg-brand-dark text-white hover:bg-brand-gold px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer"
                          >
                            + Add Room
                          </button>
                        </h3>
                        
                        <div className="space-y-3">
                          {scanRooms.map((room) => (
                            <div key={room.id} className="p-3 bg-[#FAF7F0]/60 border border-brand-dark/5 rounded-2xl space-y-2.5 relative group">
                              <button
                                onClick={() => handleDeleteScanRoom(room.id)}
                                className="absolute top-2 right-2 p-1 text-brand-dark/30 hover:text-rose-500 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                title="Delete Room"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              
                              {/* Room Name Input */}
                              <input
                                type="text"
                                value={room.name}
                                onChange={(e) => updateScanRoomField(room.id, "name", e.target.value)}
                                className="w-4/5 text-xs font-black text-brand-dark bg-transparent border-b border-transparent hover:border-brand-dark/20 focus:border-brand-gold focus:outline-none pb-0.5"
                                placeholder="Room name"
                              />
                              
                              {/* Dimensions Inputs */}
                              <div className="flex items-center gap-2 text-[10px] text-brand-dark/50 font-bold">
                                <div className="flex items-center gap-1 bg-white border border-brand-dark/10 rounded-lg px-2 py-1">
                                  <span>W:</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={room.width}
                                    onChange={(e) => updateScanRoomField(room.id, "width", e.target.value)}
                                    className="w-10 text-center font-black text-brand-dark focus:outline-none bg-transparent"
                                  />
                                  <span>m</span>
                                </div>
                                <span>&times;</span>
                                <div className="flex items-center gap-1 bg-white border border-brand-dark/10 rounded-lg px-2 py-1">
                                  <span>L:</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={room.length}
                                    onChange={(e) => updateScanRoomField(room.id, "length", e.target.value)}
                                    className="w-10 text-center font-black text-brand-dark focus:outline-none bg-transparent"
                                  />
                                  <span>m</span>
                                </div>
                                <span className="text-brand-dark/80 ml-auto font-mono">
                                  = {(room.width * room.length).toFixed(1)} m²
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Combined Sticky Card: Metrics + Summary */}
                      <div className="lg:sticky lg:top-4 bg-brand-dark text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5 no-print">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/15 rounded-bl-full pointer-events-none" />
                        
                        {/* Section A: Extracted Metrics */}
                        <div className="space-y-3">
                          <h4 className="font-black text-xs tracking-widest uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-brand-gold" />
                            Extracted Metrics
                          </h4>
                          <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                            <div>
                              <label className="text-white/55 font-bold block mb-1">Floor Area (m²)</label>
                              <input
                                type="number"
                                value={scanResults.area || 0}
                                onChange={(e) => updateScanResultField("area", parseFloat(e.target.value) || 0)}
                                className="w-full bg-white/10 text-white border border-white/20 focus:border-brand-gold focus:outline-none rounded-xl px-2.5 py-1.5 font-black transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-white/55 font-bold block mb-1">Wall Length (m)</label>
                              <input
                                type="number"
                                value={scanResults.wallLength || 0}
                                onChange={(e) => updateScanResultField("wallLength", parseFloat(e.target.value) || 0)}
                                className="w-full bg-white/10 text-white border border-white/20 focus:border-brand-gold focus:outline-none rounded-xl px-2.5 py-1.5 font-black transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-white/55 font-bold block mb-1">Roof Area (m²)</label>
                              <input
                                type="number"
                                value={scanResults.roofArea || 0}
                                onChange={(e) => updateScanResultField("roofArea", parseFloat(e.target.value) || 0)}
                                className="w-full bg-white/10 text-white border border-white/20 focus:border-brand-gold focus:outline-none rounded-xl px-2.5 py-1.5 font-black transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-white/55 font-bold block mb-1">Foundation Type</label>
                              <select
                                value={scanResults.foundationType || "Pad & Strip"}
                                onChange={(e) => updateScanResultField("foundationType", e.target.value)}
                                className="w-full bg-white/15 text-white border border-white/20 focus:border-brand-gold focus:outline-none rounded-xl px-2.5 py-1.5 font-black transition-all cursor-pointer"
                                style={{ colorScheme: "dark" }}
                              >
                                <option value="Pad & Strip" className="bg-brand-dark text-white font-bold">Pad & Strip</option>
                                <option value="Raft / Slab foundation" className="bg-brand-dark text-white font-bold">Raft / Slab foundation</option>
                                <option value="Pile foundation" className="bg-brand-dark text-white font-bold">Pile foundation</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        {/* Section B: Grand Total Summary */}
                        <div className="space-y-2 border-t border-white/10 pt-3 text-[11px] font-semibold text-white/80">
                          <div className="flex justify-between">
                            <span className="text-white/55">Total Material:</span>
                            <span className="text-white font-black">${Math.round(scanBoq.filter(i => i.name !== "Construction Labor & Project Supervision").reduce((acc, i) => acc + (i.rate * i.quantity * (1 + i.markup / 100)), 0)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/55">Total Labor:</span>
                            <span className="text-white font-black">${Math.round(scanBoq.find(i => i.name === "Construction Labor & Project Supervision")?.rate || 22000).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t border-white/10 pt-2 font-black text-xs text-white">
                            <span>Grand Budget:</span>
                            <span className="text-brand-gold">${Math.round(calculateScanBoqTotal()).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-white/45 font-bold">
                            <span>Cost per m²:</span>
                            <span>${(calculateScanBoqTotal() / (scanResults?.area || 1)).toFixed(2)} / m²</span>
                          </div>
                        </div>
                        
                        {/* Recalculate Button */}
                        <button
                          onClick={handleRecalculateBoq}
                          className="w-full bg-brand-gold hover:bg-brand-gold-dark text-white py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-97"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Confirm &amp; Recalculate BOQ
                        </button>
                        
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
                              <th className="w-[320px] px-6 py-4 text-[10px] font-black text-brand-dark/60 uppercase tracking-wider">Item Description</th>
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
                                    className="w-full text-xs font-extrabold text-brand-dark bg-brand-dark/5 hover:bg-brand-dark/10 focus:bg-white border border-brand-dark/10 focus:border-brand-gold rounded-xl px-3 py-1.5 focus:outline-none transition-all shadow-inner"
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

                      {/* Add Item Trigger Block */}
                      <div className="px-6 py-3 bg-[#FAF7F0]/40 border-t border-brand-dark/5 flex items-center">
                        <button
                          onClick={handleAddScanBoqItem}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-dark hover:bg-brand-gold text-white text-xs font-black transition-all cursor-pointer shadow-md"
                        >
                          <Plus className="h-3.5 w-3.5 text-brand-gold" />
                          Add Custom Material Row
                        </button>
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

                  {/* ── PRINT-ONLY DETAILED REPORT TEMPLATE ───────────────────────── */}
                  <div id="printable-boq-area" className="hidden print:block bg-white p-8 font-sans text-brand-dark w-full max-w-[800px] mx-auto">
                    
                    {/* Document Header */}
                    <div className="text-center border-b-2 border-brand-dark/20 pb-6 mb-8">
                      <h1 className="text-3xl font-black tracking-tight text-brand-dark uppercase">Bill of Quantities (BOQ)</h1>
                      <p className="text-xs font-bold text-brand-gold uppercase tracking-wider mt-1">Detailed Estimate & Construction Cost Model</p>
                      <p className="text-[10px] text-brand-dark/40 font-semibold mt-2">Generated via DomNak AI Core Engine · Project ID: {Date.now().toString().slice(-6)}</p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-8 text-xs border border-brand-dark/10 rounded-2xl p-5 mb-8 bg-[#FAF7F0]/30">
                      <div className="space-y-2">
                        <p><strong className="text-brand-dark/60 font-semibold uppercase text-[9px] block">Project Details:</strong></p>
                        <p className="font-bold text-brand-dark">Source File: <span className="font-medium text-brand-dark/70">{scanFile?.name}</span></p>
                        <p className="font-bold text-brand-dark">Total Floor Area: <span className="font-medium text-brand-dark/70">{scanResults.area} m²</span></p>
                        <p className="font-bold text-brand-dark">Est. Wall Length: <span className="font-medium text-brand-dark/70">{scanResults.wallLength} lin.m</span></p>
                        <p className="font-bold text-brand-dark">Est. Roof Area: <span className="font-medium text-brand-dark/70">{scanResults.roofArea} m²</span></p>
                      </div>
                      <div className="space-y-2">
                        <p><strong className="text-brand-dark/60 font-semibold uppercase text-[9px] block">Architect & Studio:</strong></p>
                        <p className="font-bold text-brand-dark">Studio: <span className="font-medium text-brand-dark/70">{user?.company || "Angkor Architecture Studio"}</span></p>
                        <p className="font-bold text-brand-dark">Lead Architect: <span className="font-medium text-brand-dark/70">{user?.name || "Sopheap Meas"}</span></p>
                        <p className="font-bold text-brand-dark">Rooms Layout: <span className="font-medium text-brand-dark/70">{scanResults.roomCount} Rooms / {scanResults.bathroomCount} Bath</span></p>
                        <p className="font-bold text-brand-dark">Report Date: <span className="font-medium text-brand-dark/70">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                      </div>
                    </div>

                    {/* BOQ Table */}
                    <div className="mb-8">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="border-b-2 border-brand-dark text-left bg-[#FAF7F0]">
                            <th className="py-3 px-2 font-black uppercase text-[10px] text-brand-dark">Item Description</th>
                            <th className="py-3 px-2 font-black uppercase text-[10px] text-brand-dark text-center">Unit</th>
                            <th className="py-3 px-2 font-black uppercase text-[10px] text-brand-dark text-right">Rate ($)</th>
                            <th className="py-3 px-2 font-black uppercase text-[10px] text-brand-dark text-right">Quantity</th>
                            <th className="py-3 px-2 font-black uppercase text-[10px] text-brand-dark text-right">Markup</th>
                            <th className="py-3 px-2 font-black uppercase text-[10px] text-brand-dark text-right">Total ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-dark/10">
                          {scanBoq.map((item) => {
                            const totalVal = item.rate * item.quantity * (1 + item.markup / 100);
                            return (
                              <tr key={item.id} className="page-break-inside-avoid">
                                <td className="py-3 px-2 font-bold text-brand-dark">{item.name}</td>
                                <td className="py-3 px-2 text-center text-brand-dark/80">{item.unit}</td>
                                <td className="py-3 px-2 text-right text-brand-dark/80">${item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="py-3 px-2 text-right text-brand-dark/80">{item.quantity}</td>
                                <td className="py-3 px-2 text-right text-brand-dark/80">{item.markup}%</td>
                                <td className="py-3 px-2 text-right font-black text-brand-dark">${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Cards */}
                    <div className="border-t-2 border-brand-dark pt-4 mb-12 flex justify-end">
                      <div className="w-80 space-y-2.5 text-xs">
                        <div className="flex justify-between font-semibold text-brand-dark/70">
                          <span>Estimated Material Subtotal:</span>
                          <span>${scanBoq.filter(i => i.name !== "Construction Labor & Project Supervision").reduce((acc, i) => acc + (i.rate * i.quantity), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-brand-dark/70">
                          <span>Total Markup Applied:</span>
                          <span>${scanBoq.reduce((acc, i) => acc + (i.rate * i.quantity * (i.markup / 100)), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-brand-dark/70">
                          <span>Labor & Supervision:</span>
                          <span>${(scanBoq.find(i => i.name === "Construction Labor & Project Supervision")?.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="h-px bg-brand-dark/10" />
                        <div className="flex justify-between text-sm font-black text-brand-dark">
                          <span>Grand Total (incl. markup):</span>
                          <span className="text-base text-brand-gold font-extrabold">${calculateScanBoqTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Signature blocks */}
                    <div className="grid grid-cols-2 gap-12 text-xs mt-16 pt-8 border-t border-brand-dark/10 page-break-inside-avoid">
                      <div className="space-y-12">
                        <p className="text-brand-dark/50 uppercase tracking-wider text-[9px] font-black">Prepared & Verified By</p>
                        <div className="border-b border-brand-dark/30 pb-2">
                          <p className="font-bold text-brand-dark">{user?.name || "Sopheap Meas"}</p>
                          <p className="text-[10px] text-brand-dark/50 mt-0.5">Lead Architect, {user?.company || "Angkor Studio"}</p>
                        </div>
                      </div>
                      <div className="space-y-12">
                        <p className="text-brand-dark/50 uppercase tracking-wider text-[9px] font-black">Approved & Accepted By</p>
                        <div className="border-b border-brand-dark/30 pb-2">
                          <p className="font-bold text-brand-dark/40">Client Signature</p>
                          <p className="text-[10px] text-brand-dark/50 mt-0.5">Date: ____ / ____ / ________</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

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
                    lastMsg: last?.text || "",
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
                    const currentClient = clients.find(x => x.id === selectedClientId);
                    setNotifications(prev => [{ id: `n_chat_${Date.now()}`, text: `New message from ${currentClient?.name || "Homeowner"}`, unread: true }, ...prev]);
                  }, 1500);
                }}
                isTyping={isClientTyping}
                activeContact={(() => {
                  const c = clients.find(x => x.id === selectedClientId) || clients[0] || { name: "Homeowner", project: "No active project" };
                  return {
                    name: c.name,
                    role: c.project,
                    project: c.project,
                    initials: c.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
                  };
                })()}
                placeholder={`Message ${(clients.find(x => x.id === selectedClientId) || clients[0])?.name || "Homeowner"}…`}
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
            )}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
