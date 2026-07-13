import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../../router/useAuth";
import {
  Menu,
  X,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  BookOpen,
  Briefcase,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Send,
  Mic,
  Paperclip,
  Home,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  Bot,
  ArrowLeft
} from "lucide-react";

export default function CostHelperChatbot({ 
  layoutMode = "fullscreen", 
  onBack = null, 
  userOverride = null, 
  logoutOverride = null,
  dashboardSidebarOpen = true,
  setDashboardSidebarOpen = null
}) {
  const router = useRouter();
  const auth = useAuth();
  
  // Use overrides if provided (useful inside dashboards where user is passed down)
  const user = userOverride || auth?.user;
  const logout = logoutOverride || auth?.logout;

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Model state
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [activeModel, setActiveModel] = useState("DomNak Cost Helper");

  // Sessions state
  const [sessions, setSessions] = useState([
    {
      id: "session-1",
      title: "Construction Budget Cambodia",
      messages: [
        {
          id: "initial",
          sender: "bot",
          text: "Hello! I'm DomNak AI, your personal construction cost assistant. Ask me anything about building costs, contractor quotes, or how to generate a Bill of Quantities (BOQ) in Cambodia.",
          timestamp: new Date(),
        }
      ]
    },
    {
      id: "session-2",
      title: "Contractor Quote Verification",
      messages: [
        {
          id: "initial",
          sender: "bot",
          text: "Hello! Upload your contractor's quote here and let's verify if the rates are in line with the Cambodian market rates.",
          timestamp: new Date(),
        }
      ]
    },
    {
      id: "session-3",
      title: "BOQ Setup for 2-Story House",
      messages: [
        {
          id: "initial",
          sender: "bot",
          text: "Hello! Let's generate a BOQ outline for your residential project.",
          timestamp: new Date(),
        }
      ]
    }
  ]);
  
  const [currentSessionId, setCurrentSessionId] = useState("session-1");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const activeSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Simple Markdown parser for paragraphs and bold text rendering
  const parseMarkdown = (text, isUserMsg) => {
    if (!text) return "";
    const paragraphs = text.split("\n\n");
    return paragraphs.map((para, paraIdx) => {
      const parts = para.split("**");
      const renderedParts = parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <strong 
              key={index} 
              className={`font-black ${isUserMsg ? "text-white" : "text-black"}`}
            >
              {part}
            </strong>
          );
        }
        return part;
      });

      return (
        <p 
          key={paraIdx} 
          className={`mb-4 last:mb-0 leading-relaxed sm:leading-loose text-[14px] sm:text-[15px] tracking-wide whitespace-pre-line ${
            isUserMsg ? "text-white" : "text-[#201b12]/90"
          }`}
        >
          {renderedParts}
        </p>
      );
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isTyping]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Check if user is logged in
    const token = localStorage.getItem("access_token");
    if (!token) {
      const proceed = window.confirm("You need to log in to chat with DomNak AI. Would you like to log in now?");
      if (proceed) {
        router.push("/login?role=homeowner");
      }
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === currentSessionId) {
          // If this was an empty/default title, update it with the user's message prefix
          const isInitialOnly = session.messages.length <= 1;
          const newTitle = isInitialOnly 
            ? (textToSend.length > 25 ? textToSend.substring(0, 25) + "..." : textToSend)
            : session.title;
          
          return {
            ...session,
            title: newTitle,
            messages: [...session.messages, userMsg]
          };
        }
        return session;
      });
    });

    setInput("");
    setIsTyping(true);

    // Create a temporary bot message slot for streaming response
    const botMsgId = (Date.now() + 1).toString();
    const botMsg = {
      id: botMsgId,
      sender: "bot",
      text: "",
      timestamp: new Date(),
    };

    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, botMsg]
          };
        }
        return session;
      });
    });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/chat/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: textToSend,
          user_id: user?.id || localStorage.getItem("user_id") || "guest-id",
          mode: "groq-ai"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let botResponseText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.replace("data: ", "").trim();
            try {
              const data = JSON.parse(jsonStr);
              if (data.chunk) {
                botResponseText += data.chunk;
                setSessions(prevSessions => {
                  return prevSessions.map(session => {
                    if (session.id === currentSessionId) {
                      const updatedMessages = session.messages.map(msg => {
                        if (msg.id === botMsgId) {
                          return { ...msg, text: botResponseText };
                        }
                        return msg;
                      });
                      return { ...session, messages: updatedMessages };
                    }
                    return session;
                  });
                });
              }
            } catch (e) {
              console.error("Error parsing stream line:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setSessions(prevSessions => {
        return prevSessions.map(session => {
          if (session.id === currentSessionId) {
            const updatedMessages = session.messages.map(msg => {
              if (msg.id === botMsgId) {
                return { 
                  ...msg, 
                  text: "Sorry, I encountered an error connecting to the AI helper backend. Please ensure your backend server is running and you are logged in." 
                };
              }
              return msg;
            });
            return { ...session, messages: updatedMessages };
          }
          return session;
        });
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      title: "New chat",
      messages: [
        {
          id: "initial",
          sender: "bot",
          text: "Hello! I'm DomNak AI, your personal construction cost assistant. Ask me anything about building costs, contractor quotes, or how to generate a Bill of Quantities (BOQ) in Cambodia.",
          timestamp: new Date(),
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setMobileSidebarOpen(false);
  };

  const selectSession = (id) => {
    setCurrentSessionId(id);
    setMobileSidebarOpen(false);
  };

  const quickActions = [
    {
      title: "Verify Quote",
      description: "Check quotes against Cambodian market rates.",
      prompt: "How do I verify a contractor's quote with Domnak?",
      icon: <Sparkles className="h-5 w-5 text-[#b38e42]" />
    },
    {
      title: "Save Costs",
      description: "Tips on saving budget on bulk materials.",
      prompt: "How can I save on construction costs in Cambodia?",
      icon: <BookOpen className="h-5 w-5 text-[#b38e42]" />
    },
    {
      title: "About BOQ",
      description: "Learn how we automate Bill of Quantities sheets.",
      prompt: "What is a Bill of Quantities (BOQ) and how do I generate one?",
      icon: <Briefcase className="h-5 w-5 text-[#b38e42]" />
    }
  ];

  const outerContainerClass = layoutMode === "fullscreen" 
    ? "h-screen w-full flex bg-white text-[#201b12] font-sans overflow-hidden"
    : "flex-grow flex h-full w-full bg-white text-[#201b12] font-sans overflow-hidden rounded-3xl border border-[#b38e42]/10 shadow-lg animate-in fade-in duration-300";

  return (
    <div className={outerContainerClass}>
      
      {/* 1. Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 2. Left Sidebar (Drawer on mobile, side panel on desktop) */}
      <div 
        className={`absolute md:relative inset-y-0 left-0 z-50 flex flex-col justify-between w-72 bg-[#FAF7F0] border-r border-[#b38e42]/10 transition-transform duration-300 md:transition-none md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        } ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto p-3.5 space-y-4">
          
          {/* Sidebar Top: Branding & Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-[#b38e42]/5">
            <div className="flex items-center space-x-2">
              {setDashboardSidebarOpen ? (
                <button 
                  type="button"
                  onClick={() => setDashboardSidebarOpen(!dashboardSidebarOpen)}
                  className="p-1.5 text-gray-500 hover:text-[#b38e42] hover:bg-[#201b12]/5 rounded-lg transition-colors cursor-pointer"
                  title={dashboardSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                  <Menu className="h-5 w-5" />
                </button>
              ) : onBack ? (
                <button 
                  type="button"
                  onClick={onBack}
                  className="p-1.5 text-gray-500 hover:text-[#b38e42] hover:bg-[#201b12]/5 rounded-lg transition-colors cursor-pointer"
                  title="Back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              ) : (
                <Link 
                  href="/" 
                  className="p-1.5 text-gray-500 hover:text-[#b38e42] hover:bg-[#201b12]/5 rounded-lg transition-colors cursor-pointer"
                  title="Back to Home"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              )}
              <Link href="/" className="flex items-center group">
                <img
                  src="/assets/domnak-circle-logo.png"
                  alt="DomNak Logo"
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  setMobileSidebarOpen(false);
                }}
                className="p-1.5 text-gray-500 hover:text-[#b38e42] hover:bg-[#201b12]/5 rounded-lg transition-colors cursor-pointer hidden md:block"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4.5 w-4.5" />
              </button>
              <button 
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 text-gray-500 hover:text-[#b38e42] hover:bg-[#201b12]/5 rounded-lg transition-colors cursor-pointer md:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-[#80632b] bg-white border border-[#b38e42]/20 hover:bg-[#b38e42]/10 rounded-xl transition-all shadow-sm hover:shadow group cursor-pointer"
          >
            <span className="flex items-center space-x-2">
              <Plus className="h-4 w-4 text-[#b38e42] transition-transform group-hover:rotate-90 duration-200" />
              <span>New chat</span>
            </span>
            <span className="text-[10px] bg-[#FAF7F0] border border-[#b38e42]/10 px-1.5 py-0.5 rounded text-gray-400">⌘N</span>
          </button>

          {/* Navigation Links */}
          <div className="space-y-1">
            {onBack ? (
              <button 
                type="button"
                onClick={onBack}
                className="flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#201b12]/70 hover:text-[#b38e42] hover:bg-[#201b12]/5 transition-colors text-left cursor-pointer"
              >
                <Home className="h-4 w-4 text-gray-400" />
                <span>Back to Dashboard</span>
              </button>
            ) : (
              <Link 
                href="/"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#201b12]/70 hover:text-[#b38e42] hover:bg-[#201b12]/5 transition-colors"
              >
                <Home className="h-4 w-4 text-gray-400" />
                <span>Back to Home</span>
              </Link>
            )}
            <div className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#201b12]/70 hover:text-[#b38e42] hover:bg-[#201b12]/5 transition-colors cursor-pointer">
              <Search className="h-4 w-4 text-gray-400" />
              <span>Search chats</span>
            </div>
            <div className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#201b12]/70 hover:text-[#b38e42] hover:bg-[#201b12]/5 transition-colors cursor-pointer">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span>Library</span>
            </div>
          </div>

          {/* Recents Section */}
          <div className="space-y-2 pt-2">
            <h3 className="px-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recents</h3>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => selectSession(session.id)}
                  className={`flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-sm text-left transition-all cursor-pointer ${
                    session.id === currentSessionId
                      ? "bg-[#b38e42]/10 text-[#80632b] font-bold border-l-2 border-[#b38e42]"
                      : "text-[#201b12]/85 hover:bg-[#201b12]/5"
                  }`}
                >
                  <MessageSquare className={`h-4 w-4 shrink-0 ${session.id === currentSessionId ? "text-[#b38e42]" : "text-gray-400"}`} />
                  <span className="truncate flex-1">{session.title}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Bottom: User Profile Section */}
        <div className="p-3.5 border-t border-[#b38e42]/5 bg-[#f5f0e1]/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-8.5 w-8.5 rounded-full bg-[#b38e42]/15 text-[#80632b] flex items-center justify-center font-bold text-sm border border-[#b38e42]/20">
                {user ? (user.company || user.name || "U").charAt(0).toUpperCase() : "G"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#201b12] truncate max-w-[130px]">
                  {user ? (user.company || user.name) : "Guest User"}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Free Plan</span>
              </div>
            </div>
            
            {user ? (
              <button 
                type="button"
                onClick={logout}
                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            ) : (
              <Link 
                href="/login" 
                className="text-xs font-bold text-[#b38e42] hover:text-[#80632b] transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
          <button
            type="button"
            className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#b38e42] to-[#80632b] hover:from-[#9c7832] hover:to-[#6a5021] text-white py-2 px-3 rounded-lg text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Upgrade to Pro</span>
          </button>
        </div>

      </div>

      {/* 3. Main Chat Container */}
      <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-[#b38e42]/5 bg-white/70 backdrop-blur-sm z-30">
          <div className="flex items-center space-x-2">
            {/* Dashboard Sidebar Toggle Hamburger */}
            {setDashboardSidebarOpen && !sidebarOpen && (
              <button
                type="button"
                onClick={() => setDashboardSidebarOpen(!dashboardSidebarOpen)}
                className="p-1.5 text-gray-500 hover:text-[#b38e42] hover:bg-[#201b12]/5 rounded-lg transition-colors cursor-pointer mr-1"
                title={dashboardSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Sidebar toggle button (if collapsed) */}
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 text-gray-500 hover:text-[#b38e42] hover:bg-[#201b12]/5 rounded-lg transition-colors cursor-pointer hidden md:block"
                title="Expand sidebar"
              >
                <PanelLeft className="h-4.5 w-4.5" />
              </button>
            )}
            
            {/* Hamburger menu for mobile */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 text-gray-500 hover:text-[#b38e42] hover:bg-[#201b12]/5 rounded-lg transition-colors cursor-pointer md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-bold text-[#201b12]/85 hover:bg-[#201b12]/5 rounded-xl transition-all cursor-pointer"
              >
                <span>{activeModel}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${modelDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {modelDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setModelDropdownOpen(false)} />
                  <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white border border-[#b38e42]/15 shadow-xl py-1.5 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModel("DomNak Cost Helper");
                        setModelDropdownOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-[#201b12]">DomNak Cost Helper</span>
                      {activeModel === "DomNak Cost Helper" && <CheckCircle2 className="h-4.5 w-4.5 text-[#b38e42]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModel("BOQ Specialist");
                        setModelDropdownOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-[#201b12]">BOQ Specialist</span>
                      {activeModel === "BOQ Specialist" && <CheckCircle2 className="h-4.5 w-4.5 text-[#b38e42]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModel("Supplier Scout");
                        setModelDropdownOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-[#201b12]">Supplier Scout</span>
                      {activeModel === "Supplier Scout" && <CheckCircle2 className="h-4.5 w-4.5 text-[#b38e42]" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-[#b38e42] transition-colors cursor-pointer bg-transparent border-none"
              >
                <span>Back to Dashboard</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            ) : (
              <Link
                href="/"
                className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-[#b38e42] transition-colors"
              >
                <span>Back to home</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </header>

        {/* Chat Area Content */}
        <div className="flex-grow flex flex-col justify-between overflow-hidden">
          
          {/* If chat has only initial template prompt -> Show beautiful ChatGPT center screen */}
          {activeSession.messages.length === 1 && !isTyping ? (
            <div className="flex-grow overflow-y-auto flex flex-col justify-center items-center px-4 py-8 bg-[#FAF7F0]/10">
              <div className="max-w-2xl w-full flex flex-col items-center space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
                
                {/* Branding Circle */}
                <div className="h-16 w-16 bg-[#b38e42]/10 border border-[#b38e42]/20 rounded-full flex items-center justify-center shadow-sm">
                  <Bot className="h-8 w-8 text-[#b38e42]" />
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-extrabold text-[#201b12] tracking-tight">
                    Ready when you are.
                  </h2>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
                    Ask me anything about Cambodian construction rates, contractor quotes, or BOQ generators.
                  </p>
                </div>

                {/* Central Input Box */}
                <div className="w-full px-4">
                  <div className="relative flex items-center bg-white border-2 border-[#b38e42]/20 rounded-3xl py-3 pl-4 pr-3 shadow-md focus-within:border-[#b38e42] focus-within:ring-2 focus-within:ring-[#b38e42]/15 transition-all w-full">
                    <button 
                      type="button" 
                      className="text-gray-400 hover:text-[#b38e42] p-1 mr-2 transition-colors cursor-pointer"
                      title="Upload file"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && input.trim()) {
                          handleSend(input);
                        }
                      }}
                      placeholder="Ask anything..." 
                      className="flex-grow bg-transparent border-0 text-base focus:outline-none text-[#201b12] placeholder-gray-400 py-1"
                    />
                    <div className="flex items-center space-x-2">
                      <button 
                        type="button" 
                        className="text-gray-400 hover:text-[#b38e42] p-1.5 transition-colors cursor-pointer"
                        title="Voice input"
                      >
                        <Mic className="h-5 w-5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleSend(input)}
                        disabled={!input.trim()}
                        className="bg-[#201b12] hover:bg-[#b38e42] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-full p-2.5 transition-all shadow-sm flex items-center justify-center cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-4 px-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(action.prompt)}
                      className="flex flex-col text-left p-4 rounded-2xl bg-white border border-[#b38e42]/15 hover:border-[#b38e42] hover:bg-[#FAF7F0]/40 transition-all shadow-xs hover:shadow duration-200 cursor-pointer group"
                    >
                      <div className="mb-2 p-1.5 rounded-lg bg-[#b38e42]/5 w-fit group-hover:bg-[#b38e42]/10 transition-colors">
                        {action.icon}
                      </div>
                      <h4 className="text-xs font-bold text-[#201b12] mb-1">{action.title}</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{action.description}</p>
                    </button>
                  ))}
                </div>

              </div>
            </div>
          ) : (
            
            /* Otherwise, show standard message list */
            <div className="flex-grow overflow-y-auto px-4 py-6 space-y-6 bg-[#FAF7F0]/10">
              <div className="max-w-3xl mx-auto space-y-6">
                {activeSession.messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-3 sm:space-x-4 max-w-[85%] ${
                        isUser ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs shadow-xs border ${
                        isUser 
                          ? "bg-[#201b12]/5 text-[#201b12] border-[#201b12]/10" 
                          : "bg-[#b38e42]/10 text-[#80632b] border-[#b38e42]/20"
                      }`}>
                        {isUser ? (user ? (user.company || user.name || "U").charAt(0).toUpperCase() : "U") : <Bot className="h-4.5 w-4.5" />}
                      </div>

                      {/* Content Bubble */}
                      <div className="flex flex-col space-y-1">
                        <div
                          className={`rounded-2xl px-5 py-4 shadow-xs ${
                            isUser
                              ? "bg-[#b38e42] rounded-tr-none"
                              : "bg-white rounded-tl-none border border-[#b38e42]/10 shadow-xs"
                          }`}
                        >
                          {parseMarkdown(msg.text, isUser)}
                        </div>
                        <span className={`text-[10px] text-gray-400 font-medium ${isUser ? "text-right" : "text-left"}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-4 max-w-[85%] mr-auto">
                    <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs bg-[#b38e42]/10 text-[#80632b] border border-[#b38e42]/20 shadow-xs">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                    <div className="bg-white border border-[#b38e42]/10 rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-1.5 shadow-xs">
                      <span className="h-2 w-2 bg-[#b38e42]/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 bg-[#b38e42]/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 bg-[#b38e42]/60 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Bottom Chat Input Form (Shown only when message lists are active) */}
          {activeSession.messages.length > 1 && (
            <div className="border-t border-gray-100 bg-[#FAF7F0]/10 pb-6 pt-2 shrink-0">
              <div className="max-w-3xl mx-auto px-4 w-full">
                <div className="relative flex items-center bg-white border border-[#b38e42]/20 rounded-3xl py-2 pl-4 pr-3 shadow-md focus-within:border-[#b38e42] focus-within:ring-2 focus-within:ring-[#b38e42]/10 transition-all w-full">
                  <button 
                    type="button" 
                    className="text-gray-400 hover:text-[#b38e42] p-1 mr-2 transition-colors cursor-pointer"
                    title="Upload file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && input.trim()) {
                        handleSend(input);
                      }
                    }}
                    placeholder="Ask anything..." 
                    className="flex-grow bg-transparent border-0 text-sm focus:outline-none text-[#201b12] placeholder-gray-400 py-1"
                  />
                  <div className="flex items-center space-x-1.5">
                    <button 
                      type="button" 
                      className="text-gray-400 hover:text-[#b38e42] p-1.5 transition-colors cursor-pointer"
                      title="Voice input"
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSend(input)}
                      disabled={!input.trim()}
                      className="bg-[#201b12] hover:bg-[#b38e42] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-full p-2.5 transition-all shadow-sm flex items-center justify-center cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-gray-400 font-medium">
                    DomNak AI can make mistakes. Verify critical construction quotes and details.
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
