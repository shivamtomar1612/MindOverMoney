"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabaseConfig } from "./config";

let browserClient: SupabaseClient | null = null;

/** Returns a browser client only when both public Supabase variables exist. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured || !supabaseConfig.url || !supabaseConfig.anonKey) return null;
  if (!browserClient) {
    try {
      browserClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    } catch {
      return null;
    }
  }
  return browserClient;
}
