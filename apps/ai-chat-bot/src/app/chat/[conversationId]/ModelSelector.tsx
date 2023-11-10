"use client";

import { useToast } from "@/client/hooks/use-toast";
import { updateConversationModel } from "@/lib/actions/conversations";
import { OPENAI_MODELS } from "@/lib/common/constants";
import type { Conversation, AIModel } from "@/lib/database/types";
import { useRouter } from "next/navigation";
import React from "react";

export default function ModelSelector({
  conversation,
  onChange,
}: {
  conversation: Conversation;
  onChange?: (model: AIModel) => void;
}) {
  const toast = useToast();
  const router = useRouter();
  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const model = event.target.value as AIModel;
    const result = await updateConversationModel({
      conversationId: conversation.id,
      model,
    });

    if (result.type === "error") {
      toast.error(result.error);
    } else {
      onChange?.(model);
      router.refresh();
    }
  };

  return (
    <div className="w-full p-4 text-lg md:text-2xl">
      <label className="text-lg text-gray-700 dark:text-gray-400">Model</label>
      <select
        className={`w-full rounded-lg border border-gray-600/50 bg-transparent p-2 text-gray-800 outline-none
        dark:text-neutral-200`}
        onChange={handleChange}
        defaultValue={conversation.model}
      >
        {OPENAI_MODELS.map((x, idx) => {
          return (
            <option
              key={idx}
              className="text-gray-900 dark:bg-black dark:text-white"
              value={x.model}
            >
              {x.name}
            </option>
          );
        })}
      </select>
    </div>
  );
}
