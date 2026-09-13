import OpenAI from "openai";

import type { ChatContext, ChatMessage, ChatProfileContext } from "../../types/chat";
import { buildChatPrompt, CHAT_SYSTEM_PROMPT } from "./chat-prompts";

export function isChatOpenAIAvailable(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function chatWithOpenAI(
  context: ChatContext,
  messages: Array<Pick<ChatMessage, "role" | "content">>,
  question: string,
  profile?: ChatProfileContext,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OpenAI is not configured");

  const client = new OpenAI({ apiKey, timeout: 12_000, maxRetries: 0 });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
    instructions: CHAT_SYSTEM_PROMPT,
    input: buildChatPrompt(context, messages, question, profile),
    store: false,
  });
  const answer = response.output_text.trim();
  if (!answer) throw new Error("OpenAI returned an empty response");
  return answer;
}
