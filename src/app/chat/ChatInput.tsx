"use client";

export default function ChatInput() {
  return (
    <textarea
      placeholder="Send Message"
      rows={1}
      className="w-full resize-none overflow-hidden rounded-lg border border-neutral-400/30 bg-black p-4 
        text-white shadow-md outline-none placeholder:text-white/50 focus:border-neutral-400/60 sm:w-[800px]"
      onInput={(e) => {
        const self = e.currentTarget;
        self.style.height = "0";
        self.style.height = self.scrollHeight + "px";
      }}
    ></textarea>
  );
}
