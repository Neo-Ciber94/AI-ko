import { OpenAI } from "openai";
import { env } from "../env.mjs";

export const openaiInstance = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
