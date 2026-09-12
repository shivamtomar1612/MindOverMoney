import { NextResponse } from "next/server";
import { z } from "zod";

import { generateChatResponse } from "@/lib/ai/provider";
import type { ChatRequest } from "@/types/chat";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 24_000;

const contextSchema = z.object({
  type: z.enum(["lesson", "metric", "asset", "report", "hype", "simulator"]),
  title: z.string().trim().min(1).max(160),
  description: z.string().max(2_000).optional(),
  asset: z.object({ symbol: z.string().trim().min(1).max(20), name: z.string().trim().min(1).max(160) }).optional(),
  metric: z.object({ name: z.string().trim().min(1).max(100), value: z.union([z.number().finite(), z.string().max(120)]) }).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  userLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
}).strict();

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_200),
}).strict();

const requestSchema = z.object({
  context: contextSchema,
  question: z.string().trim().min(1).max(1_200).optional(),
  message: z.string().trim().min(1).max(1_200).optional(),
  messages: z.array(messageSchema).max(20).optional(),
  history: z.array(messageSchema).max(20).optional(),
}).strict().refine((value) => Boolean(value.question || value.message), { message: "A question is required." });

function failure(message = "I couldn't generate an explanation right now. Please try again.", status = 400) {
  return NextResponse.json({ success: false, message, error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return failure("Please keep the question and context concise.");

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return failure("Please provide a valid JSON request.");
    }
    const parsed = requestSchema.safeParse(parsedBody);
    if (!parsed.success) return failure("Please provide a context and question.");

    const question = parsed.data.question ?? parsed.data.message ?? "";
    const messages = (parsed.data.messages ?? parsed.data.history ?? []).slice(-10);
    const context = parsed.data.context;
    if (JSON.stringify(context).length > 8_000) return failure("Please keep the selected context concise.");

    const result = await generateChatResponse(context as ChatRequest["context"], messages, question);
    return NextResponse.json({ success: true, message: result.answer, answer: result.answer });
  } catch {
    return NextResponse.json({
      success: false,
      message: "I couldn't generate an explanation right now. Please try again.",
      error: "I couldn't generate an explanation right now. Please try again.",
    }, { status: 500 });
  }
}
