import { GoogleGenAI } from "@google/genai";

import type { ChatContext, ChatMessage, ChatProfileContext } from "@/types/chat";
import { buildChatContext } from "./build-chat-context";
import { buildChatSystemInstruction, buildGeminiChatPrompt } from "./chat-prompt";
import { getGeminiModel, isGeminiAvailable } from "./gemini-status";

const GEMINI_TIMEOUT_MS = 12_000;

function ensureContextMention(answer: string, context: ChatContext): string {
  const asset = context.asset?.name?.replace(/\s+Ltd\.$/, "");
  const metric = context.metric?.name;
  const value = context.metric?.value;
  if (!asset && !metric) return answer;

  const haystack = answer.toLocaleLowerCase("en-IN");
  const hasAsset = !asset || haystack.includes(asset.toLocaleLowerCase("en-IN")) || haystack.includes(context.asset?.symbol.toLocaleLowerCase("en-IN") ?? "");
  const hasMetric = !metric || haystack.includes(metric.toLocaleLowerCase("en-IN"));
  if (hasAsset && hasMetric) return answer;

  const contextLine = [asset, metric, value !== undefined ? String(value) : undefined].filter(Boolean).join(" · ");
  return `In this context: ${contextLine} (demo data, not live).\n\n${answer}`;
}

export async function chatWithGemini(
  context: ChatContext,
  messages: Array<Pick<ChatMessage, "role" | "content">>,
  question: string,
  profile?: ChatProfileContext,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || !isGeminiAvailable()) throw new Error("Gemini is not configured");

  const ai = new GoogleGenAI({ apiKey });
  const request = ai.models.generateContent({
    model: getGeminiModel(),
    contents: buildGeminiChatPrompt(buildChatContext(context, profile, question, messages), messages, question),
    config: {
      systemInstruction: buildChatSystemInstruction(context),
      temperature: 0.2,
      maxOutputTokens: 900,
    },
  });

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Gemini request timed out")), GEMINI_TIMEOUT_MS);
  });
  const response = await Promise.race([request, timeout]);
  // The SDK normally exposes `response.text`; the candidate fallback keeps us
  // compatible with responses where the convenience getter is undefined.
  const candidateText = response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .filter(Boolean)
    .join("\n");
  const text = (response.text ?? candidateText)?.trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return ensureContextMention(text, context);
}

function responseText(response: { text?: string; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }): string {
  return (response.text ?? response.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").filter(Boolean).join("\n") ?? "").trim();
}

export async function streamChatWithGemini(
  context: ChatContext,
  messages: Array<Pick<ChatMessage, "role" | "content">>,
  question: string,
  profile?: ChatProfileContext,
  abortSignal?: AbortSignal,
): Promise<AsyncGenerator<string>> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || !isGeminiAvailable()) throw new Error("Gemini is not configured");

  const ai = new GoogleGenAI({ apiKey });
  const source = await ai.models.generateContentStream({
    model: getGeminiModel(),
    contents: buildGeminiChatPrompt(buildChatContext(context, profile, question, messages), messages, question),
    config: {
      systemInstruction: buildChatSystemInstruction(context),
      temperature: 0.2,
      maxOutputTokens: 1_100,
      abortSignal,
      httpOptions: { timeout: 20_000 },
    },
  });

  async function* textStream(): AsyncGenerator<string> {
    let emitted = false;
    for await (const response of source) {
      if (abortSignal?.aborted) return;
      const text = responseText(response);
      if (!text) continue;
      emitted = true;
      yield text;
    }
    if (!emitted) throw new Error("Gemini returned an empty response");
  }

  return textStream();
}
