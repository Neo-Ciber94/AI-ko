import { type ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";

export const HEADER_ASSISTANT_MESSAGE_ID = "Assistant-Message-Id";
export const HEADER_USER_MESSAGE_ID = "User-Message-Id";
export const DEFAULT_CONVERSATION_TITLE = "New Chat";

type OpenAIModel = ChatCompletionCreateParamsBase["model"];

type AIModelCollection = readonly {
  model: OpenAIModel;
  name: string;
}[];

export const OPENAI_MODELS = [
  { model: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { model: "gpt-4", name: "GPT-4" },
] satisfies AIModelCollection;

export type Models = (typeof OPENAI_MODELS)[number]["model"];
