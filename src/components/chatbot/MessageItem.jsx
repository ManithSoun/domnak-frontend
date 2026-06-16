import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

export default function MessageItem({ msg }) {
  const isUser = msg.sender === "user";
  return (
    <div
      className={`flex gap-3 max-w-[85%] ${
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      }`}
    >
      <Avatar size="default" className="border border-brand-dark/5 shadow-sm">
        {isUser ? (
          <AvatarFallback className="bg-[#201b12]/5 text-[#201b12] font-semibold text-sm">
            <User className="h-4 w-4" />
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-[#b38e42]/10 text-[#80632b] font-semibold text-sm">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>
      <div
        className={`rounded-2xl px-4 py-2.5 text-sm sm:text-base leading-relaxed shadow-sm ${
          isUser
            ? "bg-[#b38e42] text-white rounded-tr-none"
            : "bg-[#FAF7F0] text-[#201b12] rounded-tl-none border border-[#b38e42]/10 whitespace-pre-line"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}
