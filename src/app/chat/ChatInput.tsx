"use client";

import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function ChatInput() {
  return (
    <div className="flex w-full flex-row items-center justify-center">
      <textarea
        placeholder="Send Message"
        rows={1}
        className="w-full resize-none overflow-hidden rounded-lg border border-neutral-400/30 bg-black py-4 pl-4 pr-10 text-white 
shadow-md outline-none placeholder:text-white/50 focus:border-neutral-400/60 lg:w-[700px]"
        onInput={(e) => {
          const self = e.currentTarget;
          self.style.height = "0";
          self.style.height = self.scrollHeight + "px";
        }}
      ></textarea>
      <button className="-ml-8">
        <PaperAirplaneIcon className="right-8 h-6 w-6 text-gray-400/60" />
      </button>
    </div>
  );
}
