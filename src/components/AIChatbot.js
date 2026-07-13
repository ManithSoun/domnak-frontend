import { useState, useRef, useEffect } from "react";
import {
  Bot, Plus, Home, Search, BookOpen, Send, Mic, Paperclip,
  ChevronDown, ExternalLink, PanelLeftClose, PanelLeft,
  MessageSquare, Sparkles, DollarSign, FileText
} from "lucide-react";

// ── Suggestion cards shown on the welcome screen ─────────────────────────────
const SUGGESTION_CARDS = [
  {
    emoji: "✦",
    title: "Verify Quote",
    desc: "Check quotes against Cambodian market rates.",
    prompt: "Help me verify a contractor quote for my construction project.",
  },
  {
    emoji: "📖",
    title: "Save Costs",
    desc: "Tips on saving budget on bulk materials.",
    prompt: "What are the best ways to save on bulk building materials in Cambodia?",
  },
  {
    emoji: "🏛",
    title: "About BOQ",
    desc: "Learn how we automate Bill of Quantities sheets.",
    prompt: "Explain how the Bill of Quantities (BOQ) works in Domnak.",
  },
];

// ── Sample recent chats shown in the sidebar ─────────────────────────────────
const SAMPLE_RECENTS = [
  { id: "r1", title: "Construction Budget Cambodia" },
  { id: "r2", title: "Contractor Quote Verification" },
  { id: "r3", title: "BOQ Setup for 2-Story House" },
];

