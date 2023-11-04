"use client";

import { eventEmitter } from "@/client/events";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function RegenerateButton() {
  return (
    <button
      className="group flex flex-row items-center gap-2 rounded-lg 
        bg-black/10 p-2 text-xs text-white duration-100 hover:bg-black/30 active:bg-black/40"
      onClick={() => {
        eventEmitter.regenerateChat();
      }}
    >
      <ArrowPathIcon className="h-3 w-3 group-hover:animate-spin" />
      <span>Regenerate</span>
    </button>
  );
}
