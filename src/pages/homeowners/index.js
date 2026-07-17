import { useState, useEffect, useRef } from "react";
import { getToken } from "@/lib/api/client";
import Head from "next/head";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatUI from "@/components/ChatUI";
import CostHelperChatbot from "@/components/chatbot/CostHelperChatbot";
import ManualQuoteForm from "@/components/homeowners/ManualQuoteForm";
import SupplierDirectory from "@/components/suppliers/SupplierDirectory";
import { useAuth } from "../../../router/useAuth";
import { 
  getQuotes, 
  createQuote, 
  deleteQuote, 
  updateQuote,
  getReceivedQuotes,
  getSuppliers, 
  uploadPdf,
  getAnalysisResults,
  getConversation,
  sendMessage,
  deleteMessage
} from "@/lib/api/index";
import { listConnections, listContacts, sendInvite, acceptInvite, rejectInvite, acceptInviteByToken, getMyShareLink, getNotifications, markNotificationRead } from "@/lib/api/connection";
import styles from "./Homeowners.module.css";
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
  Inbox,
  User,
  Bell,
  Bot,
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
  LogOut,
  Menu,
  X,
  Check,
  XCircle
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

const FALLBACK_SUPPLIERS = [
  { name: "Camel Cement Cambodia",    category: "Cement & Concrete",    badge: "⭐ Top Rated", location: "Phnom Penh" },
  { name: "Siam Cement Group",        category: "Structural Materials", badge: "🏆 Premium",   location: "Kandal Province" },
  { name: "Heng Hardware Co.",        category: "Steel & Rebars",       badge: "✅ Verified",  location: "Toul Kork" },
  { name: "Angkor Tiles & Ceramics",  category: "Flooring & Tiles",     badge: "✅ Verified",  location: "Chamkar Mon" },
  { name: "PPM Electrical Supply",    category: "Electrical Works",     badge: "⭐ Top Rated", location: "Sen Sok" },
  { name: "PhnomPenh Lumber Co.",     category: "Timber & Doors",       badge: "✅ Verified",  location: "Russei Keo" },
];