// ── AI reply logic ────────────────────────────────────────────────────────────
function getAIReply(text) {
  const t = text.toLowerCase();
  if (t.includes("cement") || t.includes("concrete"))
    return "In Kandal/Phnom Penh, SCG or Chip Mong cement ranges from $85 to $95 per ton. Ready-mix concrete C25/30 costs around $65 to $72 per cubic meter. These are standard wholesale builder rates.";
  if (t.includes("steel") || t.includes("rebar"))
    return "Steel deformed rebars are currently trading around $680 to $720 per ton depending on import origin (Vietnam or China) and the quantity ordered.";
  if (t.includes("brick") || t.includes("masonry"))
    return "Red clay bricks (8×15×25 cm) cost $0.05–$0.07 per piece. Hollow concrete bricks are priced $0.12–$0.15 per piece in Kandal Province.";
  if (t.includes("tile") || t.includes("floor"))
    return "Ceramic floor tiles (60×60 cm) range $8–$14/sqm locally. Imported porcelain tiles from Vietnam or Thailand cost $15–$28/sqm depending on finish grade.";
  if (t.includes("roof"))
    return "Metal roofing sheets (Colorsteel/Zincalume) run ~$4.50–$6.50/sqm installed. Clay roof tiles cost $12–$18/sqm for standard Cambodian profiles.";
  if (t.includes("paint") || t.includes("wall"))
    return "Nippon or TOA exterior paint costs ~$22–$30 per 18 L can, covering roughly 90 sqm per coat. Interior emulsion paint runs $15–$22 per can for equivalent coverage.";
  if (t.includes("boq") || t.includes("bill of quantities"))
    return "A Bill of Quantities (BOQ) is a detailed breakdown of all materials and labour needed for construction. Domnak AI auto-generates a BOQ from your floor plan scans using local Cambodian price benchmarks.";
  if (t.includes("verify") || t.includes("quote"))
    return "To verify a contractor quote I compare each line item against our Cambodian market-rate database. Share the quote details (materials, quantities, unit prices) and I'll audit every item for you.";
  if (t.includes("save") || t.includes("cost") || t.includes("budget"))
    return "Top ways to save on construction in Cambodia:\n1. Buy cement in bulk — a full truck load gives a 5–8% discount.\n2. Source local bricks from Kandal rather than central Phnom Penh.\n3. Use ready-mix concrete for foundations instead of site-mixed.";
  return "I'm cross-referencing your question with local Cambodian material benchmarks. Standard housing in Phnom Penh costs $350–$450/m² while premium villas range $480–$650/m². Could you share more specifics about your project so I can give you a tailored answer?";
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AIChatbot({ userName = "User" }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [recents, setRecents] = useState(SAMPLE_RECENTS);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const trimmed = text.trim();
    setMessages(prev => [...prev, { id: `u_${Date.now()}`, sender: "user", text: trimmed }]);
    setInput("");
    setIsTyping(true);
    if (!hasStarted) {
      setHasStarted(true);
      const title = trimmed.length > 30 ? trimmed.slice(0, 28) + "…" : trimmed;
      setRecents(prev => [{ id: `c_${Date.now()}`, title }, ...prev.slice(0, 4)]);
    }
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: `a_${Date.now()}`, sender: "ai", text: getAIReply(trimmed) }]);
    }, 1200);
  };

  const handleNewChat = () => {
    setMessages([]);
    setHasStarted(false);
    setInput("");
    setActiveChat(null);
  };

  return (
    <div
      style={{ height: "calc(100vh - 130px)", minHeight: 520 }}
      className="flex bg-[#F5F1EB] rounded-2xl overflow-hidden border border-brand-dark/5 shadow-sm"
    >
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="w-56 flex-shrink-0 bg-white border-r border-[#E8E3DA] flex flex-col">
          {/* Logo + collapse */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="h-7 w-7 rounded-lg bg-brand-gold flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-black">D</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-brand-dark/30 hover:text-brand-dark transition-colors cursor-pointer p-1 rounded-lg hover:bg-[#F5F1EB]">
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* New chat */}
          <div className="px-3 pt-2 pb-3">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#F5F1EB] hover:bg-brand-gold/10 text-brand-dark text-xs font-bold transition-all cursor-pointer border border-transparent hover:border-brand-gold/20"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5" />
                New chat
              </span>
              <kbd className="text-[10px] text-brand-dark/25 font-normal">⌘N</kbd>
            </button>
          </div>

          {/* Nav links */}
          <div className="px-3 space-y-0.5">
            {[
              { icon: Home,     label: "Back to Home" },
              { icon: Search,   label: "Search chats" },
              { icon: BookOpen, label: "Library" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] text-brand-dark/55 hover:text-brand-dark hover:bg-[#F5F1EB] transition-all cursor-pointer font-semibold">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Recents */}
          <div className="px-3 mt-5 flex-1 overflow-y-auto">
            <p className="text-[9px] font-black text-brand-dark/30 tracking-widest uppercase mb-2 px-3">Recents</p>
            <div className="space-y-0.5">
              {recents.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] transition-all cursor-pointer text-left font-semibold ${
                    activeChat === chat.id
                      ? "bg-[#F5F1EB] text-brand-dark border border-brand-gold/20"
                      : "text-brand-dark/55 hover:text-brand-dark hover:bg-[#F5F1EB]"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-brand-dark/30" />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User chip + upgrade */}
          <div className="px-3 pb-4 mt-2 border-t border-[#E8E3DA] pt-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F5F1EB] border border-[#E8E3DA]">
              <div className="h-6 w-6 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white text-[10px] font-black">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-brand-dark truncate">{userName}</p>
                <p className="text-[9px] text-brand-dark/40">Free Plan</p>
              </div>
            </div>
            <button className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-gold text-white text-[10px] font-black shadow-sm hover:bg-brand-gold-dark transition-all cursor-pointer">
              <Sparkles className="h-3 w-3" />
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}

      {/* ── Main Area ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white/80 backdrop-blur-sm border-b border-[#E8E3DA]">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-brand-dark/30 hover:text-brand-dark transition-colors cursor-pointer p-1 rounded-lg hover:bg-[#F5F1EB] mr-1">
                <PanelLeft className="h-4 w-4" />
              </button>
            )}
            <button className="flex items-center gap-1.5 font-black text-sm text-brand-dark hover:text-brand-gold transition-colors cursor-pointer">
              DomNak Cost Helper
              <ChevronDown className="h-3.5 w-3.5 text-brand-dark/35" />
            </button>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-brand-dark/40 hover:text-brand-dark transition-colors cursor-pointer font-semibold">
            Back to home
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!hasStarted ? (
            /* ── Welcome / Empty State ── */
            <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center">
              {/* Bot avatar */}
              <div className="h-16 w-16 rounded-2xl bg-[#EDE7D8] flex items-center justify-center mb-6 shadow-inner">
                <Bot className="h-8 w-8 text-brand-gold" />
              </div>

              <h2 className="text-2xl font-black text-brand-dark mb-2 tracking-tight">Ready when you are.</h2>
              <p className="text-sm text-brand-dark/45 mb-8 max-w-xs leading-relaxed">
                Ask me anything about Cambodian construction rates,<br />
                contractor quotes, or BOQ generators.
              </p>

              {/* Input */}
              <div className="w-full max-w-xl mb-8">
                <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-[#E8E3DA] focus-within:border-brand-gold/40 transition-colors">
                  <Paperclip className="h-4 w-4 text-brand-dark/25 flex-shrink-0 cursor-pointer hover:text-brand-dark/50 transition-colors" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                    placeholder="Ask anything..."
                    className="flex-1 text-sm text-brand-dark placeholder-brand-dark/30 bg-transparent outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button className="text-brand-dark/25 hover:text-brand-dark/50 transition-colors cursor-pointer">
                      <Mic className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => sendMessage(input)}
                      className="h-7 w-7 rounded-full bg-brand-gold flex items-center justify-center text-white hover:bg-brand-gold-dark transition-colors cursor-pointer shadow-sm"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggestion cards */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-xl">
                {SUGGESTION_CARDS.map(card => (
                  <button
                    key={card.title}
                    onClick={() => sendMessage(card.prompt)}
                    className="bg-white rounded-2xl p-4 text-left border border-[#E8E3DA] hover:border-brand-gold/30 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <span className="text-lg mb-2 block">{card.emoji}</span>
                    <p className="text-xs font-black text-brand-dark mb-1 group-hover:text-brand-gold transition-colors">{card.title}</p>
                    <p className="text-[10px] text-brand-dark/45 leading-relaxed">{card.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Chat messages ── */
            <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "ai" && (
                    <div className="h-8 w-8 rounded-xl bg-[#EDE7D8] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                      <Bot className="h-4 w-4 text-brand-gold" />
                    </div>
                  )}
                  <div className={`max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-brand-gold text-white rounded-tr-sm shadow-sm"
                      : "bg-white text-brand-dark rounded-tl-sm shadow-sm border border-[#E8E3DA]"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-xl bg-[#EDE7D8] flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Bot className="h-4 w-4 text-brand-gold" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm border border-[#E8E3DA] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Persistent input bar (visible while chatting) */}
        {hasStarted && (
          <div className="px-6 pb-6 pt-3">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-[#E8E3DA] focus-within:border-brand-gold/40 transition-colors">
                <Paperclip className="h-4 w-4 text-brand-dark/25 flex-shrink-0 cursor-pointer hover:text-brand-dark/50 transition-colors" />
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Ask DomNak AI about construction costs…"
                  className="flex-1 text-sm text-brand-dark placeholder-brand-dark/30 bg-transparent outline-none"
                />
                <div className="flex items-center gap-2">
                  <button className="text-brand-dark/25 hover:text-brand-dark/50 transition-colors cursor-pointer">
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => sendMessage(input)}
                    className="h-7 w-7 rounded-full bg-brand-gold flex items-center justify-center text-white hover:bg-brand-gold-dark transition-colors cursor-pointer shadow-sm"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
