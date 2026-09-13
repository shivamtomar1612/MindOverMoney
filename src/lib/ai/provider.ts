import OpenAI from "openai";

import { buildExplainerPrompt, FINANCIAL_EXPLAINER_INSTRUCTIONS } from "./prompts";
import { chatWithGemini, streamChatWithGemini } from "./gemini";
import { getFallbackChatResponse } from "./chat-fallback";
import { chatWithOpenAI } from "./chat-provider";
import type { Asset } from "../../types/asset.ts";
import type { ExplainRequest, ExplainResponse } from "../../types/ai.ts";
import type { ChatContext, ChatMessage, ChatProfileContext } from "../../types/chat";

export function isOpenAIAvailable(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function parseModelOutput(output: string | undefined): ExplainResponse {
  const cleaned = (output ?? "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  if (!cleaned) throw new Error("OpenAI returned an empty explanation");

  const parsed: unknown = JSON.parse(cleaned);
  if (!parsed || typeof parsed !== "object") throw new Error("OpenAI returned an invalid explanation");

  const candidate = parsed as Record<string, unknown>;
  const fields = ["explanation", "whyItMatters", "assetContext", "beginnerTakeaway"];
  if (!fields.every((field) => typeof candidate[field] === "string" && candidate[field])) {
    throw new Error("OpenAI returned an incomplete explanation");
  }

  return {
    explanation: candidate.explanation as string,
    whyItMatters: candidate.whyItMatters as string,
    assetContext: candidate.assetContext as string,
    beginnerTakeaway: candidate.beginnerTakeaway as string,
  };
}

export async function explainWithOpenAI(
  request: ExplainRequest,
  asset: Asset | null | undefined,
): Promise<ExplainResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OpenAI is not configured");

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
    instructions: FINANCIAL_EXPLAINER_INSTRUCTIONS,
    input: buildExplainerPrompt(request, asset),
    store: false,
  });

  return parseModelOutput(response.output_text);
}

/** Provider-independent chat boundary. Gemini is preferred, then OpenAI, then local fallback. */
export async function generateChatResponse(
  context: ChatContext,
  messages: Array<Pick<ChatMessage, "role" | "content">>,
  question: string,
  profile?: ChatProfileContext,
): Promise<{ answer: string; provider: "gemini" | "openai" | "fallback" }> {
  if (process.env.GEMINI_API_KEY?.trim()) {
    try {
      return { answer: await chatWithGemini(context, messages, question, profile), provider: "gemini" };
    } catch {
      // Continue to the next provider without exposing provider details to users.
    }
  }

  return generateSecondaryChatResponse(context, messages, question, profile);
}

async function generateSecondaryChatResponse(
  context: ChatContext,
  messages: Array<Pick<ChatMessage, "role" | "content">>,
  question: string,
  profile?: ChatProfileContext,
): Promise<{ answer: string; provider: "openai" | "fallback" }> {
  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      return { answer: await chatWithOpenAI(context, messages, question, profile), provider: "openai" };
    } catch {
      // The deterministic fallback keeps demo mode reliable during API failures.
    }
  }

  return { answer: getFallbackChatResponse(context, question, messages), provider: "fallback" };
}

async function* singleChunk(value: string): AsyncGenerator<string> {
  yield value;
}

export async function prepareChatStream(
  context: ChatContext,
  messages: Array<Pick<ChatMessage, "role" | "content">>,
  question: string,
  profile?: ChatProfileContext,
  abortSignal?: AbortSignal,
): Promise<{ provider: "gemini" | "openai" | "fallback"; stream: AsyncGenerator<string> }> {
  if (process.env.GEMINI_API_KEY?.trim()) {
    try {
      const source = await streamChatWithGemini(context, messages, question, profile, abortSignal);
      const first = await source.next();
      if (!first.done && first.value) {
        async function* withFirst(): AsyncGenerator<string> {
          yield first.value;
          yield* source;
        }
        return { provider: "gemini", stream: withFirst() };
      }
    } catch {
      // Fall through before any streamed content reaches the browser.
    }
  }

  const response = await generateSecondaryChatResponse(context, messages, question, profile);
  return { provider: response.provider, stream: singleChunk(response.answer) };
}
