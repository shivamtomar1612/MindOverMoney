import { NextResponse } from "next/server";
import { z } from "zod";

import { checkChatRateLimit } from "@/lib/ai/chat-rate-limit";
import { generateChatResponse, prepareChatStream } from "@/lib/ai/provider";
import { getAuthenticatedChatClient, getChatProfile, persistChatMessage } from "@/lib/supabase/chat-server";
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
  content: z.string().trim().min(1).max(2_000),
}).strict();

const requestSchema = z.object({
  context: contextSchema,
  question: z.string().trim().min(1).max(1_500).optional(),
  message: z.string().trim().min(1).max(1_500).optional(),
  messages: z.array(messageSchema).max(20).optional(),
  history: z.array(messageSchema).max(20).optional(),
  stream: z.boolean().optional(),
  conversationId: z.string().uuid().optional(),
}).strict().refine((value) => Boolean(value.question || value.message), { message: "A question is required." });

function failure(message = "I couldn't process that request. Please try again.", status = 400, headers?: HeadersInit) {
  return NextResponse.json({ success: false, message, error: message }, { status, headers });
}

function requestIdentifier(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "local";
}

export async function POST(request: Request) {
  const rateLimit = checkChatRateLimit(requestIdentifier(request));
  if (!rateLimit.allowed) {
    return failure("Too many questions were sent at once. Please wait a moment and try again.", 429, { "Retry-After": String(rateLimit.retryAfterSeconds) });
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return failure("Please keep the question and context concise.", 413);

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return failure("Please provide a valid request.");
    }
    const parsed = requestSchema.safeParse(parsedBody);
    if (!parsed.success) return failure("Please provide a valid context and a question.");

    const question = parsed.data.question ?? parsed.data.message ?? "";
    const messages = (parsed.data.messages ?? parsed.data.history ?? []).slice(-10);
    const context = parsed.data.context as ChatRequest["context"];
    if (JSON.stringify(context).length > 8_000) return failure("Please keep the selected context concise.", 413);

    const auth = await getAuthenticatedChatClient(request).catch(() => null);
    const profile = await getChatProfile(auth).catch(() => undefined);
    await persistChatMessage(auth, parsed.data.conversationId, "user", question).catch(() => undefined);

    if (!parsed.data.stream) {
      const result = await generateChatResponse(context, messages, question, profile);
      await persistChatMessage(auth, parsed.data.conversationId, "assistant", result.answer).catch(() => undefined);
      return NextResponse.json({ success: true, message: result.answer, answer: result.answer, provider: result.provider });
    }

    const prepared = await prepareChatStream(context, messages, question, profile, request.signal);
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: Record<string, unknown>) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        let answer = "";
        try {
          send({ type: "meta", provider: prepared.provider });
          for await (const chunk of prepared.stream) {
            if (request.signal.aborted) break;
            answer += chunk;
            send({ type: "delta", content: chunk });
          }
          if (!request.signal.aborted && answer.trim()) {
            await persistChatMessage(auth, parsed.data.conversationId, "assistant", answer).catch(() => undefined);
            send({ type: "done", provider: prepared.provider });
          } else if (!request.signal.aborted) {
            send({ type: "error", message: "Gemini returned an empty response. Please try again." });
          }
        } catch {
          if (!request.signal.aborted) send({ type: "error", message: "Gemini is temporarily unavailable. Please try again." });
        } finally {
          controller.close();
        }
      },
      cancel() {
        // The request AbortSignal is forwarded to the Gemini SDK.
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return failure("I couldn't process that request. Please try again.", 500);
  }
}
