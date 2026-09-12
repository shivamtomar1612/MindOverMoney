"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth, type AuthActionResult, AuthContext } from "@/hooks/use-auth";
import type { AppAuthUser } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const DEMO_ACCOUNT_KEY = "mind-over-money:demo-account";
const DEMO_SESSION_KEY = "mind-over-money:demo-session";

type DemoAccount = { id: string; email: string; password: string; name: string };

function toAppUser(user: User): AppAuthUser {
  return { id: user.id, email: user.email ?? "", name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : undefined };
}

function readDemoAccount(): DemoAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_ACCOUNT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<DemoAccount>;
    return typeof value.id === "string" && typeof value.email === "string" && typeof value.password === "string" && typeof value.name === "string" ? value as DemoAccount : null;
  } catch {
    return null;
  }
}

function readDemoSession(): AppAuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<AppAuthUser>;
    return typeof value.id === "string" && typeof value.email === "string" ? { id: value.id, email: value.email, name: value.name, isDemo: true } : null;
  } catch {
    return null;
  }
}

function saveDemoAccount(account: DemoAccount) {
  window.localStorage.setItem(DEMO_ACCOUNT_KEY, JSON.stringify(account));
}

function saveDemoSession(user: AppAuthUser | null) {
  if (user) window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(DEMO_SESSION_KEY);
  window.dispatchEvent(new Event("mind-over-money:auth-change"));
}

function friendlyAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Authentication is currently unavailable.";
  if (/invalid login credentials/i.test(message)) return "That email or password did not match. Try again or create a demo account.";
  if (/already registered|user already exists/i.test(message)) return "An account with that email already exists. Try logging in.";
  if (/rate limit/i.test(message)) return "Too many attempts. Please wait a moment and try again.";
  return "Authentication is currently unavailable. Demo Mode is still available without Supabase.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoFallback, setDemoFallback] = useState(!isSupabaseConfigured);
  const client = getSupabaseBrowserClient();

  useEffect(() => {
    let active = true;
    const markLoaded = () => setLoading(false);
    const markDemoFallback = () => setDemoFallback(true);
    const syncDemo = () => {
      if (active) setUser(readDemoSession());
    };

    if (!client) {
      if (isSupabaseConfigured) markDemoFallback();
      syncDemo();
      markLoaded();
      window.addEventListener("mind-over-money:auth-change", syncDemo);
      return () => { active = false; window.removeEventListener("mind-over-money:auth-change", syncDemo); };
    }

    void client.auth.getSession().then(({ data }) => {
      if (active) {
        setUser(data.session?.user ? toAppUser(data.session.user) : readDemoSession());
        setLoading(false);
      }
    }).catch(() => {
      if (active) {
        setDemoFallback(true);
        syncDemo();
        setLoading(false);
      }
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => setUser(session?.user ? toAppUser(session.user) : readDemoSession()));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [client]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    const normalizedEmail = email.trim().toLocaleLowerCase("en-IN");
    if (!normalizedEmail || !password) return { error: "Enter your email and password." };
    if (client && !demoFallback) {
      try {
        const { data, error } = await client.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) return { error: friendlyAuthError(error) };
        if (data.user) { setUser(toAppUser(data.user)); return {}; }
      } catch {
        setDemoFallback(true);
      }
    }
    const account = readDemoAccount();
    if (account && account.email === normalizedEmail && account.password === password) {
      const demoUser = { id: account.id, email: account.email, name: account.name, isDemo: true };
      saveDemoSession(demoUser);
      setUser(demoUser);
      return {};
    }
    return { error: "That email or password did not match. Try again or create a demo account." };
  }, [client, demoFallback]);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<AuthActionResult> => {
    const normalizedEmail = email.trim().toLocaleLowerCase("en-IN");
    const normalizedName = name.trim();
    if (!normalizedName || !normalizedEmail || password.length < 6) return { error: "Enter your name, a valid email, and a password with at least 6 characters." };
    if (client && !demoFallback) {
      try {
        const { data, error } = await client.auth.signUp({ email: normalizedEmail, password, options: { data: { name: normalizedName } } });
        if (error) return { error: friendlyAuthError(error) };
        if (data.user && data.session) { setUser(toAppUser(data.user)); return {}; }
        return { message: "Account created. Check your email to confirm your account, then log in." };
      } catch {
        setDemoFallback(true);
      }
    }
    if (readDemoAccount()?.email === normalizedEmail) return { error: "An account with that email already exists. Try logging in." };
    const account = { id: `demo-${Date.now()}`, email: normalizedEmail, password, name: normalizedName };
    saveDemoAccount(account);
    const demoUser = { id: account.id, email: account.email, name: account.name, isDemo: true };
    saveDemoSession(demoUser);
    setUser(demoUser);
    return { message: "Demo account created. Your data will stay on this device." };
  }, [client, demoFallback]);

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    if (client && !demoFallback) {
      try { const { error } = await client.auth.signOut(); if (error) return { error: friendlyAuthError(error) }; } catch { setDemoFallback(true); }
    }
    saveDemoSession(null);
    setUser(null);
    return {};
  }, [client, demoFallback]);

  const value = useMemo(() => ({ user, loading, configured: isSupabaseConfigured, demoMode: !isSupabaseConfigured || demoFallback, signIn, signUp, signOut }), [demoFallback, loading, signIn, signOut, signUp, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthStatusLabel() {
  const { demoMode } = useAuth();
  return <span className="rounded-md border border-warning/20 bg-warning/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-warning">{demoMode ? "Demo Mode" : "Supabase"}</span>;
}
