import { getAsset } from "@/lib/data";
import { getFallbackExplanation } from "@/lib/ai/fallback";
import { explainWithOpenAI, isOpenAIAvailable } from "@/lib/ai/provider";
import type { Asset, ExplainRequest, ExplainResponse } from "@/types";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readRequest(value: unknown): ExplainRequest {
  if (!isRecord(value)) return {};

  return {
    term: typeof value.term === "string" ? value.term.slice(0, 120) : undefined,
    question: typeof value.question === "string" ? value.question.slice(0, 600) : undefined,
    asset: typeof value.asset === "string" || isRecord(value.asset)
      ? (value.asset as string | Partial<Asset>)
      : undefined,
  };
}

function resolveAsset(input: ExplainRequest["asset"]): Asset | undefined {
  if (typeof input === "string") return getAsset(input);
  if (input && typeof input === "object" && typeof input.symbol === "string") return getAsset(input.symbol);
  return undefined;
}

export async function POST(request: Request): Promise<Response> {
  let input: ExplainRequest = {};
  try {
    input = readRequest(await request.json());
  } catch {
    input = {};
  }

  const asset = resolveAsset(input.asset);
  let response: ExplainResponse;

  if (isOpenAIAvailable()) {
    try {
      response = await explainWithOpenAI(input, asset);
    } catch {
      response = getFallbackExplanation(input.term, asset, input.question);
    }
  } else {
    response = getFallbackExplanation(input.term, asset, input.question);
  }

  return Response.json(response);
}
