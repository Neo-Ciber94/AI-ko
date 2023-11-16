"use client";

import type { AIModel, Role } from "@/lib/database/types";
import type { Message } from "./ChatMessages";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import RegenerateButton from "./RegenerateButton";
import { useState } from "react";

export default function ChatMessageItem({
  model,
  message,
  isLoading,
  canRegenerate,
}: {
  model: AIModel;
  message: Message;
  isLoading?: boolean;
  canRegenerate?: boolean;
}) {
  const role = message.role;

  return (
    <div
      className={
        "flex flex-row items-center gap-4 px-2 text-xs sm:px-4 sm:text-base"
      }
    >
      <div
        className={`w-full rounded-lg p-2 shadow ${
          role === "user"
            ? "bg-white text-black dark:bg-neutral-800 dark:text-white"
            : "bg-gray-200 text-black dark:bg-black dark:text-white"
        }`}
      >
        <div className="flex w-full flex-row items-center justify-between">
          {role === "assistant" ? (
            <AIModelLabel model={model} />
          ) : canRegenerate ? (
            <RegenerateButton />
          ) : (
            <div></div>
          )}
          {role === "assistant" && <Avatar role={role}>AI</Avatar>}
          {role === "user" && <Avatar role={role}>Me</Avatar>}
        </div>

        {isLoading ? <LoadingSpinner /> : <MessageContent message={message} />}
      </div>
    </div>
  );
}

function MessageContent({ message }: { message: Message }) {
  const contents = message.contents[0];

  switch (contents.type) {
    case "text": {
      const text = contents.text;

      // we don't format user code
      if (message.role === "user") {
        return (
          <pre
            suppressHydrationWarning
            className={
              "message w-full max-w-4xl whitespace-pre-wrap break-all p-2 text-white"
            }
          >
            {text}
          </pre>
        );
      } else {
        return (
          <pre
            suppressHydrationWarning
            className={
              "message w-full max-w-4xl break-before-all whitespace-pre-wrap p-2 text-white"
            }
            dangerouslySetInnerHTML={{
              __html: text,
            }}
          ></pre>
        );
      }
    }
    case "image": {
      return <ImageContent content={contents} />;
    }
    default:
      throw new Error("Not implemented");
  }
}

type ImageContentProps = {
  content: {
    imagePrompt: string;
    imageUrl: string;
  };
};

function ImageContent(props: ImageContentProps) {
  const { imagePrompt, imageUrl } = props.content;
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-center p-4">
      <Image
        width={512}
        height={512}
        alt={imagePrompt}
        src={imageUrl}
        className={`overflow-hidden rounded-lg object-cover shadow-md duration-200 ${
          showPrompt ? "scale-95" : "scale-100"
        } `}
        onClick={() => {
          setShowPrompt((show) => !show);
        }}
      />

      <span
        className={`text-mono block overflow-hidden pt-4 text-xs transition-all duration-700 dark:text-white ${
          showPrompt ? "max-h-[300px]" : "max-h-0"
        }`}
      >
        {imagePrompt}
      </span>
    </div>
  );
}

function Avatar({ role, children }: { role: Role; children: React.ReactNode }) {
  return (
    <div
      className={`flex h-8 w-10 flex-shrink-0 flex-row items-center justify-center rounded-lg border-2 bg-black 
        text-xs text-white sm:h-10 sm:w-16 sm:text-base ${
          role === "user" ? "border-blue-500" : "border-red-500"
        }`}
    >
      {children}
    </div>
  );
}

function AIModelLabel({ model }: { model: AIModel }) {
  return (
    <span
      title="AI Model"
      className={`flex h-6 cursor-pointer flex-row items-center justify-center 
    rounded-lg bg-gradient-to-t px-3 text-[10px] font-semibold shadow
    ${
      model === "gpt-3.5-turbo"
        ? "from-rose-900 to-rose-950 text-white"
        : "from-amber-300 to-amber-500 text-black"
    }`}
    >
      {model}
    </span>
  );
}