export default function HomeownersPage() {
  const { user, logout } = useAuth();

  const capitalizeName = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Sidebar Tab State
  const [sidebarTab, setSidebarTab] = useState("home"); // "home" | "quotes" | "history" | "received" | "suppliers" | "chat" | "chatbot"
  const [dashboardSidebarOpen, setDashboardSidebarOpen] = useState(false);
  const [receivedQuotes, setReceivedQuotes] = useState([]);
  const [receivedQuoteToReview, setReceivedQuoteToReview] = useState(null);

  // Stored Audit History & Profile details
  const [auditHistory, setAuditHistory] = useState([]);
  const [suppliersList, setSuppliersList] = useState(FALLBACK_SUPPLIERS);
  const [profileLocation, setProfileLocation] = useState("Phnom Penh, Cambodia");
  const [profileBudget, setProfileBudget] = useState(150000);
  const [profileStartDate, setProfileStartDate] = useState("Q3 2026");
  const [profilePropertyType, setProfilePropertyType] = useState("villa"); // "villa" | "condo" | "townhouse"
  const [selectedSavedAuditId, setSelectedSavedAuditId] = useState(null);

  // Architect Chat History
  const [architectChat, setArchitectChat] = useState([]);
  const [architectInput, setArchitectInput] = useState("");
  const [chatContacts, setChatContacts] = useState([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatSending, setChatSending] = useState(false);

  // Connection / Invite State
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showInviteBanner, setShowInviteBanner] = useState(false);
  const [myShareLink, setMyShareLink] = useState("");
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Core Navigation State
  const [activePreset, setActivePreset] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [aiAnalysisResults, setAiAnalysisResults] = useState([]);
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
  
  const isAiParsed = rooms.some(r => r.unit_price !== undefined || r.unit !== undefined);
  const totalAuditedVal = auditHistory.reduce((acc, a) => acc + (a.quotedPrice || 0), 0);
  const averageQuotePrice = auditHistory.length > 0 ? Math.round(totalAuditedVal / auditHistory.length) : 0;
  const totalAuditsRun = auditHistory.length;
  const maxQuoteVal = auditHistory.reduce((acc, a) => Math.max(acc, a.quotedPrice || 0), 1);

  // Sync quotedPrice with AI parsed rooms total
  useEffect(() => {
    if (isAiParsed && rooms.length > 0) {
      const sum = rooms.reduce((acc, r) => acc + (parseFloat(r.total_price) || 0), 0);
      if (sum > 0) {
        setQuotedPrice(sum);
      }
    }
  }, [rooms, isAiParsed]);
  
  // UI Interaction States
  const [hoveredRoomId, setHoveredRoomId] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("Ground Floor");
  const [customNotification, setCustomNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // UI Interaction States (end)

  // BoQ Item Explanation Accordion State
  const [expandedBoqItem, setExpandedBoqItem] = useState(null);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatBottomRef = useRef(null);
  const activeQuoteIdRef = useRef(null);

  // Initialize localStorage data and fetch from backend on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
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

  // Initialize AI Chatbot Messages if empty
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          sender: "ai",
          text: "Hello! I'm DomNak AI, your personal construction cost assistant. Ask me anything about building costs, contractor quotes, or how to generate a Bill of Quantities (BOQ) in Cambodia."
        }
      ]);
    }
  }, [chatMessages]);

  // Load quotes from backend (merge with localStorage data)
  useEffect(() => {
    // First, load from localStorage for immediate display
    const storedHistory = localStorage.getItem("domnak_audit_history");
    if (storedHistory) {
      try {
        setAuditHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse stored history:", e);
      }
    }
    
    // Then fetch from backend to sync
    if (user) {
      getQuotes()
        .then((response) => {
          if (response && response.data && response.data.length > 0) {
            const mappedHistory = response.data.map(q => ({
              id: q.id,
              date: new Date(q.created_at || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
              projectName: q.project_name || "Project Estimate",
              contractorName: q.contractor_name || "Contractor Name",
              quotedPrice: q.total_amount || 0,
              qualityTier: q.quality_tier || "premium",
              rooms: q.rooms || []
            }));
            setAuditHistory(mappedHistory);
            localStorage.setItem("domnak_audit_history", JSON.stringify(mappedHistory));
          }
        })
        .catch((err) => console.log("Offline or local history mode only:", err));
    }
  }, [user]);

  // Helper to parse quote info from chat messages
  const parseQuotesFromMessages = (messages) => {
    const quoteRegex = /New Quote from (.+?)\n\nFile: (.+?)\nTotal: \$([\d,]+\.?\d*)/g;
    const quotes = [];
    for (const msg of messages) {
      const content = msg.text || msg.content || "";
      let match;
      while ((match = quoteRegex.exec(content)) !== null) {
        quotes.push({
          id: `msg_${msg.id}`,
          sender_name: match[1], // contractor_name -> sender_name for UI
          contractor_name: match[1],
          file_name: match[2],
          total_amount: parseFloat(match[3].replace(/,/g, "")),
          created_at: msg.created_at || msg.time,
          from_message: true,
          message_id: msg.id
        });
      }
    }
    return quotes;
  };

  // Load received quotes from architects
  useEffect(() => {
    if (user) {
      Promise.all([
        getReceivedQuotes().catch(() => ({ data: [] })),
      ])
        .then(([quotesResponse]) => {
          const dbQuotes = quotesResponse?.data || [];
          // Deduplicate by id
          const seen = new Set();
          const unique = dbQuotes.filter(q => {
            if (seen.has(q.id)) return false;
            seen.add(q.id);
            return true;
          });
          setReceivedQuotes(unique);
        })
        .catch((err) => console.log("No received quotes:", err));
    }
  }, [user]);

  // Parse quotes from chat messages and add to received quotes
  useEffect(() => {
    if (messages.length > 0) {
      const messageQuotes = parseQuotesFromMessages(messages);
      if (messageQuotes.length > 0) {
        setReceivedQuotes(prev => {
          // Merge with existing quotes, avoiding duplicates
          const existingIds = new Set(prev.map(q => q.id));
          const existingMsgIds = new Set(prev.filter(q => q.from_message).map(q => q.message_id));
          const newQuotes = messageQuotes.filter(q => 
            !existingIds.has(q.id) && !existingMsgIds.has(q.message_id)
          );
          if (newQuotes.length > 0) {
            return [...prev, ...newQuotes];
          }
          return prev;
        });
      }
    }
  }, [messages]);

  // Load suppliers from backend
  useEffect(() => {
    getSuppliers()
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          const mapped = res.data.map(s => ({
            name: s.name,
            category: s.category || "Building Materials",
            badge: s.rating >= 4.5 ? "⭐ Top Rated" : "✅ Verified",
            location: s.address || "Phnom Penh"
          }));
          setSuppliersList(mapped);
        }
      })
      .catch((err) => console.log("Using static supplier list fallback:", err));
  }, []);

  // Load connections and check for pending invites
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const res = await listConnections();
        if (res?.data) {
          const received = (res.data.pending_invites || []).filter(i => i.direction === "received");
          setPendingInvites(received);
          if (received.length > 0) {
            setShowInviteBanner(true);
          }
        }
        
        // Also load the homeowner's share link
        const shareRes = await getMyShareLink();
        if (shareRes?.data?.share_link) {
          setMyShareLink(shareRes.data.share_link);
        }
      } catch (err) {
        console.error("Failed to load connections:", err);
      }
    };
    if (user?.id || user?.userId) {
      loadConnections();
    }
  }, [user?.id, user?.userId]);

  // Check if user arrived via invite link
  useEffect(() => {
    const checkInviteToken = async () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const token = params.get("connect");
      if (token) {
        setConnectionLoading(true);
        try {
          const res = await acceptInviteByToken(token);
          if (res?.success) {
            setConnectionMessage(res.message || "Connected successfully!");
            // Reload connections
            const updated = await listConnections();
            if (updated?.data) {
              const received = (updated.data.pending_invites || []).filter(i => i.direction === "received");
              setPendingInvites(received);
            }
          } else {
            setConnectionMessage(res?.message || "Failed to accept connection.");
          }
        } catch (err) {
          setConnectionMessage("Failed to accept connection.");
        } finally {
          setConnectionLoading(false);
          // Clean URL
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
    };
    checkInviteToken();
  }, []);

  const handleAcceptInvite = async (inviteId) => {
    setConnectionLoading(true);
    try {
      await acceptInvite(inviteId);
      const res = await listConnections();
      if (res?.data) {
        const received = (res.data.pending_invites || []).filter(i => i.direction === "received");
        setPendingInvites(received);
        setConnectionMessage("Invitation accepted!");
      }
    } catch (err) {
      setConnectionMessage("Failed to accept invitation.");
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleRejectInvite = async (inviteId) => {
    setConnectionLoading(true);
    try {
      await rejectInvite(inviteId);
      const res = await listConnections();
      if (res?.data) {
        const received = (res.data.pending_invites || []).filter(i => i.direction === "received");
        setPendingInvites(received);
      }
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    const link = myShareLink || `${window.location.origin}/connect?token=me`;
    navigator.clipboard.writeText(link);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2000);
  };

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
    
    // Call backend delete if it is a saved quote ID
    if (user && !id.toString().startsWith("audit_")) {
      deleteQuote(id)
        .catch((err) => console.error("Failed to delete quote from backend:", err));
    }

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
    
    // Fetch AI analysis results from backend if it is a saved quote from DB
    if (audit.id && !audit.id.toString().startsWith("audit_")) {
      getAnalysisResults(audit.id)
        .then((analysisRes) => {
          if (analysisRes && analysisRes.data) {
            setAiAnalysisResults(analysisRes.data);
          } else {
            setAiAnalysisResults([]);
          }
        })
        .catch((e) => {
          console.error("Failed to fetch analysis:", e);
          setAiAnalysisResults([]);
        });
    } else {
      setAiAnalysisResults([]);
    }
    
    const floorsInPreset = [...new Set(audit.rooms.map(r => r.floor))];
    if (floorsInPreset.length > 0) {
      setSelectedFloor(floorsInPreset[0]);
    }
    
    setShowResults(true);
    setIsAnalyzing(false);
    setSidebarTab("quotes");
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

  const loadChatContacts = async () => {
    const currentId = user?.userId || user?.id;
    if (!currentId) return;

    try {
      const response = await listContacts();
      const contactsPayload = Array.isArray(response)
        ? response
        : response?.data || response || [];
      const contacts = Array.isArray(contactsPayload) ? contactsPayload : [];
      setChatContacts(contacts
        .filter((contact) => String(contact.user_id || contact.id) !== String(currentId))
        .map((contact) => {
          const name = contact.user_name || contact.full_name || contact.name || contact.user_email || "Unknown user";
          return {
            id: contact.user_id || contact.id,
            name,
            role: contact.role || "",
            initials: name.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase(),
          };
        }));
    } catch (error) {
      console.error("Failed to load message contacts", error);
      showToast("Could not load message contacts.");
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      const notificationsData = Array.isArray(response) ? response : response?.data || [];
      // Deduplicate by id
      const seen = new Set();
      const unique = notificationsData.filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
      
      setNotifications(prevNotifications => {
        // Detect new unread notifications (e.g. connections or messages)
        if (prevNotifications && prevNotifications.length > 0) {
          const prevIds = new Set(prevNotifications.map(n => n.id));
          const newUnread = unique.filter(n => !n.read && !prevIds.has(n.id));
          
          if (newUnread.length > 0) {
            // Trigger toast notifications after current state update completes
            setTimeout(() => {
              newUnread.forEach(n => {
                showToast(n.message || n.title || "New notification");
              });
            }, 0);
          }
        }
        return unique;
      });
      
      setUnreadCount(unique.filter(n => !n.read).length);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const loadConversation = async (otherUserId) => {
    setIsChatLoading(true);
    const previousMessagesCount = messages.length;
    try {
      const response = await getConversation(otherUserId);
      const conversationPayload = Array.isArray(response)
        ? response
        : response?.data || response?.messages || [];
      const conversation = Array.isArray(conversationPayload)
        ? conversationPayload
        : conversationPayload?.messages || [];
      const currentId = user?.userId || user?.id;
      const newMessages = conversation.map((message) => ({
        id: message.id,
        sender: String(message.sender_id || message.sender?.id) === String(currentId) ? "me" : "other",
        text: message.content || message.text || "",
        time: message.created_at
          ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
      }));
      setMessages(newMessages);

      // Show notification for new incoming messages (not from polling after sending)
      if (newMessages.length > previousMessagesCount) {
        const newIncomingMessages = newMessages.slice(previousMessagesCount);
        const hasIncoming = newIncomingMessages.some(m => m.sender === "other");
        if (hasIncoming && selectedChatUserId !== otherUserId) {
          const contact = chatContacts.find(c => c.id === otherUserId);
          setCustomNotification({
            type: "info",
            message: `New message from ${contact?.name || "contact"}`
          });
        }
      }
    } catch (error) {
      console.error("Failed to load conversation", error);
      setMessages([]);
      showToast("Could not load this conversation.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSelectChatContact = (contactId) => {
    setSelectedChatUserId(contactId);
    loadConversation(contactId);
  };

  const handleChatSend = async (text) => {
    if (!selectedChatUserId || chatSending) return;

    setChatSending(true);
    setCustomNotification({ type: "info", message: "Sending..." });

    try {
      await sendMessage(selectedChatUserId, text);
      await loadConversation(selectedChatUserId);
      loadChatContacts();
      setCustomNotification({
        type: "success",
        message: "Message sent"
      });
    } catch (error) {
      console.error("Failed to send message", error);
      showToast(error.message || "Could not send message.");
    } finally {
      setChatSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages((previous) => previous.filter((msg) => msg.id !== messageId));
      showToast("Message deleted");
    } catch (error) {
      console.error("Failed to delete message", error);
      showToast("Could not delete message.");
    }
  };

  useEffect(() => {
    if (sidebarTab === "chat") loadChatContacts();
  }, [sidebarTab, user?.id, user?.userId]);

  useEffect(() => {
    if (selectedChatUserId && sidebarTab === "chat") {
      loadConversation(selectedChatUserId);
    }
  }, [selectedChatUserId, sidebarTab]);

  // Poll for new messages every 15 seconds when chat tab is active
  useEffect(() => {
    if (selectedChatUserId && sidebarTab === "chat") {
      const interval = setInterval(() => {
        loadConversation(selectedChatUserId);
        loadChatContacts();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [selectedChatUserId, sidebarTab]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(() => {
        loadNotifications();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id, user?.userId]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("quote-file-input");
    const file = fileInput?.files?.[0];
    if (!file) {
      startAnalysis("villa");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setShowResults(false);
    setSidebarTab("quotes");

    // Initialize temporary scan quote immediately
    const tempAuditId = `audit_${Date.now()}`;
    setSelectedSavedAuditId(tempAuditId);
    activeQuoteIdRef.current = tempAuditId;
    
    const tempAudit = {
      id: tempAuditId,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      projectName: file.name || "AI Quote Scanner",
      contractorName: "Analyzing...",
      quotedPrice: 0,
      qualityTier: "standard",
      rooms: []
    };

    if (user) {
      createQuote({
        contractorName: "Analyzing...",
        totalAmount: 1.0,
        projectName: file.name || "AI Quote Scanner",
        qualityTier: "standard",
        rooms: []
      })
        .then((res) => {
          if (res && res.data) {
            tempAudit.id = res.data.id;
            activeQuoteIdRef.current = res.data.id;
            setSelectedSavedAuditId(res.data.id);
            saveAuditToHistory(tempAudit);
          }
        })
        .catch((err) => {
          console.error("Failed to save temp start quote to database:", err);
          saveAuditToHistory(tempAudit);
        });
    } else {
      saveAuditToHistory(tempAudit);
    }
    
    try {
      showToast("Uploading PDF quote to AI parser...");
      const res = await uploadPdf(file);
      showToast("PDF parsed successfully by AI!");
      
      const pName = file.name.replace(".pdf", "");
      const cName = file.name.split(".")[0] || "Contractor";
      
      setProjectName(pName);
      setContractorName(cName);
      
      let mappedRooms = [];
      let totalSum = 0;
      if (res && res.line_items) {
        mappedRooms = res.line_items.map((item, index) => {
          const qty = parseFloat(item.quantity) || 0;
          const up = parseFloat(item.unit_price) || 0;
          const tp = parseFloat(item.total_price) || (qty * up) || 0;
          totalSum += tp;
          return {
            id: `item_${index}`,
            name: item.material_name || "Unknown Material",
            category: "utility",
            floor: "Ground Floor",
            width: 1,
            length: qty || 1,
            notes: `Benchmark Unit Price: $${up || 0}`,
            material_name: item.material_name,
            quantity: qty,
            unit: item.unit || "unit",
            unit_price: up,
            total_price: tp
          };
        });
      }
      
      if (mappedRooms.length === 0) {
        setIsAnalyzing(false);
        showToast("AI failed to extract details. Is this a scanned image PDF?");
        alert("AI Scan completed, but no line items could be extracted. Please make sure the PDF has selectable text (not a scanned photo/image) and try again, or enter details manually.");
        return;
      }
      
      const finalPrice = totalSum > 0 ? totalSum : 1.0;
      setQuotedPrice(finalPrice);
      setRooms(mappedRooms);
      setActivePreset(null);
      
      // Auto-save/update in database
      const quoteId = activeQuoteIdRef.current;
      const isExistingDbId = quoteId && !quoteId.toString().startsWith("audit_");
      
      const finalAudit = {
        id: quoteId,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        projectName: pName,
        contractorName: cName,
        quotedPrice: finalPrice,
        qualityTier: "premium",
        rooms: mappedRooms
      };

      if (user) {
        if (isExistingDbId) {
          updateQuote(quoteId, {
            contractorName: cName,
            totalAmount: finalPrice,
            projectName: pName,
            qualityTier: "premium",
            rooms: mappedRooms
          })
            .then(() => {
              saveAuditToHistory(finalAudit);
            })
            .catch((err) => {
              console.error("Failed to update scanned quote on database:", err);
              saveAuditToHistory(finalAudit);
            });
        } else {
          createQuote({
            contractorName: cName,
            totalAmount: finalPrice,
            projectName: pName,
            qualityTier: "premium",
            rooms: mappedRooms
          })
            .then((apiRes) => {
              if (apiRes && apiRes.data) {
                finalAudit.id = apiRes.data.id;
                activeQuoteIdRef.current = apiRes.data.id;
                setSelectedSavedAuditId(apiRes.data.id);
                saveAuditToHistory(finalAudit);
                // Fetch AI analysis results after backend finishes Groq analysis
                setTimeout(() => {
                  getAnalysisResults(apiRes.data.id)
                    .then((analysisRes) => {
                      if (analysisRes && analysisRes.data) {
                        setAiAnalysisResults(analysisRes.data);
                      }
                    })
                    .catch((e) => console.error("Failed to fetch analysis:", e));
                }, 4000);
              }
            })
            .catch((err) => {
              console.error("Failed to save final quote to database:", err);
              saveAuditToHistory(finalAudit);
            });
        }
      } else {
        saveAuditToHistory(finalAudit);
      }
      
      setIsAnalyzing(false);
      setShowResults(true);
      setActiveTab("spreadsheet");
      
    } catch (err) {
      console.log("PDF parser failed or Groq key missing. Falling back to local simulated scanner:", err);
      showToast("Using offline recognition fallback...");
      
      // Clean up the temporary "Analyzing..." quote from the database
      const tempId = activeQuoteIdRef.current;
      if (tempId && !tempId.toString().startsWith("audit_")) {
        deleteQuote(tempId).catch((e) => console.error("Failed to delete temp quote:", e));
      }
      
      startAnalysis("villa");
    }
  };

  const startAnalysis = (presetKey) => {
    setActivePreset(presetKey);
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setShowResults(false);
    setSidebarTab("quotes");

    // Immediately save to database
    const data = PRESETS[presetKey];
    const auditId = `audit_${Date.now()}`;
    setSelectedSavedAuditId(auditId);
    activeQuoteIdRef.current = auditId;
    
    const newAudit = {
      id: auditId,
      date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      projectName: data.projectName,
      contractorName: data.contractorName,
      quotedPrice: data.quotedPrice,
      qualityTier: data.qualityTier,
      rooms: JSON.parse(JSON.stringify(data.rooms))
    };

    if (user) {
      createQuote({
        contractorName: data.contractorName,
        totalAmount: data.quotedPrice,
        projectName: data.projectName,
        qualityTier: data.qualityTier,
        rooms: data.rooms
      })
        .then((res) => {
          if (res && res.data) {
            newAudit.id = res.data.id;
            activeQuoteIdRef.current = res.data.id;
            setSelectedSavedAuditId(res.data.id);
            saveAuditToHistory(newAudit);
          }
        })
        .catch((err) => {
          console.error("Failed to save start simulated quote to backend:", err);
          saveAuditToHistory(newAudit);
        });
    } else {
      saveAuditToHistory(newAudit);
    }
  };

  const handleCreateManualQuote = (payload) => {
    // Initialize layout states
    setProjectName(payload.projectName);
    setContractorName(payload.contractorName);
    setQuotedPrice(payload.quotedPrice);
    setQualityTier(payload.qualityTier);
    setRooms(payload.rooms);
    setActivePreset(null);

    // Set active floor based on available floor
    const floorsInPreset = [...new Set(payload.rooms.map(r => r.floor))];
    if (floorsInPreset.length > 0) {
      setSelectedFloor(floorsInPreset[0]);
    }

    setIsAnalyzing(false);
    setShowResults(true);
    setActiveTab("spreadsheet");
    showToast("Manual Quote Created!");

    // Save locally
    const auditId = `audit_${Date.now()}`;
    setSelectedSavedAuditId(auditId);
    const newAudit = {
      id: auditId,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      projectName: payload.projectName,
      contractorName: payload.contractorName,
      quotedPrice: payload.quotedPrice,
      qualityTier: payload.qualityTier,
      rooms: payload.rooms,
      projectDetails: payload.projectDetails
    };

    // Auto-save to backend if logged in
    if (user) {
      createQuote({ 
        contractorName: payload.contractorName, 
        totalAmount: payload.quotedPrice,
        projectName: payload.projectName,
        qualityTier: payload.qualityTier,
        projectDetails: payload.projectDetails,
        rooms: payload.rooms
      })
        .then((res) => {
          if (res && res.data) {
            newAudit.id = res.data.id;
            setSelectedSavedAuditId(res.data.id);
            setAuditHistory(prev => [newAudit, ...prev.filter(item => item.id !== auditId)]);
          }
        })
        .catch((err) => console.error("Failed to save manual quote to backend:", err));
    }

    const updatedHistory = [newAudit, ...auditHistory];
    setAuditHistory(updatedHistory);
    localStorage.setItem("domnak_audit_history", JSON.stringify(updatedHistory));
    // Clear form inputs
    setManualProjectName("");
    setManualContractorName("");
    setManualQuotedPrice("");
    setManualQualityTier("premium");
  };

  const handleSaveCurrentAudit = () => {
    if (isSaving) return;
    setIsSaving(true);

    const isExisting = selectedSavedAuditId && !selectedSavedAuditId.toString().startsWith("audit_");
    const auditId = selectedSavedAuditId || `audit_${Date.now()}`;
    const auditToSave = {
      id: auditId,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      projectName,
      contractorName,
      quotedPrice,
      qualityTier,
      rooms: JSON.parse(JSON.stringify(rooms))
    };

    if (user) {
      if (isExisting) {
        updateQuote(selectedSavedAuditId, {
          contractorName,
          totalAmount: quotedPrice,
          projectName,
          qualityTier,
          rooms
        })
          .then((res) => {
            saveAuditToHistory(auditToSave);
            showToast("Audit updated in database!");
            setIsSaving(false);
          })
          .catch((err) => {
            console.error("Failed to update quote on backend:", err);
            saveAuditToHistory(auditToSave);
            showToast("Audit saved (local fallback).");
            setIsSaving(false);
          });
      } else {
        createQuote({
          contractorName,
          totalAmount: quotedPrice,
          projectName,
          qualityTier,
          rooms
        })
          .then((res) => {
            if (res && res.data) {
              auditToSave.id = res.data.id;
              setSelectedSavedAuditId(res.data.id);
              saveAuditToHistory(auditToSave);
              showToast("Audit saved to database!");
            }
            setIsSaving(false);
          })
          .catch((err) => {
            console.error("Failed to create quote on backend:", err);
            saveAuditToHistory(auditToSave);
            showToast("Audit saved (local fallback).");
            setIsSaving(false);
          });
      }
    } else {
      saveAuditToHistory(auditToSave);
      showToast("Audit saved locally!");
      setIsSaving(false);
    }
  };

  
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
          // Load preset data if applicable
          let finalContractorName = contractorName;
          let finalProjectName = projectName;
          let finalQuotedPrice = quotedPrice;

          if (activePreset) {
            const data = PRESETS[activePreset];
            if (data) {
              setProjectName(data.projectName);
              setContractorName(data.contractorName);
              setQuotedPrice(data.quotedPrice);
              setQualityTier(data.qualityTier);
              setRooms(JSON.parse(JSON.stringify(data.rooms))); // deep copy
              
              const floorsInPreset = [...new Set(data.rooms.map(r => r.floor))];
              if (floorsInPreset.length > 0) {
                setSelectedFloor(floorsInPreset[0]);
              }
              finalContractorName = data.contractorName;
              finalProjectName = data.projectName;
              finalQuotedPrice = data.quotedPrice;
            }
          } else {
            const floorsInParsed = [...new Set(rooms.map(r => r.floor))];
            if (floorsInParsed.length > 0) {
              setSelectedFloor(floorsInParsed[0]);
            }
          }

          setIsAnalyzing(false);
          setShowResults(true);
          setActiveTab("spreadsheet");
          showToast("AI Quote Analysis Complete!");
          
          setChatMessages([
            {
              sender: "ai",
              text: `Hello! I am your DomNak AI Project Consultant. I have audited the proposal from **${finalContractorName || "the contractor"}** for the **${finalProjectName || "your project"}**. The quoted total is **$${(finalQuotedPrice || 0).toLocaleString()}**.\n\nI can help identify red flags, cross-reference regional averages, or outline cost-saving items. What would you like to explore?`
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
          if (field === "width" || field === "length" || field === "quantity" || field === "unit_price" || field === "total_price") {
            parsedValue = parseFloat(value) || 0;
          }
          const updated = { ...room, [field]: parsedValue };
          
          if (field === "quantity" || field === "unit_price") {
            const qty = field === "quantity" ? parsedValue : (updated.quantity ?? updated.length ?? 0);
            const up = field === "unit_price" ? parsedValue : (updated.unit_price || 0);
            updated.total_price = qty * up;
            updated.length = qty; // sync length for area-based floor logic
          }
          return updated;
        }
        return room;
      })
    );
  };

  const deleteRoom = (roomId) => {
    setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
    showToast("Item removed from estimate");
  };

  const addRoom = () => {
    const isAi = rooms.some(r => r.unit_price !== undefined || r.unit !== undefined);
    const newRoomId = `custom_${Date.now()}`;
    const newRoom = isAi ? {
      id: newRoomId,
      name: "New Line Item",
      quantity: 1,
      unit: "pcs",
      unit_price: 10.0,
      total_price: 10.0,
      notes: "Custom specification details",
      floor: "Ground Floor",
      width: 1,
      length: 1
    } : {
      id: newRoomId,
      name: "New Room Space",
      category: "bedroom",
      floor: selectedFloor,
      width: 4.0,
      length: 4.0,
      notes: "Standard specification"
    };
    setRooms(prevRooms => [...prevRooms, newRoom]);
    showToast(isAi ? "Added new line item slot" : "Added new room slot to " + selectedFloor);
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
  const handleChatSubmit = async (userQuery) => {
    if (!userQuery.trim()) return;

    // Append user message
    const newMessages = [...chatMessages, { sender: "user", text: userQuery }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatTyping(true);

    try {
      // Connect to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1chat/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getToken() && { Authorization: `Bearer ${getToken()}` })
        },
        body: JSON.stringify({
          message: userQuery,
          user_id: user?.id || "anonymous"
        })
      });

      if (!response.ok) throw new Error("Chat request failed");

      const resData = await response.json();
      const aiReply = resData?.data?.response || resData?.message || "Success";

      setChatMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
      setIsChatTyping(false);

    } catch (err) {
      console.log("Chat API failed or Groq key missing. Falling back to local assistant:", err);
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
    }
  };

  return (
    <>
      <Head>
        <title>Homeowner Hub | DomNak - Quote Pricing Audit &amp; Floor Plan Scanner</title>
        <meta name="description" content="Upload and audit contractor invoices. Edit room structures and visualize the 2D layout in real-time with DomNak's proprietary AI analyzer." />
      </Head>

      {/* ── Connection Banner (pending invites) ──────────────────── */}
      {showInviteBanner && pendingInvites.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-brand-gold/95 backdrop-blur text-white px-4 py-3 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <MailIcon className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">
                You have {pendingInvites.length} architect {pendingInvites.length === 1 ? "request" : "requests"} waiting.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5">
                  <span className="text-[10px] font-black">{inv.inviter_name || inv.inviter_email}</span>
                  <button
                    onClick={() => handleAcceptInvite(inv.id)}
                    disabled={connectionLoading}
                    className="text-[10px] font-black bg-white text-brand-gold px-2 py-1 rounded-lg hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectInvite(inv.id)}
                    disabled={connectionLoading}
                    className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowInviteBanner(false)}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Connection success message ───────────────────────────── */}
      {connectionMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
          {connectionMessage}
        </div>
      )}

      {/* ── Full-viewport sidebar layout ─────────────────────────────── */}
      <div className={styles.pageLayoutContainer}>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className={`${styles.sidebar} ${dashboardSidebarOpen ? styles.sidebarOpen : ""}`}>
          
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between px-6 pt-6">
            <span className="text-white font-black text-lg tracking-tight">DomNak</span>
            <button
              onClick={() => setDashboardSidebarOpen(false)}
              className="p-1.5 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Subtle top decoration */}
          <div className={styles.topDecoration} />

          {/* Navigation */}
          <nav className={styles.navContainer} style={{ marginTop: "2rem" }}>
            <Link 
              href="/" 
              className={`${styles.navButton} group mb-2`}
            >
              <div className="h-5 w-5 rounded-full border border-white/50 flex items-center justify-center group-hover:border-white transition-colors duration-200">
                <ArrowLeft className="h-3 w-3 text-white/80 group-hover:text-white" />
              </div>
              <span>Home</span>
            </Link>
            {[
                { id: "home",      label: "Dashboard",      icon: LayoutDashboard },
                { id: "quotes",    label: "Cost Estimator", icon: Calculator },
                { id: "history",   label: "History",        icon: History },
                { id: "received",  label: "Received",       icon: Inbox },
                { id: "chatbot",   label: "Chatbot",        icon: Bot },
                { id: "chat",      label: "Messages",       icon: MailIcon },
                { id: "suppliers", label: "Supplier",       icon: Store }
              ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setSidebarTab(id);
                  setDashboardSidebarOpen(false);
                }}
                className={`${sidebarTab === id ? styles.navButtonActive : styles.navButton} group`}
              >
                {id === "chat" ? (
                  <div className="relative">
                    <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                      sidebarTab === id ? "text-[#806626]" : "text-white/80 group-hover:text-white"
                    }`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                    sidebarTab === id ? "text-[#806626]" : "text-white/80 group-hover:text-white"
                  }`} />
                )}
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* User chip at bottom */}
          <div className={styles.userChipWrapper}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={styles.avatar}>
                {(user?.full_name || "H").charAt(0).toUpperCase()}
              </div>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user?.full_name || "Homeowner"}</p>
                <p className={styles.userRole}>Homeowner</p>
              </div>
            </div>

            {user ? (
              <button
                onClick={logout}
                className={styles.logoutBtn}
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            ) : (
              <Link
                href="/login"
                className={styles.loginLink}
              >
                Log In
              </Link>
            )}
          </div>
        </aside>

        {/* Backdrop overlay for sidebar */}
        {dashboardSidebarOpen && (
          <div 
            className={styles.backdrop}
            onClick={() => setDashboardSidebarOpen(false)}
          />
        )}

        {/* ── Scrollable content area ───────────────────────────────── */}
        <div className={styles.scrollableContent}>

          {/* Global Toast */}
          {customNotification && (
            <div className={styles.globalToast}>
              <Sparkles className="h-4.5 w-4.5 text-brand-gold animate-pulse" />
              <span>{customNotification.message}</span>
            </div>
          )}

          {/* Page header bar */}
          {sidebarTab !== "chatbot" && (
            <div className={styles.headerBar}>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  className="p-2 -ml-2 text-[#1E1C18]/60 hover:text-brand-gold rounded-xl transition-colors duration-200 cursor-pointer"
                  onClick={() => setDashboardSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                {sidebarTab === "home" && auditHistory.length === 0 ? (
                  <div className="flex items-center h-16">
                    <img 
                      src="/assets/domnak-logo-with-kh-cropped.png" 
                      alt="DomNak Logo" 
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <h1 className={styles.headerTitleGold}>
                    {sidebarTab === "home"
                      ? "Dashboard"
                      : sidebarTab === "quotes"
                      ? "Cost Estimator"
                      : sidebarTab === "history"
                      ? "History"
                      : sidebarTab === "chatbot"
                      ? "Chatbot"
                      : sidebarTab === "chat"
                      ? "Messages"
                      : sidebarTab === "suppliers"
                      ? "Supplier Hub"
                      : "Homeowner Hub"}
                  </h1>
                )}
              </div>
              <div className={styles.headerIconContainer} style={{ position: "relative" }}>
                <div className={styles.iconWrapper} onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className={styles.headerIcon} />
                  {unreadCount > 0 && (
                    <span className={styles.redBadge}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-14 w-80 bg-white border border-[#1E1C18]/10 rounded-3xl shadow-xl p-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="flex items-center justify-between border-b border-[#1E1C18]/5 pb-3 mb-3">
                        <span className="text-xs font-black text-[#1E1C18]">Notifications</span>
                        <button 
                          onClick={() => {
                            notifications.forEach(n => {
                              if (!n.read) handleMarkNotificationRead(n.id);
                            });
                          }}
                          className="text-[9px] font-black text-brand-gold hover:underline uppercase tracking-wider bg-transparent border-none cursor-pointer"
                        >
                          Mark all read
                        </button>
                      </div>
                      
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-[10px] text-[#1E1C18]/40 font-bold">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => {
                                if (!notif.read) {
                                  handleMarkNotificationRead(notif.id);
                                }
                                if (notif.type === "connection_request" || notif.type === "message") {
                                  setSidebarTab("chat");
                                }
                                setShowNotifications(false);
                              }}
                              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex gap-2.5 ${!notif.read ? "bg-brand-gold/5 border-brand-gold/15" : "bg-[#FAF7F0]/25 hover:bg-[#FAF7F0]/60 border-[#1E1C18]/5"}`}
                            >
                              <div className="h-8 w-8 rounded-xl bg-brand-gold/10 border border-brand-gold/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                                {notif.type === "connection_request" ? (
                                  <UserCheck className="h-4 w-4 text-brand-gold" />
                                ) : notif.type === "message" ? (
                                  <MessageSquare className="h-4 w-4 text-brand-gold" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-brand-gold" />
                                )}
                              </div>
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-black text-[#1E1C18] block truncate">{notif.title || "New Notification"}</span>
                                  {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-gold flex-shrink-0" />}
                                </div>
                                <p className="text-[10px] text-[#1E1C18]/65 font-medium leading-relaxed break-words">{notif.message || "You have a new notification"}</p>
                                <span className="text-[8px] text-[#1E1C18]/40 font-mono block mt-1">
                                  {notif.created_at ? new Date(notif.created_at).toLocaleString() : "Just now"}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
                
                <div className={styles.iconWrapper} onClick={() => setSidebarTab("chatbot")}>
                  <User className={styles.headerIcon} />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB CONTENT ────────────────────────────────────────────── */}
          {sidebarTab === "chatbot" ? (
            <div className="flex-grow flex flex-col overflow-hidden p-4 md:p-6 bg-[#FAF7F0]/40">
              <CostHelperChatbot 
                layoutMode="embedded" 
                onBack={() => setSidebarTab("home")} 
                userOverride={user} 
                logoutOverride={logout} 
                dashboardSidebarOpen={dashboardSidebarOpen}
                setDashboardSidebarOpen={setDashboardSidebarOpen}
              />
            </div>
          ) : (
            <div className={styles.tabContentWrapper}>

            {/* ── HOME TAB ──────────────────────────────────────────── */}
            {sidebarTab === "home" && (
              <div className="animate-in fade-in duration-300 flex-1 flex flex-col">
                {auditHistory.length === 0 ? (
                  /* State A: New Signup (No uploads yet) */
                  <div 
                    className={styles.angkorBanner}
                    style={{ backgroundImage: "url('/assets/domnak-landing.png')" }}
                  >
                    {/* Overlays to match home page hero */}
                    <div className={styles.bannerOverlay1} />
                    <div className={styles.bannerOverlay2} />
                    
                    <div className={styles.angkorBannerContent}>
                      <h2 className={styles.welcomeText}>
                        Welcome to Homeowner Hub
                        <br />
                        <span className={styles.welcomeName}>{capitalizeName(user?.full_name || "Jonh Doe")}</span>
                      </h2>
                      <div className={styles.welcomeActions}>
                        <button 
                          onClick={() => setSidebarTab("quotes")}
                          className={styles.uploadQuoteBtn}
                        >
                          Upload Qoute
                        </button>
                        <span 
                          onClick={() => setSidebarTab("suppliers")}
                          className={`${styles.exploreLink} group`}
                        >
                          Explore Supplier
                          <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* State B: Active User (Has did some projects) */
                  <div className="space-y-6">
                    <div className={styles.dashboardGreetingSection}>
                      <span className={styles.welcomeBackText}>Welcome back</span>
                      <h2 className={styles.goodMorningTitle}>Good Morning, {user?.full_name || "Jonh Doe"}</h2>
                    </div>

                    {/* Summary Analytics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Card 1: Total Audited Value */}
                      <div className="bg-white border border-[#1E1C18]/5 rounded-3xl p-6 shadow-sm flex items-center gap-4.5 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 rounded-bl-full pointer-events-none" />
                        <div className="h-12 w-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold shadow-inner group-hover:scale-105 transition-all">
                          <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-[#1E1C18]/45 uppercase tracking-wider block">Total Audited Value</span>
                          <span className="text-xl font-black text-[#1E1C18] mt-0.5 block">${totalAuditedVal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Card 2: Audits Run */}
                      <div className="bg-white border border-[#1E1C18]/5 rounded-3xl p-6 shadow-sm flex items-center gap-4.5 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-105 transition-all">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-[#1E1C18]/45 uppercase tracking-wider block">Audits Executed</span>
                          <span className="text-xl font-black text-[#1E1C18] mt-0.5 block">{totalAuditsRun} Saved {totalAuditsRun === 1 ? "Quote" : "Quotes"}</span>
                        </div>
                      </div>

                      {/* Card 3: Avg Quote Cost */}
                      <div className="bg-white border border-[#1E1C18]/5 rounded-3xl p-6 shadow-sm flex items-center gap-4.5 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-105 transition-all">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-[#1E1C18]/45 uppercase tracking-wider block">Avg Proposal Price</span>
                          <span className="text-xl font-black text-[#1E1C18] mt-0.5 block">${averageQuotePrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Connect with Architect Section */}
                    <div className="bg-gradient-to-br from-[#FAF7F0] to-white border border-brand-gold/20 rounded-3xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                          <Share2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-black text-[#1E1C18]">Share Your Profile Link</h3>
                          <p className="text-xs text-[#1E1C18]/50 mt-0.5">Send this link to an architect to connect and collaborate on your project.</p>
                          <div className="flex items-center gap-2 mt-3">
                            <input
                              type="text"
                              readOnly
                              value={myShareLink || `${typeof window !== "undefined" ? window.location.origin : ""}/connect?token=me`}
                              className="flex-1 text-xs font-mono bg-white border border-[#1E1C18]/10 rounded-xl px-4 py-2.5 text-[#1E1C18]/70 truncate"
                              placeholder="Generate your share link..."
                            />
                            <button
                              onClick={handleCopyShareLink}
                              className="bg-brand-gold hover:bg-brand-gold-dark text-white text-[11px] font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                            >
                              {inviteLinkCopied ? "Copied!" : "Copy Link"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Split Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Projects Redesigned List */}
                      <div className="bg-white border border-[#1E1C18]/5 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="border-b border-[#1E1C18]/5 pb-4 mb-4">
                            <h3 className="text-base font-black text-[#1E1C18] flex items-center gap-2">
                              <Building className="h-5 w-5 text-brand-gold" />
                              Projects &amp; Proposal Audits
                            </h3>
                            <p className="text-xs text-[#1E1C18]/50 mt-0.5">List of saved audits with relative price scaling.</p>
                          </div>
                          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                            {auditHistory.map((audit) => {
                              const tierThemes = {
                                luxury: "border-l-4 border-brand-gold shadow-sm",
                                premium: "border-l-4 border-[#806626] shadow-sm",
                                standard: "border-l-4 border-slate-300 shadow-sm"
                              };
                              const theme = tierThemes[audit.qualityTier] || tierThemes.premium;
                              const percentage = Math.round((audit.quotedPrice / maxQuoteVal) * 100);
                              
                              return (
                                <div 
                                  key={audit.id} 
                                  onClick={() => loadSavedAudit(audit)}
                                  className={`bg-[#FAF7F0]/40 hover:bg-[#FAF7F0] border border-[#1E1C18]/5 rounded-2xl p-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col gap-3 ${theme}`}
                                >
                                  <div className="flex justify-between items-start w-full">
                                    <div className="space-y-1">
                                      <h4 className="text-sm font-black text-[#1E1C18] tracking-tight">{audit.projectName}</h4>
                                      <p className="text-[11px] text-[#1E1C18]/50 font-bold">
                                        Contractor: <span className="text-[#1E1C18] font-extrabold">{audit.contractorName}</span>
                                      </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                                      <span className="text-xs font-black text-brand-gold">${audit.quotedPrice.toLocaleString()}</span>
                                      <span className="text-[9px] font-black uppercase tracking-wider text-[#806626] bg-[#806626]/10 px-2 py-0.5 rounded border border-[#806626]/20">
                                        {audit.qualityTier}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Micro Comparative Bar */}
                                  <div className="w-full">
                                    <div className="flex justify-between items-center text-[9px] text-[#1E1C18]/45 font-extrabold uppercase tracking-wider mb-1">
                                      <span>Comparative Scale</span>
                                      <span>{percentage}% of Max Bid</span>
                                    </div>
                                    <div className="w-full bg-[#FAF7F0] border border-[#1E1C18]/10 h-2 rounded-full overflow-hidden p-[1px]">
                                      <div 
                                        className="h-full bg-gradient-to-r from-brand-gold/60 to-brand-gold rounded-full transition-all duration-500" 
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Khmer Price Index Board */}
                      <div className="bg-white border border-[#1E1C18]/5 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="border-b border-[#1E1C18]/5 pb-4 mb-4">
                            <h3 className="text-base font-black text-[#1E1C18] flex items-center gap-2">
                              <FileSpreadsheet className="h-5 w-5 text-brand-gold" />
                              Khmer Price Index Board
                            </h3>
                            <p className="text-xs text-[#1E1C18]/50 mt-0.5">Wholesale material reference tracking Phnom Penh indices.</p>
                          </div>
                          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                            {[
                              { name: "Premium Cement", source: "SCG / Chip Mong (Phnom Penh)", price: "$85 - $95 / ton", category: "Structure", trend: "+0.2%", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                              { name: "Deformed Steel Rebars", source: "Heng Hardware (Toul Kork)", price: "$680 - $720 / ton", category: "Structure", trend: "-1.5%", color: "bg-rose-50 text-rose-700 border-rose-100" },
                              { name: "Red Clay Bricks (8x15x25)", source: "Local Kiln (Kandal)", price: "$0.05 - $0.07 / pc", category: "Masonry", trend: "0.0%", color: "bg-slate-50 text-slate-700 border-slate-100" },
                              { name: "Concrete Mix (C25/30)", source: "Camel Cement (Sen Sok)", price: "$65 - $72 / m³", category: "Structure", trend: "+0.8%", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                              { name: "Teak Wood Parquet Flooring", source: "Angkor Ceramics (Chamkar Mon)", price: "$35 - $45 / m²", category: "Finishes", trend: "0.0%", color: "bg-slate-50 text-slate-700 border-slate-100" },
                              { name: "Masonry Hollow Bricks", source: "ISI Steel (Phnom Penh)", price: "$0.12 - $0.15 / pc", category: "Masonry", trend: "+1.2%", color: "bg-emerald-50 text-emerald-700 border-emerald-100" }
                            ].map((material, idx) => (
                              <div key={idx} className="bg-[#FAF7F0]/40 hover:bg-[#FAF7F0] border border-[#1E1C18]/5 rounded-2xl p-4.5 flex justify-between items-center transition-all duration-200 hover:-translate-y-0.5">
                                <div className="space-y-0.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-black text-[#1E1C18]">{material.name}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md ${material.color}`}>
                                      {material.category}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#1E1C18]/50 block font-semibold">{material.source}</span>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                                  <span className="text-xs font-black text-brand-gold">{material.price}</span>
                                  <span className={`text-[9px] font-black ${material.trend.startsWith("-") ? "text-rose-600" : material.trend.startsWith("0") ? "text-[#1E1C18]/45" : "text-emerald-600"}`}>
                                    {material.trend.startsWith("-") ? "▼" : material.trend.startsWith("0") ? "—" : "▲"} {material.trend}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ──── QUOTES TAB ────────────────────────────────────────── */}
            {sidebarTab === "quotes" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Stepper */}
                <div className={styles.stepperWrapper}>
                  <div className={styles.stepperContainer}>
                    <div className={styles.stepperTrack} />
                    <div className={styles.stepperProgressTrack} style={{ width: isAnalyzing ? "50%" : showResults ? "100%" : "0%" }} />
                    {[{ n:1, label:"Upload Quote" },{ n:2, label:"AI Scanning" },{ n:3, label:"Review & Edit" }].map(({ n, label }) => {
                      const isActive = (n===1 && !isAnalyzing && !showResults)||(n===2 && isAnalyzing)||(n===3 && showResults);
                      const isDone = (n===1 && (isAnalyzing||showResults))||(n===2 && showResults);
                      return (
                        <div key={n} className={styles.stepperNodeWrapper}>
                          <div className={isActive ? styles.stepperNodeActive : isDone ? styles.stepperNodeDone : styles.stepperNodeInactive}>{n}</div>
                          <span className={isActive ? styles.stepperLabelActive : styles.stepperLabelInactive}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!showResults && !isAnalyzing ? (
                  /* PHASE 1: Choice or Upload/Manual */
                  <div className={styles.quotesWrapper}>
                    {uploadMethod === null ? (
                      /* Method Selection Screen */
                      <div className={styles.setupCard}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full -z-10" />
                        <div className={styles.setupHeader}>
                          <h2 className={styles.setupTitle}>Quote Auditing Setup</h2>
                          <p className={styles.setupDescription}>
                            Choose how you would like to input your contractor's quote. We will run comparison metrics against regional Cambodian indexes.
                          </p>
                        </div>

                        <div className={styles.optionsGrid}>
                          {/* Option 1: PDF Upload */}
                          <button
                            onClick={() => setUploadMethod("pdf")}
                            className={`${styles.optionButton} group`}
                          >
                            <div className={styles.optionIcon}>
                              <UploadCloud className="h-6 w-6" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <span className={styles.optionTitle}>Upload PDF Quote</span>
                              <span className={styles.optionDesc}>
                                Upload your constructor quote PDF to let our AI scan and analyze rates automatically.
                              </span>
                            </div>
                            <span className={styles.optionBadge}>
                              AI Auto Scan
                            </span>
                          </button>

                          {/* Option 2: Manual Input */}
                          <button
                            onClick={() => setUploadMethod("manual")}
                            className={`${styles.optionButton} group`}
                          >
                            <div className={styles.optionIcon}>
                              <FileText className="h-6 w-6" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <span className={styles.optionTitle}>Manually Input Quote</span>
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
                      <div className={styles.pdfZoneCard}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full -z-10" />
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setUploadMethod(null)}
                            className={styles.backToOptions}
                          >
                            ← Back to options
                          </button>
                          <span className={styles.pdfLabel}>
                            PDF Quote Upload
                          </span>
                        </div>
                        <div>
                          <h2 className={styles.pdfTitle}>Upload Contractor PDF</h2>
                          <p className={styles.pdfDesc}>
                            Select your contractor's quote document or BoQ statement (up to 15MB).
                          </p>
                        </div>
                        <form onSubmit={handleFileUpload} className="space-y-6">
                          <label id="dropzone-label" className={`${styles.dropzoneLabel} group`}>
                            <div className={styles.dropzoneIcon}>
                              <UploadCloud className="h-8 w-8" />
                            </div>
                            <span className={styles.dropzoneTitle}>
                              Drag &amp; drop your quote PDF here
                            </span>
                            <span className={styles.dropzoneSubtext}>or click to browse local files</span>
                            <div className="flex gap-2 mt-4">
                              <span className={styles.pdfBadgeOnly}>
                                Max 15MB
                              </span>
                            </div>
                            <input
                              id="quote-file-input"
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e)}
                            />
                          </label>
                          <div className={styles.securityLog}>
                            <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-brand-gold" /> SSL SECURE ENCRYPTION</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1E1C18]/20" />
                            <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-brand-gold" /> 100% PRIVATE DATA</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1E1C18]/20" />
                            <span>MAX 15 MB LIMIT</span>
                          </div>
                        </form>
                        <div>
                          <h4 className={styles.focusInstructionsHeader}>
                            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />Focus Instructions for AI (Optional)
                          </h4>
                          <textarea
                            placeholder="e.g. 'Flag items above Phnom Penh 2025 index' or 'Separate balcony from bedroom costs'..."
                            rows={2}
                            className={styles.focusInstructionsTextarea}
                          />
                        </div>
                        <button
                          onClick={(e) => handleFileUpload(e)}
                          className={`${styles.scanButton} group`}
                        >
                          <span>Scan &amp; audit quote</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    ) : (
                      /* PHASE 1: Manual Input Form */
                      <ManualQuoteForm 
                        onSubmit={handleCreateManualQuote} 
                        onBack={() => setUploadMethod(null)} 
                      />
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
                  <div className={styles.editorContainer}>
                    <div className={styles.editorHeader}>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-gold rounded-l-3xl" />
                      <div className="flex items-center gap-3.5 pl-2">
                        <div className="h-11 w-11 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold shadow-inner"><FileText className="h-5 w-5" /></div>
                        <div><h3 className={styles.editorTitle}>{projectName}</h3><p className="text-xs text-[#1E1C18]/50 font-semibold mt-0.5">Contractor: <strong className="text-[#1E1C18] font-extrabold">{contractorName}</strong></p></div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button 
                          onClick={handleSaveCurrentAudit} 
                          disabled={isSaving}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-xs font-extrabold text-white transition-all cursor-pointer shadow-md"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {isSaving ? "Saving..." : "Save Audit"}
                        </button>
                        <button onClick={resetToPresetDefaults} className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E1C18]/5 hover:bg-[#1E1C18]/10 px-4 py-2.5 text-xs font-extrabold text-[#1E1C18] transition-all cursor-pointer border border-[#1E1C18]/5 shadow-sm"><RotateCcw className="h-3.5 w-3.5" />Reset</button>
                        <button onClick={() => { setShowResults(false); setActivePreset(null); setSelectedSavedAuditId(null); setUploadMethod(null); }} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark px-4 py-2.5 text-xs font-extrabold text-white transition-all cursor-pointer shadow-md">New Audit</button>
                      </div>
                    </div>

                    <div className={styles.editorGrid}>
                      <div className={styles.editorLeftPane}>
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
                                <div>
                                  <h3 className="text-base font-black text-[#1E1C18] flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-brand-gold" />
                                    {isAiParsed ? "Quote Line Items Editor" : "Room Dimension Grid"}
                                  </h3>
                                  <p className="text-xs text-[#1E1C18]/50">
                                    {isAiParsed ? "Review and edit the parsed contractor quantities and rates below." : "Adjust room sizes to compute structural cost estimates in real-time."}
                                  </p>
                                </div>
                                {!isAiParsed && (
                                  <div className="flex bg-[#FAF7F0] border border-[#1E1C18]/5 p-1 rounded-xl shadow-inner">
                                    {Array.from(new Set(rooms.map(r => r.floor))).sort().map(floor => (
                                      <button key={floor} onClick={() => setSelectedFloor(floor)} className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${selectedFloor===floor?"bg-brand-gold text-white shadow-sm":"text-[#1E1C18]/65 hover:bg-[#1E1C18]/5"}`}>
                                        {floor}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className={styles.spreadsheetTableFrame}>
                                <table className={styles.table}>
                                  <thead className={styles.thead}>
                                    <tr className={styles.tr}>
                                      {isAiParsed ? (
                                        <>
                                          <th className={styles.th}>Item Description / Specification</th>
                                          <th className={styles.th} style={{ textAlign: "center" }}>Quantity</th>
                                          <th className={styles.th} style={{ textAlign: "center" }}>Unit</th>
                                          <th className={styles.th} style={{ textAlign: "right" }}>Quoted Rate ($)</th>
                                          <th className={styles.th} style={{ textAlign: "right" }}>Total Cost ($)</th>
                                        </>
                                      ) : (
                                        <>
                                          <th className={styles.th}>Room Name / Specifications</th>
                                          <th className={styles.th}>Category</th>
                                          <th className={styles.th}>Floor</th>
                                          <th className={styles.th} style={{ textAlign: "center" }}>Width (m)</th>
                                          <th className={styles.th} style={{ textAlign: "center" }}>Length (m)</th>
                                          <th className={styles.th} style={{ textAlign: "center" }}>Area</th>
                                        </>
                                      )}
                                      <th className={styles.th} style={{ textAlign: "right" }}>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className={styles.tbody}>
                                    {rooms.filter(r => isAiParsed || r.floor===selectedFloor).map((room) => {
                                      const catStyle = getCategoryTheme(room.category);
                                      return (
                                        <tr key={room.id} className={styles.tr}>
                                          {isAiParsed ? (
                                            <>
                                              {/* Item Description */}
                                              <td className={styles.td}>
                                                <div className="space-y-1">
                                                  <input 
                                                    type="text" 
                                                    value={room.name} 
                                                    onChange={(e) => updateRoomField(room.id, "name", e.target.value)} 
                                                    className="w-full text-xs font-extrabold text-[#1E1C18] bg-transparent hover:bg-[#1E1C18]/5 focus:bg-[#FAF7F0] border border-transparent focus:border-brand-gold/30 rounded-lg px-2.5 py-1.5 focus:outline-none transition-all" 
                                                  />
                                                  <input 
                                                    type="text" 
                                                    value={room.notes || ""} 
                                                    onChange={(e) => updateRoomField(room.id, "notes", e.target.value)} 
                                                    placeholder="Add specifications" 
                                                    className="w-full text-[10px] text-[#1E1C18]/45 bg-transparent hover:bg-[#1E1C18]/5 focus:bg-[#FAF7F0] border border-transparent focus:border-brand-gold/30 rounded-lg px-2.5 py-1 focus:outline-none transition-all font-medium" 
                                                  />
                                                </div>
                                              </td>
                                              
                                              {/* Quantity */}
                                              <td className={styles.td}>
                                                <div className="flex items-center justify-center">
                                                  <input 
                                                    type="number" 
                                                    step="any"
                                                    value={room.quantity !== undefined ? room.quantity : room.length} 
                                                    onChange={(e) => {
                                                      const val = parseFloat(e.target.value) || 0;
                                                      updateRoomField(room.id, "quantity", val);
                                                    }} 
                                                    className="w-20 text-center text-xs font-black text-[#1E1C18] bg-[#1E1C18]/5 focus:bg-white border border-[#1E1C18]/10 focus:border-brand-gold rounded-xl py-2 focus:outline-none transition-all shadow-inner" 
                                                  />
                                                </div>
                                              </td>
                                              
                                              {/* Unit */}
                                              <td className={styles.td}>
                                                <div className="flex items-center justify-center">
                                                  <input 
                                                    type="text" 
                                                    value={room.unit || "pcs"} 
                                                    onChange={(e) => updateRoomField(room.id, "unit", e.target.value)} 
                                                    className="w-16 text-center text-xs font-black text-[#1E1C18] bg-[#1E1C18]/5 focus:bg-white border border-[#1E1C18]/10 focus:border-brand-gold rounded-xl py-2 focus:outline-none transition-all shadow-inner" 
                                                  />
                                                </div>
                                              </td>
                                              
                                              {/* Unit Price */}
                                              <td className={styles.td}>
                                                <div className="flex items-center justify-end gap-1">
                                                  <span className="text-[10px] font-black text-[#1E1C18]/40">$</span>
                                                  <input 
                                                    type="number" 
                                                    step="0.01"
                                                    value={room.unit_price || 0} 
                                                    onChange={(e) => {
                                                      const val = parseFloat(e.target.value) || 0;
                                                      updateRoomField(room.id, "unit_price", val);
                                                    }} 
                                                    className="w-24 text-right text-xs font-black text-[#1E1C18] bg-[#1E1C18]/5 focus:bg-white border border-[#1E1C18]/10 focus:border-brand-gold rounded-xl py-2 pr-2.5 focus:outline-none transition-all shadow-inner" 
                                                  />
                                                </div>
                                              </td>
                                              
                                              {/* Total Price */}
                                              <td className={styles.td} style={{ textAlign: "right" }}>
                                                <span className="text-xs font-black text-[#1E1C18] bg-[#1E1C18]/5 border border-[#1E1C18]/5 rounded-lg px-2.5 py-1">
                                                  ${(parseFloat(room.total_price) || ( (parseFloat(room.quantity) || parseFloat(room.length) || 0) * (parseFloat(room.unit_price) || 0) )).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                              </td>
                                            </>
                                          ) : (
                                            <>
                                              <td className={styles.td}><div className="space-y-1"><input type="text" value={room.name} onChange={(e) => updateRoomField(room.id,"name",e.target.value)} className="w-full text-xs font-extrabold text-[#1E1C18] bg-transparent hover:bg-[#1E1C18]/5 focus:bg-[#FAF7F0] border border-transparent focus:border-brand-gold/30 rounded-lg px-2.5 py-1.5 focus:outline-none transition-all" /><input type="text" value={room.notes} onChange={(e) => updateRoomField(room.id,"notes",e.target.value)} placeholder="Add spec notes" className="w-full text-[10px] text-[#1E1C18]/45 bg-transparent hover:bg-[#1E1C18]/5 focus:bg-[#FAF7F0] border border-transparent focus:border-brand-gold/30 rounded-lg px-2.5 py-1 focus:outline-none transition-all font-medium" /></div></td>
                                              <td className={styles.td}><select value={room.category} onChange={(e) => updateRoomField(room.id,"category",e.target.value)} className={`text-[10px] font-extrabold border rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-sm ${catStyle.color}`}>{CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}</select></td>
                                              <td className={styles.td}><select value={room.floor} onChange={(e) => updateRoomField(room.id,"floor",e.target.value)} className="text-xs font-extrabold text-[#1E1C18] bg-[#FAF7F0] border border-[#1E1C18]/10 rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-inner">{FLOORS.map(f => <option key={f} value={f}>{f}</option>)}</select></td>
                                              <td className={styles.td}><div className="flex items-center justify-center gap-1.5"><input type="number" step="0.1" min="0.5" max="15.0" value={room.width} onChange={(e) => updateRoomField(room.id,"width",e.target.value)} className="w-16 text-center text-xs font-black text-[#1E1C18] bg-[#1E1C18]/5 focus:bg-white border border-[#1E1C18]/10 focus:border-brand-gold rounded-xl py-2 focus:outline-none transition-all shadow-inner" /><span className="text-[10px] font-black text-[#1E1C18]/40">m</span></div></td>
                                              <td className={styles.td}><div className="flex items-center justify-center gap-1.5"><input type="number" step="0.1" min="0.5" max="15.0" value={room.length} onChange={(e) => updateRoomField(room.id,"length",e.target.value)} className="w-16 text-center text-xs font-black text-[#1E1C18] bg-[#1E1C18]/5 focus:bg-white border border-[#1E1C18]/10 focus:border-brand-gold rounded-xl py-2 focus:outline-none transition-all shadow-inner" /><span className="text-[10px] font-black text-[#1E1C18]/40">m</span></div></td>
                                              <td className={styles.td} style={{ textAlign: "center" }}><span className="text-xs font-black text-[#1E1C18] bg-[#1E1C18]/5 border border-[#1E1C18]/5 rounded-lg px-2.5 py-1">{(room.width*room.length).toFixed(1)} m²</span></td>
                                            </>
                                          )}
                                          <td className={styles.td} style={{ textAlign: "right" }}>
                                            <button onClick={() => deleteRoom(room.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center border border-transparent hover:border-rose-100">
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    {rooms.filter(r => isAiParsed || r.floor===selectedFloor).length===0&&(
                                      <tr>
                                        <td colSpan={isAiParsed ? 6 : 7} className="px-6 py-12 text-center text-xs text-[#1E1C18]/40 font-semibold">
                                          No line items available in this quote.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              <div className="bg-[#FAF7F0]/40 border-t border-[#1E1C18]/5 px-6 py-5 flex items-center justify-between">
                                <button onClick={addRoom} className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold hover:bg-brand-gold-dark px-5 py-2.5 text-xs font-extrabold text-white transition-all shadow-md cursor-pointer">
                                  <Plus className="h-4 w-4" />
                                  {isAiParsed ? "Add Line Item" : `Add Room to ${selectedFloor}`}
                                </button>
                                <div className="text-xs text-[#1E1C18]/55 font-bold">
                                  {isAiParsed ? (
                                    <>
                                      Total Price:{" "}
                                      <span className="text-brand-gold font-black bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-xl ml-1">
                                        ${rooms.reduce((acc, r) => acc + (parseFloat(r.total_price) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      Floor Area:{" "}
                                      <span className="text-brand-gold font-black bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-xl ml-1">
                                        {rooms.filter(r=>r.floor===selectedFloor).reduce((acc,r)=>acc+(r.width*r.length),0).toFixed(1)} m²
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
 
                        {activeTab === "boq" && (
                          <div className={styles.boqList}>
                            {isAiParsed ? (
                              <>
                                <div>
                                  <h3 className="text-lg font-black text-[#1E1C18] flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-brand-gold" />
                                    AI-Driven Rate Verification
                                  </h3>
                                  <p className="text-xs text-[#1E1C18]/50">
                                    Real-time comparison of contractor quotes against standard Cambodian market averages.
                                  </p>
                                </div>
                                <div className="space-y-4">
                                  {aiAnalysisResults.length === 0 ? (
                                    <div className="bg-[#FAF7F0]/40 border border-dashed border-[#1E1C18]/10 rounded-2xl py-12 text-center text-xs text-[#1E1C18]/40 font-semibold">
                                      AI price analysis is compiling. Please wait...
                                    </div>
                                  ) : (
                                    aiAnalysisResults.map((item, idx) => {
                                      const isExpanded = expandedBoqItem === (item.id || idx);
                                      const overprice = item.overprice_percent || 0;
                                      const materialName = item.line_items?.material_name || item.material_name || "Material Details";
                                      const marketPriceVal = item.market_avg ?? item.market_price;
                                      const userPriceVal = item.user_price;
                                      
                                      const verdictThemes = {
                                        green: { text: "text-emerald-700 bg-emerald-50 border-emerald-100", label: "Fair" },
                                        fair: { text: "text-emerald-700 bg-emerald-50 border-emerald-100", label: "Fair" },
                                        amber: { text: "text-amber-800 bg-amber-50 border-amber-200/80", label: "Slightly High" },
                                        slightly_high: { text: "text-amber-800 bg-amber-50 border-amber-200/80", label: "Slightly High" },
                                        red: { text: "text-rose-800 bg-rose-50 border-rose-200/80", label: "Overpriced" },
                                        overpriced: { text: "text-rose-800 bg-rose-50 border-rose-200/80", label: "Overpriced" },
                                      };
                                      const theme = verdictThemes[item.verdict] || verdictThemes.fair;

                                      return (
                                        <div key={item.id || idx} className={styles.boqItem}>
                                          <div onClick={() => setExpandedBoqItem(isExpanded ? null : (item.id || idx))} className={styles.boqItemHeader}>
                                            <div className="flex items-center gap-3.5">
                                              <div className="h-10 w-10 bg-[#FAF7F0] border border-[#1E1C18]/5 rounded-xl flex items-center justify-center text-lg shadow-sm">
                                                {overprice > 20 ? "🚨" : overprice > 5 ? "⚠️" : "✅"}
                                              </div>
                                              <div>
                                                <h4 className="text-sm font-black text-[#1E1C18] leading-tight">{materialName}</h4>
                                                <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider ${theme.text} px-2 py-0.5 rounded border shadow-sm`}>
                                                  {theme.label} {overprice > 0 && `(+${overprice.toFixed(1)}%)`}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-5">
                                              <div className="text-right">
                                                <span className="text-[10px] text-[#1E1C18]/45 font-extrabold block uppercase tracking-wider">Quoted Price</span>
                                                <span className="text-xs font-black text-[#1E1C18]">${parseFloat(userPriceVal || 0).toFixed(2)}</span>
                                              </div>
                                              <div className="text-right">
                                                <span className="text-[10px] text-[#1E1C18]/45 font-extrabold block uppercase tracking-wider">Market Avg</span>
                                                <span className="text-xs font-black text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/25">
                                                  {marketPriceVal && marketPriceVal > 0 ? `$${parseFloat(marketPriceVal).toFixed(2)}` : "N/A"}
                                                </span>
                                              </div>
                                              <button className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${isExpanded ? "bg-brand-gold text-white shadow-md" : "bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/25"}`}>
                                                Explain
                                              </button>
                                            </div>
                                          </div>
                                          {isExpanded && (
                                            <div className={styles.boqItemContent}>
                                              <div className="bg-[#FAF7F0] border border-brand-gold/20 rounded-xl p-4 flex gap-3.5 text-xs text-[#1E1C18]/85 leading-relaxed shadow-inner font-semibold">
                                                <div className="flex-shrink-0 text-brand-gold mt-0.5">
                                                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                                                </div>
                                                <div className="space-y-2">
                                                  <div>
                                                    <strong className="text-brand-gold block font-black text-xs uppercase tracking-wide mb-1">AI Audit Rationale</strong>
                                                    {item.explanation || item.reason}
                                                  </div>
                                                  {item.negotiation_tip && (
                                                    <div className="pt-2 border-t border-brand-gold/10">
                                                      <strong className="text-amber-800 block font-black text-xs uppercase tracking-wide mb-1">Negotiation Recommendation</strong>
                                                      {item.negotiation_tip}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div><h3 className="text-lg font-black text-[#1E1C18] flex items-center gap-2"><Layers className="h-5 w-5 text-brand-gold" />BoQ Line-Item Auditor</h3><p className="text-xs text-[#1E1C18]/50">AI-extracted raw material quantities. Click <span className="font-extrabold text-brand-gold">Explain</span> for plain language breakdowns.</p></div>
                                <div className="space-y-4">
                                  {getBoqItems().map((item) => {
                                    const isExpanded = expandedBoqItem === item.id;
                                    return (
                                      <div key={item.id} className={styles.boqItem}>
                                        <div onClick={() => setExpandedBoqItem(isExpanded?null:item.id)} className={styles.boqItemHeader}>
                                          <div className="flex items-center gap-3.5"><div className="h-10 w-10 bg-[#FAF7F0] border border-[#1E1C18]/5 rounded-xl flex items-center justify-center text-lg shadow-sm">{item.id==="cement"?"🧱":item.id==="steel"?"🏗️":item.id==="bricks"?"🧱":item.id==="labor"?"👷":item.id==="paint"?"🎨":"⚡"}</div><div><h4 className="text-sm font-black text-[#1E1C18] leading-tight">{item.name}</h4><p className="text-[11px] text-[#1E1C18]/50 font-semibold mt-1">Quantity: <strong className="text-[#1E1C18] font-extrabold">{item.quantity}</strong></p></div></div>
                                          <div className="flex items-center gap-5"><div className="text-right"><span className="text-[10px] text-[#1E1C18]/45 font-extrabold block uppercase tracking-wider">Benchmark Rate</span><span className="text-xs font-black text-[#1E1C18]">${item.unitPrice.toFixed(2)}</span></div><div className="text-right"><span className="text-[10px] text-[#1E1C18]/45 font-extrabold block uppercase tracking-wider">Estimated Cost</span><span className="text-xs font-black text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/25">${Math.round(item.total).toLocaleString()}</span></div><button className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${isExpanded?"bg-brand-gold text-white shadow-md":"bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/25"}`}>Explain</button></div>
                                        </div>
                                        {isExpanded&&(
                                          <div className={styles.boqItemContent}>
                                            <div className="bg-[#FAF7F0] border border-brand-gold/20 rounded-xl p-4 flex gap-3.5 text-xs text-[#1E1C18]/85 leading-relaxed shadow-inner font-semibold">
                                              <div className="flex-shrink-0 text-brand-gold mt-0.5"><Sparkles className="h-4.5 w-4.5 animate-pulse" /></div>
                                              <div><strong className="text-brand-gold block font-black text-xs uppercase tracking-wide mb-1">AI Auditing Rationale</strong>{item.explanation}</div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {activeTab === "chat" && (
                          <div className={styles.chatLayout} style={{ height: "550px" }}>
                            <div className="bg-[#FAF7F0] border-b border-[#1E1C18]/5 px-6 py-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /><div><h3 className="text-xs font-black text-[#1E1C18] uppercase tracking-wider">DomNak AI Consultant</h3><p className="text-[10px] text-[#1E1C18]/45 font-bold">Active on project data & Cambodian metrics</p></div></div><span className="text-[9px] font-extrabold text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-full px-2.5 py-1 tracking-wider uppercase">Private Audit Agent</span></div>
                            <div className={styles.chatMessagesContainer}>
                              {chatMessages.map((msg,index) => (
                                <div key={index} className={msg.sender==="user" ? styles.chatBubbleUser : styles.chatBubbleAssistant}>
                                  <div className={msg.sender==="user" ? "max-w-[80%] rounded-2xl px-4 py-3.5 text-xs leading-relaxed whitespace-pre-line shadow-sm border font-semibold bg-[#1E1C18] text-white border-transparent rounded-tr-none" : "max-w-[80%] rounded-2xl px-4 py-3.5 text-xs leading-relaxed whitespace-pre-line shadow-sm border font-semibold bg-white text-[#1E1C18] border-[#1E1C18]/5 rounded-tl-none"}>
                                    {msg.sender==="ai"&&(<div className="flex items-center gap-1.5 text-[9px] font-black text-brand-gold tracking-wider uppercase mb-2"><Sparkles className="h-3 w-3" /><span>DomNak Agent</span></div>)}
                                    {msg.text}
                                  </div>
                                </div>
                              ))}
                              <div ref={chatBottomRef} />
                            </div>
                            <div className="px-6 py-3 border-t border-[#1E1C18]/5 bg-white flex flex-wrap gap-2">
                              <button id="btn-chat-redflags" onClick={() => handleChatSubmit("Analyze Red Flags in this Quote")} className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-3.5 py-2 rounded-full cursor-pointer transition-colors shadow-sm">🚩 Analyze Red Flags</button>
                              <button id="btn-chat-benchmarks" onClick={() => handleChatSubmit("Compare with Phnom Penh Averages")} className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-brand-gold bg-brand-gold/10 border border-brand-gold/15 hover:bg-brand-gold/20 px-3.5 py-2 rounded-full cursor-pointer transition-colors shadow-sm">🏢 Check Local Averages</button>
                              <button id="btn-chat-savings" onClick={() => handleChatSubmit("How can I lower construction cost by 15%?")} className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-3.5 py-2 rounded-full cursor-pointer transition-colors shadow-sm">💡 Show Savings Tips</button>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleChatSubmit(chatInput); }} className={styles.chatInputContainer}>
                              <input id="chat-input-text" type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask AI: 'Is the brick count normal?' or 'How can I save cost?'..." className="flex-grow bg-white border border-[#1E1C18]/10 rounded-full px-5 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all shadow-inner font-medium" />
                              <button id="chat-send-btn" type="submit" disabled={!chatInput.trim()||isChatTyping} className={styles.chatSendBtn}><Send className="h-4 w-4" /></button>
                            </form>
                          </div>
                        )}
                      </div>

                      {/* Right: AI Analysis Results */}
                      <div className="lg:col-span-4 space-y-6">
                        {/* Quote Summary Card */}
                        <div className="bg-[#1E1C18] text-white rounded-3xl p-6 space-y-5 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 rounded-bl-full pointer-events-none" />
                          <h3 className="text-sm font-black tracking-tight border-b border-white/10 pb-3 flex items-center gap-2">
                            <Scale className="h-4 w-4 text-brand-gold" />Quote Summary
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs text-white/60 font-medium">
                              <span>Contractor</span>
                              <span className="font-bold text-white">{contractorName || "—"}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-white/60 font-medium">
                              <span>Items Scanned</span>
                              <span className="font-bold text-white">{rooms.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-white/60 font-medium">
                              <span>Quality Tier</span>
                              <span className="font-bold text-brand-gold uppercase text-[11px]">{qualityTier}</span>
                            </div>
                            <hr className="border-white/8" />
                            <div className="flex justify-between items-center text-sm font-black">
                              <span className="text-brand-gold">Quoted Total</span>
                              <span className="text-brand-gold text-lg">${quotedPrice.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* AI Verdict Cards */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-black text-[#1E1C18] flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-brand-gold" />
                            AI Price Analysis
                            {aiAnalysisResults.length > 0 && (
                              <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/20">
                                {aiAnalysisResults.length} items
                              </span>
                            )}
                          </h3>

                          {aiAnalysisResults.length === 0 ? (
                            <div className="bg-[#FAF7F0] border border-[#1E1C18]/5 rounded-2xl p-6 text-center">
                              <div className="text-2xl mb-2">🔍</div>
                              <p className="text-xs font-semibold text-[#1E1C18]/50">
                                Upload a quote PDF to see AI-powered price analysis from Groq.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                              {aiAnalysisResults.map((item, idx) => {
                                const verdictConfig = {
                                  green: { bg: "bg-emerald-50/70 backdrop-blur-sm", border: "border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Fair Price", icon: CheckCircle },
                                  fair: { bg: "bg-emerald-50/70 backdrop-blur-sm", border: "border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Fair Price", icon: CheckCircle },
                                  amber: { bg: "bg-amber-50/70 backdrop-blur-sm", border: "border-amber-200/80", text: "text-amber-800", dot: "bg-amber-500", label: "Slightly High", icon: AlertTriangle },
                                  slightly_high: { bg: "bg-amber-50/70 backdrop-blur-sm", border: "border-amber-200/80", text: "text-amber-800", dot: "bg-amber-500", label: "Slightly High", icon: AlertTriangle },
                                  red: { bg: "bg-rose-50/70 backdrop-blur-sm", border: "border-rose-200/80", text: "text-rose-800", dot: "bg-rose-500", label: "Overpriced", icon: AlertTriangle },
                                  overpriced: { bg: "bg-rose-50/70 backdrop-blur-sm", border: "border-rose-200/80", text: "text-rose-800", dot: "bg-rose-500", label: "Overpriced", icon: AlertTriangle },
                                };
                                const vc = verdictConfig[item.verdict] || verdictConfig.fair;
                                const overprice = item.overprice_percent || 0;
                                const materialName = item.line_items?.material_name || item.material_name || "Material Details";
                                const qty = item.line_items?.quantity;
                                const unit = item.line_items?.unit;
                                const marketPriceVal = item.market_avg ?? item.market_price;
                                const userPriceVal = item.user_price;
                                const IconComponent = vc.icon;

                                return (
                                  <div key={item.id || idx} className={`${vc.bg} border ${vc.border} rounded-2xl p-4.5 space-y-3.5 transition-all duration-300 hover:shadow-md hover:scale-[1.01] flex flex-col`}>
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="space-y-0.5">
                                        <h4 className="text-sm font-black text-[#1E1C18] tracking-tight line-clamp-2">
                                          {materialName}
                                        </h4>
                                        {qty !== undefined && qty !== null && (
                                          <p className="text-[10px] text-[#1E1C18]/50 font-bold uppercase tracking-wider">
                                            Quantity: {qty} {unit || "units"}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider ${vc.text} px-2.5 py-1 rounded-full bg-white/90 shadow-sm border border-black/5`}>
                                          <IconComponent className="h-3 w-3" />
                                          {vc.label}
                                        </span>
                                        {overprice > 0 && (
                                          <span className="text-[9px] font-black text-rose-700 bg-rose-100 border border-rose-200/40 px-2 py-0.5 rounded-md">
                                            +{overprice.toFixed(1)}% Markup
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Pricing Comparison Grid */}
                                    <div className="grid grid-cols-2 gap-2.5">
                                      {userPriceVal !== undefined && userPriceVal !== null && (
                                        <div className="bg-white/80 border border-[#1E1C18]/5 rounded-xl p-2.5 text-center shadow-sm">
                                          <span className="text-[8px] font-extrabold text-[#1E1C18]/45 uppercase tracking-wider block mb-0.5">Quoted Rate</span>
                                          <span className="text-sm font-black text-[#1E1C18]">${parseFloat(userPriceVal).toFixed(2)}</span>
                                          {unit && <span className="text-[9px] text-[#1E1C18]/40 font-bold block mt-0.5">per {unit}</span>}
                                        </div>
                                      )}
                                      {marketPriceVal !== undefined && marketPriceVal !== null && marketPriceVal > 0 && (
                                        <div className="bg-white/80 border border-[#1E1C18]/5 rounded-xl p-2.5 text-center shadow-sm">
                                          <span className="text-[8px] font-extrabold text-emerald-800/60 uppercase tracking-wider block mb-0.5">Market Average</span>
                                          <span className="text-sm font-black text-emerald-700">${parseFloat(marketPriceVal).toFixed(2)}</span>
                                          {unit && <span className="text-[9px] text-emerald-600/60 font-bold block mt-0.5">per {unit}</span>}
                                        </div>
                                      )}
                                    </div>

                                    {/* Analysis Reason / Explanation */}
                                    {(item.explanation || item.reason) && (
                                      <div className="bg-white/40 border border-black/5 rounded-xl p-3 text-[11px] text-[#1E1C18]/75 font-semibold leading-relaxed shadow-inner">
                                        <p>{item.explanation || item.reason}</p>
                                      </div>
                                    )}

                                    {/* Negotiation Advice Card */}
                                    {item.negotiation_tip && (
                                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
                                        <span className="text-sm animate-pulse">💡</span>
                                        <div className="space-y-0.5">
                                          <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-wider block">Negotiation Strategy</span>
                                          <p className="text-[10px] font-bold text-[#1E1C18]/80 leading-relaxed">{item.negotiation_tip}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
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
                <div className="space-y-6 bg-white border border-[#1E1C18]/5 rounded-3xl p-6 lg:p-8 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#1E1C18]/5 pb-4 mb-6">
                    <h3 className="font-black text-lg text-[#1E1C18] flex items-center gap-2">
                      <History className="h-5 w-5 text-brand-gold" />
                      Saved Audit History
                    </h3>
                    <span className="text-[10px] font-black text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {auditHistory.length} Saved {auditHistory.length === 1 ? "Audit" : "Audits"}
                    </span>
                  </div>

                  {auditHistory.length === 0 ? (
                    <div className="text-center py-16 bg-[#FAF7F0]/40 border border-dashed border-[#1E1C18]/10 rounded-2xl">
                      <div className="h-14 w-14 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mx-auto mb-4 border border-brand-gold/20">
                        <History className="h-6 w-6" />
                      </div>
                      <h3 className="font-extrabold text-lg text-[#1E1C18]">No Saved Audits</h3>
                      <p className="text-xs text-[#1E1C18]/50 mt-1.5 max-w-sm mx-auto font-semibold leading-relaxed">
                        Upload a contractor proposal in the Quotes tab to start an audit.
                      </p>
                      <button 
                        onClick={() => setSidebarTab("quotes")} 
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-gold hover:bg-brand-gold-dark px-5 py-3 text-xs font-black text-white transition-all shadow-md cursor-pointer"
                      >
                        <Building className="h-4 w-4" />
                        Start Quote Audit
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {auditHistory.map((audit) => {
                        const savedArea = audit.rooms?.reduce((acc,r) => acc+(r.width*r.length),0)||0;
                        return (
                          <div key={audit.id} className="bg-[#FAF7F0]/40 border border-[#1E1C18]/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-gold/40 group-hover:bg-brand-gold transition-colors rounded-l-3xl" />
                            <div className="pl-2">
                              <div className="flex justify-between items-start gap-4">
                                <span className="text-[10px] font-mono text-[#1E1C18]/40 font-semibold flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {audit.date}
                                </span>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2.5 py-1 rounded-md">
                                  {audit.qualityTier} finish
                                </span>
                              </div>
                              <h4 className="font-black text-lg text-[#1E1C18] mt-3 tracking-tight">{audit.projectName}</h4>
                              <p className="text-xs text-[#1E1C18]/50 font-semibold mt-1">
                                Contractor: <strong className="text-[#1E1C18] font-extrabold">{audit.contractorName}</strong>
                              </p>
                              <div className="flex items-center gap-6 mt-4 bg-white border border-[#1E1C18]/5 p-4 rounded-xl shadow-inner">
                                <div>
                                  <span className="text-[9px] text-[#1E1C18]/40 font-black uppercase tracking-wider block">Quoted Price</span>
                                  <span className="text-sm font-black text-[#1E1C18]">${audit.quotedPrice.toLocaleString()}</span>
                                </div>
                                <div className="h-8 w-[1px] bg-[#1E1C18]/10" />
                                <div>
                                  <span className="text-[9px] text-[#1E1C18]/40 font-black uppercase tracking-wider block">Estimated Area</span>
                                  <span className="text-sm font-black text-[#1E1C18]">{savedArea.toFixed(1)} m²</span>
                                </div>
                              </div>
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
            )}

            {/* ──── RECEIVED QUOTES TAB ─────────────────────────────────── */}
            {sidebarTab === "received" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-6 bg-white border border-[#1E1C18]/5 rounded-3xl p-6 lg:p-8 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#1E1C18]/5 pb-4 mb-6">
                    <h3 className="font-black text-lg text-[#1E1C18] flex items-center gap-2">
                      <Inbox className="h-5 w-5 text-brand-gold" />
                      Quotes from Architects
                    </h3>
                    <span className="text-[10px] font-black text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {receivedQuotes.length} {receivedQuotes.length === 1 ? "Quote" : "Quotes"}
                    </span>
                  </div>

                  {receivedQuotes.length === 0 ? (
                    <div className="text-center py-16 bg-[#FAF7F0]/40 border border-dashed border-[#1E1C18]/10 rounded-2xl">
                      <div className="h-14 w-14 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mx-auto mb-4 border border-brand-gold/20">
                        <Inbox className="h-6 w-6" />
                      </div>
                      <h3 className="font-extrabold text-lg text-[#1E1C18]">No Received Quotes</h3>
                      <p className="text-xs text-[#1E1C18]/50 mt-1.5 max-w-sm mx-auto font-semibold leading-relaxed">
                        Architects will send you BOQ quotes here when you connect with them.
                      </p>
                      <button 
                        onClick={() => setSidebarTab("chat")} 
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-gold hover:bg-brand-gold-dark px-5 py-3 text-xs font-black text-white transition-all shadow-md cursor-pointer"
                      >
                        <MailIcon className="h-4 w-4" />
                        Go to Messages
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {receivedQuotes.map((quote) => (
                        <div key={quote.id} className="bg-[#FAF7F0] border border-[#1E1C18]/5 rounded-2xl p-5 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono text-[#1E1C18]/40">
                                  {new Date(quote.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 rounded-full">
                                  {quote.area || "—"} m²
                                </span>
                              </div>
                              <h4 className="font-black text-[#1E1C18]">{quote.file_name || "BOQ Quote"}</h4>
                              <p className="text-xs text-[#1E1C18]/50 mt-1">
                                From: <span className="font-semibold">{quote.sender_name || "Architect"}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-black text-brand-gold">
                                ${(quote.total || 0).toLocaleString()}
                              </div>
                              <button
                                onClick={() => {
                                  // Load received quote into cost estimator for review
                                  setReceivedQuoteToReview(quote);
                                  setProjectName(quote.file_name || "Received BOQ");
                                  setContractorName(quote.sender_name || "Architect");
                                  setQuotedPrice(quote.total || 0);
                                  // Load boq_data into rooms if available
                                  if (quote.boq_data && quote.boq_data.items) {
                                    const items = quote.boq_data.items.map((item, idx) => ({
                                      id: `received-${idx}`,
                                      name: item.name || item.material || "Item",
                                      quantity: item.quantity || 1,
                                      unit: item.unit || "pcs",
                                      unit_price: item.unit_price || item.rate || 0,
                                      total_price: item.total || (item.quantity || 1) * (item.unit_price || item.rate || 0),
                                      notes: item.specification || "",
                                      category: "foundation",
                                      floor: "1",
                                      width: 1,
                                      length: 1
                                    }));
                                    setRooms(items);
                                  }
                                  setShowResults(true);
                                  setSidebarTab("quotes");
                                }}
                                className="mt-2 text-xs font-bold text-brand-gold hover:text-brand-gold-dark cursor-pointer"
                              >
                                Review Quote →
                              </button>
                            </div>
                          </div>
                          {quote.boq_data && (
                            <div className="mt-4 pt-4 border-t border-[#1E1C18]/10">
                              <div className="text-[10px] font-black text-[#1E1C18]/40 uppercase tracking-wider mb-2">
                                {quote.boq_data.items?.length || 0} Line Items
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {quote.boq_data.items?.slice(0, 5).map((item, idx) => (
                                  <span key={idx} className="text-xs bg-white border border-[#1E1C18]/10 rounded-lg px-2.5 py-1">
                                    {item.name || item.material}
                                  </span>
                                ))}
                                {(quote.boq_data.items?.length || 0) > 5 && (
                                  <span className="text-xs text-[#1E1C18]/40">
                                    +{(quote.boq_data.items?.length || 0) - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ──── SUPPLIERS TAB ─────────────────────────────────────── */}
            {sidebarTab === "suppliers" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <SupplierDirectory showHeader={true} onShowToast={showToast} />
              </div>
            )}

            {/* ──── CHAT TAB ──────────────────────────────────────────── */}
            {sidebarTab === "chat" && (
              <div className="animate-in fade-in duration-300">
                  <ChatUI
                    contacts={chatContacts}
                    selectedId={selectedChatUserId}
                    onSelectContact={handleSelectChatContact}
                    messages={messages}
                    onSendMessage={handleChatSend}
                    onDeleteMessage={handleDeleteMessage}
                    isTyping={false}
                    isSending={chatSending}
                    activeContact={chatContacts.find((contact) => contact.id === selectedChatUserId) || null}
                    placeholder="Type a message…"
                  onReviewQuote={(msg) => {
                    // Find the quote from receivedQuotes by message_id or parse from message
                    const quote = receivedQuotes.find(q => q.message_id === msg.id);
                    const quoteData = quote || {
                      id: `msg_${msg.id}`,
                      file_name: msg.text?.match(/File: (.+)/)?.[1] || "BOQ Quote",
                      total_amount: parseFloat(msg.text?.match(/Total: \$([\d,]+\.?\d*)/)?.[1]?.replace(/,/g, "") || 0),
                      sender_name: msg.text?.match(/New Quote from (.+)/)?.[1] || "Architect",
                      contractor_name: msg.text?.match(/New Quote from (.+)/)?.[1] || "Architect",
                      from_message: true,
                      message_id: msg.id
                    };
                    setReceivedQuoteToReview(quoteData);
                    setProjectName(quoteData.file_name || "Received BOQ");
                    setContractorName(quoteData.sender_name || quoteData.contractor_name || "Architect");
                    setQuotedPrice(quoteData.total || quoteData.total_amount || 0);
                    if (quoteData.boq_data && quoteData.boq_data.items) {
                      const items = quoteData.boq_data.items.map((item, idx) => ({
                        id: `received-${idx}`,
                        name: item.name || item.material || "Item",
                        quantity: item.quantity || 1,
                        unit: item.unit || "pcs",
                        unit_price: item.unit_price || item.rate || 0,
                        total_price: item.total || (item.quantity || 1) * (item.unit_price || item.rate || 0),
                        notes: item.specification || "",
                        category: "foundation",
                        floor: "1",
                        width: 1,
                        length: 1
                      }));
                      setRooms(items);
                    }
                    setShowResults(true);
                    setSidebarTab("quotes");
                  }}
                />
          </div>
        )}
        </div>
        )}
      </div>
      </div>
    </>
  );
}
