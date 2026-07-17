import { useState, useRef, useEffect } from "react";
import { Send, Search, Paperclip, MoreVertical, Phone, Trash2 } from "lucide-react";


export default function ChatUI({
  contacts = [],
  selectedId,
  onSelectContact,
  messages = [],
  onSendMessage,
  onDeleteMessage,
  isTyping = false,
  activeContact,
  placeholder = "Type a message…",
  onReviewQuote,
}) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleDeleteMessage = (messageId) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
    }
    setOpenMenuId(null);
  };

  const handleCall = () => {
    if (activeContact?.phone) {
      window.location.href = `tel:${activeContact.phone}`;
    } else {
      alert("Phone number not available for this contact.");
    }
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const Avatar = ({ initials, size = "md", online = false }) => {
    const dim = size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
    return (
      <div className="relative shrink-0">
        <div
          className={`${dim} rounded-full bg-gradient-to-br from-brand-gold/40 to-brand-gold/10 border-2 border-brand-gold/30 flex items-center justify-center font-black text-brand-dark`}
        >
          {initials}
        </div>
        {online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200" />
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[640px] rounded-3xl overflow-hidden border border-brand-dark/5 shadow-xl bg-white animate-in fade-in duration-300">
      {/* ── LEFT: Contact list ─────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col border-r border-brand-dark/5 bg-[#FDFCF9]">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-brand-dark/5">
          <h3 className="font-black text-base text-brand-dark mb-3">
            Messages
          </h3>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-dark/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts…"
              className="w-full bg-brand-dark/5 border border-transparent focus:border-brand-gold/30 focus:bg-white rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/10 transition-all placeholder:text-brand-dark/30"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {filtered.map((c) => {
            const isActive = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => onSelectContact(c.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
                  isActive
                    ? "bg-brand-gold/10 border border-brand-gold/25"
                    : "hover:bg-brand-dark/4 border border-transparent"
                }`}
              >
                <Avatar
                  initials={c.initials || getInitials(c.name)}
                  size="sm"
                  online={isActive}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-black truncate ${
                        isActive ? "text-brand-dark" : "text-brand-dark/80"
                      }`}
                    >
                      {c.name}
                    </span>
                    <span className="text-[9px] text-brand-dark/35 font-mono shrink-0">
                      {c.time || ""}
                    </span>
                  </div>
                  {c.lastMsg && (
                    <p className="text-[10px] text-brand-dark/45 font-medium truncate mt-0.5">
                      {c.lastMsg}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Chat window ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activeContact ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-brand-dark/5 bg-[#FDFCF9] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  initials={
                    activeContact.initials || getInitials(activeContact.name)
                  }
                  online
                />
                <div className="min-w-0">
                  <p className="text-sm font-black text-brand-dark truncate">
                    {activeContact.name}
                  </p>
                  <p className="text-[10px] text-brand-dark/50 font-semibold truncate">
                    {activeContact.role || activeContact.project || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeContact.project && (
                  <span className="hidden sm:inline-flex text-[9px] font-black text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-full px-3 py-1 uppercase tracking-wider">
                    {activeContact.project}
                  </span>
                )}
                <button
                  className="p-2 rounded-xl hover:bg-brand-dark/5 text-brand-dark/40 hover:text-brand-gold transition-all cursor-pointer"
                  onClick={handleCall}
                  title="Call"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#FAF7F0]/30">
              {messages.map((msg, i) => {
                const isMe = msg.sender === "me";
                const isMenuOpen = openMenuId === msg.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar for incoming */}
                    {!isMe && (
                      <Avatar
                        initials={
                          activeContact.initials ||
                          getInitials(activeContact.name)
                        }
                        size="sm"
                      />
                    )}

                    <div
                      className={`max-w-[68%] flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender label */}
                      {!isMe && (
                        <span className="text-[9px] font-black text-brand-gold uppercase tracking-wider mb-1 px-1">
                          {activeContact.name}
                        </span>
                      )}

                          <div className="relative group">
                        <div
                          className={`relative px-4 py-3 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm ${
                            isMe
                              ? "bg-brand-dark text-white rounded-br-sm"
                              : "bg-white text-brand-dark border border-brand-dark/6 rounded-bl-sm"
                          }`}
                        >
                          {msg.text && msg.text.includes("New Quote from") ? (
                            <div>
                              <p>{msg.text}</p>
                              {onReviewQuote && (
                                <button
                                  onClick={() => onReviewQuote(msg)}
                                  className="mt-2 text-[10px] font-bold text-brand-gold hover:text-brand-gold-dark cursor-pointer underline"
                                >
                                  → Review this Quote
                                </button>
                              )}
                            </div>
                          ) : (
                            <p>{msg.text}</p>
                          )}
                          <span
                            className={`text-[8px] font-mono mt-1.5 block ${
                              isMe
                                ? "text-white/40 text-right"
                                : "text-brand-dark/35"
                            }`}
                          >
                            {msg.time}
                          </span>
                        </div>
                        
                        {/* Message menu button (only show for own messages) */}
                        {isMe && onDeleteMessage && (
                          <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setOpenMenuId(isMenuOpen ? null : msg.id)}
                              className="h-6 w-6 rounded-full bg-brand-dark/10 hover:bg-brand-dark/20 flex items-center justify-center shadow-sm"
                            >
                              <MoreVertical className="h-3 w-3 text-brand-dark/60" />
                            </button>
                            
                            {/* Dropdown menu */}
                            {isMenuOpen && (
                              <div 
                                ref={menuRef}
                                className="absolute right-0 top-8 w-36 bg-white border border-brand-dark/10 rounded-xl shadow-lg py-1 z-50"
                              >
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="w-full px-3 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-brand-dark/5 bg-[#FDFCF9] px-5 py-4 flex items-center gap-3"
            >
              <button
                type="button"
                className="p-2 rounded-xl text-brand-dark/35 hover:text-brand-gold hover:bg-brand-gold/10 transition-all cursor-pointer shrink-0"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                className="flex-grow bg-white border border-brand-dark/10 rounded-full px-5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all shadow-inner font-semibold text-brand-dark placeholder:text-brand-dark/30"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-10 w-10 bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-40 text-white rounded-full flex items-center justify-center shrink-0 transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-brand-dark/30 gap-3">
            <div className="h-16 w-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center">
              <Send className="h-7 w-7 text-brand-gold/50" />
            </div>
            <p className="text-sm font-black">Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
