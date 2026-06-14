import React, { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Sparkles, AlertCircle } from "lucide-react";
import MessageList from "@/components/chatbot/MessageList";
import ChatInput from "@/components/chatbot/ChatInput";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: "initial",
      sender: "bot",
      text: "Hello! I'm DomNak AI, your personal construction cost assistant. Ask me anything about building costs, contractor quotes, or how to generate a Bill of Quantities (BOQ) in Cambodia.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "How can I save on construction costs?",
    "How do I verify a contractor's quote?",
    "What is a Bill of Quantities (BOQ)?",
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let botResponseText = "";
      const query = textToSend.toLowerCase();

      if (query.includes("save") || query.includes("cost") || query.includes("budget")) {
        botResponseText = "To save on construction costs in Cambodia, you should: \n\n1. Compare contractor quotes line-by-line using market databases (like Domnak's verifier on the home page) to avoid materials markup.\n2. Purchase bulk materials directly from verified suppliers to bypass middle middlemen commissions.\n3. Make sure to have a comprehensive BOQ before work starts to avoid surprise variations.";
      } else if (query.includes("quote") || query.includes("verify") || query.includes("contractor")) {
        botResponseText = "You can easily verify your contractor's quote with Domnak! Just head back to the Home page, go to the 'Homeowners' tab or 'How it works' step 1, and upload your PDF/photo. We'll cross-verify the material prices against our real-time Cambodian construction market index.";
      } else if (query.includes("boq") || query.includes("quantities") || query.includes("bill")) {
        botResponseText = "A Bill of Quantities (BOQ) is a detailed schedule of materials, parts, labor, and costs. On Domnak, architects and builders can upload architectural layout diagrams, and our AI will automatically estimate dimensions to generate a matching spreadsheet BOQ template in minutes.";
      } else {
        botResponseText = "I'm here to help you navigate Cambodian residential and commercial construction costs! Feel free to ask how to verify your quotes, download a BOQ template, or browse local verified suppliers on our platform.";
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      <Header />
      <main className="flex-grow bg-[#FAF7F0] py-10 sm:py-16 relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#b38e42]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#80632b]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            
            {/* Left Column: AI Assistant Info Panel */}
            <div className="lg:w-1/3 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b38e42]/10 px-3 py-1 text-xs font-bold text-[#80632b] uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  DomNak AI
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#201b12] tracking-tight">
                  Clarity at your <span className="text-[#b38e42] italic">fingertips</span>
                </h1>
                <p className="text-sm sm:text-base text-[#201b12]/70 leading-relaxed">
                  Have questions about material rates, architectural steps, or how to avoid overcharging? Ask Domnak AI for instant estimates and advice.
                </p>
              </div>

              {/* Note / Tip card */}
              <div className="bg-white/60 backdrop-blur border border-[#b38e42]/10 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-[#b38e42] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-[#201b12]/60 leading-relaxed">
                  Disclaimer: Estimates provided by the assistant are guidelines based on average Cambodian market rates.
                </p>
              </div>
            </div>

            {/* Right Column: Chat Window using Shadcn components */}
            <div className="flex-grow lg:w-2/3">
              <Card className="bg-white border border-[#b38e42]/15 shadow-xl rounded-2xl overflow-hidden flex flex-col h-[600px]">
                
                {/* Chat Header */}
                <CardHeader className="bg-[#fffdf9]/50 border-b border-[#b38e42]/10 p-4 flex flex-row items-center gap-3">
                  <Avatar size="default" className="border border-[#b38e42]/20">
                    <AvatarFallback className="bg-[#b38e42]/15 text-[#80632b] font-bold">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-bold text-[#201b12]">DomNak Cost Helper</CardTitle>
                    <CardDescription className="text-xs text-[#b38e42] font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      AI Assistant • Online
                    </CardDescription>
                  </div>
                </CardHeader>

                {/* Message Body (Modular component) */}
                <MessageList 
                  messages={messages} 
                  isTyping={isTyping} 
                  messagesEndRef={messagesEndRef} 
                />

                {/* Input & Suggestions Footer (Modular component) */}
                <ChatInput
                  input={input}
                  setInput={setInput}
                  onSubmit={handleSend}
                  showSuggestions={messages.length === 1 && !isTyping}
                  suggestions={suggestions}
                />

              </Card>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
