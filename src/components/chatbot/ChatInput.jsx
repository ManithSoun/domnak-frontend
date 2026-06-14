import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";

export default function ChatInput({
  input,
  setInput,
  onSubmit,
  showSuggestions,
  suggestions,
}) {
  return (
    <div className="bg-[#fffdf9]/50 border-t border-[#b38e42]/10 p-3 flex flex-col gap-3">
      {showSuggestions && (
        <div className="flex flex-wrap gap-2 w-full">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onSubmit(s)}
              className="text-xs sm:text-sm font-semibold bg-white text-[#80632b] hover:bg-[#b38e42]/10 border border-[#b38e42]/20 px-4 py-2 rounded-full transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <Separator className="bg-[#b38e42]/10" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) onSubmit(input);
        }}
        className="flex w-full gap-2 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow bg-white border border-[#b38e42]/20 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#b38e42] transition-colors"
        />
        <Button
          type="submit"
          disabled={!input.trim()}
          className="rounded-full bg-[#b38e42] hover:bg-[#80632b] text-white h-10 w-10 p-0 flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <Send className="h-4.5 w-4.5" />
        </Button>
      </form>
    </div>
  );
}
