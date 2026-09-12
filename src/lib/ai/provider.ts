import OpenAI from "openai";

import { buildExplainerPrompt, FINANCIAL_EXPLAINER_INSTRUCTIONS } from "./prompts";
import { chatWithGemini } from "./gemini";
import { getFallbackChatResponse } from "./chat-fallback";
import { chatWithOpenAI } from "./chat-provider";
import type { Asset } from "../../types/asset.ts";
import type { ExplainRequest, ExplainResponse } from "../../types/ai.ts";
import type { ChatContext, ChatMessage } from "../../types/chat";

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
): Promise<{ answer: string; provider: "gemini" | "openai" | "fallback" }> {
  if (process.env.GEMINI_API_KEY?.trim()) {
    try {
      return { answer: await chatWithGemini(context, messages, question), provider: "gemini" };
    } catch {
      // Continue to the next provider without exposing provider details to users.
    }
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      return { answer: await chatWithOpenAI(context, messages, question), provider: "openai" };
    } catch {
      // The deterministic fallback keeps demo mode reliable during API failures.
    }
  }

  return { answer: getFallbackChatResponse(context, question), provider: "fallback" };
}
