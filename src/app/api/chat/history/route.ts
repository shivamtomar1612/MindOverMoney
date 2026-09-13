import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedChatClient } from "@/lib/supabase/chat-server";

export const runtime = "nodejs";

const contextSchema = z.object({
  type: z.enum(["lesson", "metric", "asset", "report", "hype", "simulator"]),
  title: z.string().trim().min(1).max(160),
  description: z.string().max(2_000).optional(),
  asset: z.object({ symbol: z.string().trim().min(1).max(20), name: z.string().trim().min(1).max(160) }).optional(),
  metric: z.object({ name: z.string().trim().min(1).max(100), value: z.union([z.number().finite(), z.string().max(120)]) }).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  userLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
}).strict();

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), title: z.string().trim().min(1).max(80), context: contextSchema }).strict(),
  z.object({ action: z.literal("delete"), conversationId: z.string().uuid() }).strict(),
]);

export async function GET(request: Request) {
  const auth = await getAuthenticatedChatClient(request);
  if (!auth) return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });

  const { data: conversation, error } = await auth.client
    .from("chat_conversations")
    .select("id,title,context,created_at,updated_at")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ success: false, message: "Conversation history is unavailable." }, { status: 503 });
  if (!conversation) return NextResponse.json({ success: true, conversation: null, messages: [] });

  const { data: messages, error: messageError } = await auth.client
    .from("chat_messages")
    .select("id,role,content,created_at")
    .eq("conversation_id", conversation.id)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: true })
    .limit(100);
  if (messageError) return NextResponse.json({ success: false, message: "Conversation history is unavailable." }, { status: 503 });

  return NextResponse.json({ success: true, conversation, messages: messages ?? [] });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedChatClient(request);
  if (!auth) return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success || JSON.stringify(body).length > 10_000) {
    return NextResponse.json({ success: false, message: "Invalid conversation request." }, { status: 400 });
  }

  if (parsed.data.action === "delete") {
    const { error } = await auth.client
      .from("chat_conversations")
      .delete()
      .eq("id", parsed.data.conversationId)
      .eq("user_id", auth.user.id);
    return error
      ? NextResponse.json({ success: false, message: "Conversation could not be cleared." }, { status: 503 })
      : NextResponse.json({ success: true });
  }

  const { data, error } = await auth.client
    .from("chat_conversations")
    .insert({ user_id: auth.user.id, title: parsed.data.title, context: parsed.data.context })
    .select("id,title,context,created_at,updated_at")
    .single();
  return error || !data
    ? NextResponse.json({ success: false, message: "Conversation could not be saved." }, { status: 503 })
    : NextResponse.json({ success: true, conversation: data });
}
