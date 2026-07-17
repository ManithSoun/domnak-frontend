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
      <div ref={messagesEndRef} />
    </div>
  );
}
