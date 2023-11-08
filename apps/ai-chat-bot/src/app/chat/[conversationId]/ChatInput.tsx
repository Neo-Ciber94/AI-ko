"use client";

import { useTextProgression } from "@/client/hooks/use-text-progression";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";

type ChatInputProps = {
  isLoading?: boolean;
  onSend: (text: string) => void;
};

export default function ChatInput({ isLoading, onSend }: ChatInputProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const loadingText = useTextProgression({
    texts: ["Loading", "Loading.", "Loading..", "Loading..."],
    enabled: !isLoading,
  });

  useEffect(() => {
    if (textAreaRef.current) {
      const self = textAreaRef.current;
      self.style.height = "0px";
      self.style.height = self.scrollHeight + "px";
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim().length === 0) {
      return;
    }

    onSend(text);
    setText("");
  };

  return (
    <div className="flex w-full flex-row items-center justify-center">
      <textarea
        disabled={isLoading}
        ref={textAreaRef}
        placeholder={isLoading ? loadingText : "Send Message"}
        rows={1}
        value={text}
        className="w-full resize-none overflow-hidden rounded-lg border border-gray-400/30 bg-black py-4 pl-4 pr-10 text-white
         shadow-lg outline-none placeholder:text-white/50 focus:border-neutral-400/60 
         disabled:cursor-not-allowed dark:border-neutral-400/30 lg:w-[700px]"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            handleSend();
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        onChange={(e) => setText(e.currentTarget.value)}
      ></textarea>
      <button
        className="relative -ml-8"
        onClick={handleSend}
        disabled={isLoading}
      >
        {isLoading ? (
          <ArrowPathIcon className="right-8 h-5 w-5 animate-spin text-gray-400/50" />
        ) : (
          <PaperAirplaneIcon className="right-8 h-5 w-5 text-gray-400/50" />
        )}
      </button>
    </div>
  );
}
