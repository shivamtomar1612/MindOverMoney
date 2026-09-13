import { createClient as createSupabaseClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { isSupabaseConfigured, supabaseConfig } from "./config";
import type { ChatProfileContext } from "@/types/chat";

export type AuthenticatedChatClient = { client: SupabaseClient; user: User };

export async function getAuthenticatedChatClient(request: Request): Promise<AuthenticatedChatClient | null> {
  if (!isSupabaseConfigured || !supabaseConfig.url || !supabaseConfig.anonKey) return null;

  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (token) {
    const client = createSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await client.auth.getUser(token);
    return error || !data.user ? null : { client, user: data.user };
  }

  const cookieStore = await cookies();
  const client = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Route handlers can refresh cookies; read-only server contexts cannot.
        }
      },
    },
  });
  const { data, error } = await client.auth.getUser();
  return error || !data.user ? null : { client, user: data.user };
}

export async function getChatProfile(auth: AuthenticatedChatClient | null): Promise<ChatProfileContext | undefined> {
  if (!auth) return undefined;
  const { data, error } = await auth.client
    .from("profiles")
    .select("experience,risk_tolerance,risk_score,investment_horizon,goal")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error || !data) return undefined;
  return {
    experience: typeof data.experience === "string" ? data.experience : undefined,
    riskTolerance: typeof data.risk_tolerance === "string" ? data.risk_tolerance : undefined,
    riskScore: typeof data.risk_score === "number" ? data.risk_score : undefined,
    investmentHorizon: typeof data.investment_horizon === "string" ? data.investment_horizon : undefined,
    goal: typeof data.goal === "string" ? data.goal : undefined,
  };
}

export async function persistChatMessage(
  auth: AuthenticatedChatClient | null,
  conversationId: string | undefined,
  role: "user" | "assistant",
  content: string,
): Promise<void> {
  if (!auth || !conversationId || !content.trim()) return;
  const { error } = await auth.client.from("chat_messages").insert({
    conversation_id: conversationId,
    user_id: auth.user.id,
    role,
    content: content.slice(0, 12_000),
  });
  if (error) return;
  await auth.client.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
}
