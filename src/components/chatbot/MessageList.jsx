import React from "react";
import MessageItem from "./MessageItem";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

export default function MessageList({ messages, isTyping, messagesEndRef }) {
  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <MessageItem key={msg.id} msg={msg} />
      ))}

      {isTyping && (
        <div className="flex gap-3 max-w-[85%] mr-auto">
          <Avatar size="default" className="border border-brand-dark/5 shadow-sm">
            <AvatarFallback className="bg-[#b38e42]/10 text-[#80632b] font-semibold text-sm">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-[#FAF7F0] border border-[#b38e42]/10 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
