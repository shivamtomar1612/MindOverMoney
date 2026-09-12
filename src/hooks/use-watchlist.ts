"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const STORAGE_KEY = "mind-over-money:watchlist";
const WATCHLIST_EVENT = "mind-over-money:watchlist-change";

function readLocalWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? [...new Set(parsedValue.filter((value): value is string => typeof value === "string").map((value) => value.toUpperCase()))] : [];
  } catch {
    return [];
  }
}

function saveLocalWatchlist(symbols: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
  window.dispatchEvent(new Event(WATCHLIST_EVENT));
}

export function useWatchlist() {
  const { user, loading: authLoading, demoMode } = useAuth();
  const client = getSupabaseBrowserClient();
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const useRemote = useMemo(() => Boolean(client && isSupabaseConfigured && !demoMode && user && !user.isDemo), [client, demoMode, user]);

  useEffect(() => {
    let active = true;
    const markLoaded = () => setLoading(false);
    const syncLocal = () => { if (active) setSymbols(readLocalWatchlist()); };
    if (authLoading) return () => { active = false; };
    if (!useRemote || !client || !user) {
      syncLocal();
      markLoaded();
      window.addEventListener("storage", syncLocal);
      window.addEventListener(WATCHLIST_EVENT, syncLocal);
      return () => { active = false; window.removeEventListener("storage", syncLocal); window.removeEventListener(WATCHLIST_EVENT, syncLocal); };
    }
    void Promise.resolve(client.from("watchlists").select("symbol").eq("user_id", user.id)).then(({ data, error }) => {
      if (!active) return;
      if (error) setSymbols(readLocalWatchlist());
      else setSymbols((data ?? []).map((row) => String(row.symbol).toUpperCase()));
      setLoading(false);
    }).catch(() => { if (active) { setSymbols(readLocalWatchlist()); setLoading(false); } });
    return () => { active = false; };
  }, [authLoading, client, useRemote, user]);

  const persistRemote = useCallback(async (nextSymbols: string[]) => {
    if (!client || !user || !useRemote) { saveLocalWatchlist(nextSymbols); return; }
    const { data: existing } = await client.from("watchlists").select("symbol").eq("user_id", user.id);
    const remoteSymbols = (existing ?? []).map((row) => String(row.symbol).toUpperCase());
    const toAdd = nextSymbols.filter((symbol) => !remoteSymbols.includes(symbol));
    const toRemove = remoteSymbols.filter((symbol) => !nextSymbols.includes(symbol));
    if (toAdd.length) {
      const { error } = await client.from("watchlists").upsert(toAdd.map((symbol) => ({ user_id: user.id, symbol })), { onConflict: "user_id,symbol" });
      if (error) throw error;
    }
    if (toRemove.length) {
      const { error } = await client.from("watchlists").delete().eq("user_id", user.id).in("symbol", toRemove);
      if (error) throw error;
    }
  }, [client, useRemote, user]);

  const update = useCallback((nextSymbols: string[]) => {
    setSymbols(nextSymbols);
    if (useRemote) void persistRemote(nextSymbols).catch(() => saveLocalWatchlist(nextSymbols));
    else saveLocalWatchlist(nextSymbols);
  }, [persistRemote, useRemote]);

  const isWatched = useCallback((symbol: string) => symbols.includes(symbol.toUpperCase()), [symbols]);
  const add = useCallback((symbol: string) => { const normalized = symbol.toUpperCase(); if (!symbols.includes(normalized)) update([...symbols, normalized]); }, [symbols, update]);
  const remove = useCallback((symbol: string) => update(symbols.filter((item) => item !== symbol.toUpperCase())), [symbols, update]);
  const toggle = useCallback((symbol: string) => { const normalized = symbol.toUpperCase(); update(symbols.includes(normalized) ? symbols.filter((item) => item !== normalized) : [...symbols, normalized]); }, [symbols, update]);

  return { symbols, isWatched, add, remove, toggle, loading };
}
