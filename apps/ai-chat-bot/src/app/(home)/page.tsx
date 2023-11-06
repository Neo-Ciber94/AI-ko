"use client";

import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex h-[70vh] w-full flex-col items-center justify-center gap-4 p-4 md:container">
      <h1 className="text-3xl font-bold sm:text-4xl md:text-6xl">
        Unleash Your Imagination with our AI Chatbot with image generation!
      </h1>

      <p className="text-xl font-medium opacity-80 sm:text-2xl md:text-4xl">
        Are you ready to witness the magic of AI as it brings your creative
        visions to life? Our AI-powered chatbot is here to empower you with the
        ability to generate stunning images at your command.
      </p>

      <hr className="my-4 h-1 w-full border-black/20 dark:border-white" />

      <Link
        href="/chat"
        className="flex flex-row items-center gap-2 rounded-xl bg-black px-10 py-4 text-base text-white shadow-md sm:text-lg"
      >
        <span>Chat</span>
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </Link>
    </div>
  );
}
