"use client";

import { useToast } from "@/client/hooks/use-toast";
import {
  updateConversationModel,
  type Conversation,
  type AIModel,
} from "@/lib/actions/conversations";
import React from "react";

export default function ModelSelector({
  conversation,
}: {
  conversation: Conversation;
}) {
  const toast = useToast();
  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const model = event.target.value as AIModel;
    const result = await updateConversationModel({
      conversationId: conversation.id,
      model,
    });

    if (result.type === "error") {
      toast.error(result.error);
    }
  };

  return (
    <div className="w-full p-4 text-2xl">
      <label className="text-lg text-gray-700 dark:text-gray-400">Model</label>
      <select
        className={`w-full rounded-lg border border-gray-600/50 bg-transparent p-2 text-gray-800 outline-none
        dark:text-neutral-200`}
        onChange={handleChange}
        defaultValue={conversation.model}
      >
        <option
          className="text-gray-900 dark:bg-black dark:text-white"
          value="gpt-3.5-turbo"
        >
          GPT-3.5
        </option>
        <option
          className="text-gray-900 dark:bg-black dark:text-white"
          value="gpt-4"
        >
          GPT-4
        </option>
      </select>
    </div>
  );
}
