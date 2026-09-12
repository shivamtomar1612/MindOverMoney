"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { addPortfolioHolding, calculatePortfolio, createEmptyPortfolio, removePortfolioHolding } from "@/lib/calculations/portfolio";
import { PAPER_PORTFOLIO_EVENT, readPaperPortfolio, subscribeToPaperPortfolio, writePaperPortfolio } from "@/lib/portfolio/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Asset, PaperPortfolioState, PortfolioSummary } from "@/types";

type RemotePortfolioRow = { id: string; starting_balance: number };
type RemoteTransactionRow = { symbol: string; amount: number; transaction_type: "ADD" | "REMOVE" };

export function usePaperPortfolio(assets: Asset[]): {
  state: PaperPortfolioState;
  summary: PortfolioSummary;
  add: (symbol: string, amount: number) => string | null;
  remove: (symbol: string) => void;
  loading: boolean;
} {
  const { user, loading: authLoading, demoMode } = useAuth();
  const client = getSupabaseBrowserClient();
  const [state, setState] = useState<PaperPortfolioState>(createEmptyPortfolio);
  const [loading, setLoading] = useState(true);
  const useRemote = Boolean(client && isSupabaseConfigured && !demoMode && user && !user.isDemo);

  useEffect(() => {
    let active = true;
    const markLoaded = () => setLoading(false);
    const syncLocal = () => { if (active) setState(readPaperPortfolio()); };
    if (authLoading) return () => { active = false; };
    if (!useRemote || !client || !user) {
      syncLocal();
      markLoaded();
      return subscribeToPaperPortfolio(syncLocal);
    }
    void Promise.resolve(client.from("paper_portfolios").select("id,starting_balance").eq("user_id", user.id).maybeSingle()).then(async ({ data, error }) => {
      if (!active) return;
      if (error || !data) { setState(createEmptyPortfolio()); setLoading(false); return; }
      const portfolio = data as RemotePortfolioRow;
      const transactions = await client.from("portfolio_transactions").select("symbol,amount,transaction_type").eq("portfolio_id", portfolio.id).order("created_at", { ascending: true });
      if (!active) return;
      const totals = new Map<string, number>();
      for (const transaction of (transactions.data ?? []) as RemoteTransactionRow[]) {
        const symbol = transaction.symbol.toUpperCase();
        const amount = transaction.transaction_type === "REMOVE" ? -Number(transaction.amount) : Number(transaction.amount);
        totals.set(symbol, (totals.get(symbol) ?? 0) + amount);
      }
      setState({ startingBalance: Number(portfolio.starting_balance) || 100000, holdings: [...totals.entries()].filter(([, amount]) => amount > 0).map(([symbol, amountInvested]) => ({ symbol, amountInvested })) });
      setLoading(false);
    }).catch(() => { if (active) { setState(readPaperPortfolio()); setLoading(false); } });
    return () => { active = false; };
  }, [authLoading, client, useRemote, user]);

  const persistRemote = useCallback(async (nextState: PaperPortfolioState, transaction?: { symbol: string; amount: number; type: "ADD" | "REMOVE" }) => {
    if (!client || !user || !useRemote) { writePaperPortfolio(nextState); return; }
    const { data: portfolio, error: portfolioError } = await client.from("paper_portfolios").upsert({ user_id: user.id, starting_balance: nextState.startingBalance }, { onConflict: "user_id" }).select("id").single();
    if (portfolioError || !portfolio) throw portfolioError ?? new Error("Could not save paper portfolio");
    if (transaction) {
      const { error: transactionError } = await client.from("portfolio_transactions").insert({ portfolio_id: portfolio.id, user_id: user.id, symbol: transaction.symbol.toUpperCase(), amount: transaction.amount, transaction_type: transaction.type });
      if (transactionError) throw transactionError;
    }
  }, [client, useRemote, user]);

  const add = useCallback((symbol: string, amount: number) => {
    if (!assets.some((asset) => asset.symbol === symbol.toUpperCase())) return "Choose an asset from the demo catalog.";
    const result = addPortfolioHolding(state, symbol, amount);
    if (result.error) return result.error;
    setState(result.state);
    if (useRemote) void persistRemote(result.state, { symbol, amount, type: "ADD" }).catch(() => writePaperPortfolio(result.state));
    else writePaperPortfolio(result.state);
    return null;
  }, [assets, persistRemote, state, useRemote]);

  const remove = useCallback((symbol: string) => {
    const existing = state.holdings.find((holding) => holding.symbol === symbol.toUpperCase());
    if (!existing) return;
    const nextState = removePortfolioHolding(state, symbol);
    setState(nextState);
    if (useRemote) void persistRemote(nextState, { symbol, amount: existing.amountInvested, type: "REMOVE" }).catch(() => writePaperPortfolio(nextState));
    else writePaperPortfolio(nextState);
  }, [persistRemote, state, useRemote]);

  const summary = useMemo(() => calculatePortfolio(state, assets), [assets, state]);
  return { state, summary, add, remove, loading };
}

export { PAPER_PORTFOLIO_EVENT };
