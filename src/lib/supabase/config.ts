export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  // Supabase now recommends publishable keys; keep the anon-key fallback for existing deployments.
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey,
);

export const publicRuntimeConfig = {
  supabaseConfigured: isSupabaseConfigured,
};
