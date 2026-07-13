import React from "react";
import { useAuth } from "../../../router/useAuth";
import CostHelperChatbot from "../../components/chatbot/CostHelperChatbot";

export default function ChatbotPage() {
  const { user, logout } = useAuth();
  
  return (
    <CostHelperChatbot 
      layoutMode="fullscreen" 
      userOverride={user} 
      logoutOverride={logout} 
    />
  );
}
