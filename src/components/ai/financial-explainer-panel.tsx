"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Asset, ExplainResponse } from "@/types";

const suggestions = ["What is P/E?", "What does beta mean?", "Why is this stock risky?", "Explain this company like I'm new to investing.", "Why is the fundamental score low?"];
const sections: Array<{ key: keyof ExplainResponse; label: string }> = [{ key: "explanation", label: "What it means" }, { key: "whyItMatters", label: "Why it matters" }, { key: "assetContext", label: "For this asset" }, { key: "beginnerTakeaway", label: "Beginner takeaway" }];

function isExplainResponse(value: unknown): value is ExplainResponse { if (!value || typeof value !== "object") return false; const candidate = value as Record<string, unknown>; return sections.every(({ key }) => typeof candidate[key] === "string"); }

export function FinancialExplainerPanel({ asset }: { asset: Asset }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<ExplainResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function askQuestion(event?: FormEvent<HTMLFormElement>, suggested?: string) {
    event?.preventDefault(); const prompt = (suggested ?? question).trim(); if (!prompt || isLoading) return;
    setQuestion(prompt); setIsLoading(true);
    try { const response = await fetch("/api/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: prompt, asset: asset.symbol }) }); const payload: unknown = await response.json(); if (!response.ok || !isExplainResponse(payload)) throw new Error(); setAnswer(payload); }
    catch { const fallback = "AI analysis is currently unavailable. Try one of the predefined metric explanations."; setAnswer({ explanation: fallback, whyItMatters: fallback, assetContext: fallback, beginnerTakeaway: fallback }); }
    finally { setIsLoading(false); }
  }

  return <section className="mt-12 border-t border-border pt-8" aria-labelledby="ai-explainer-heading"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Financial explainer</p><h2 id="ai-explainer-heading" className="mt-2 text-2xl font-semibold">Ask a question in plain English</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Uses the existing server-side AI provider when configured and the offline lesson fallback otherwise.</p></div><div className="mt-6 grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><form onSubmit={(event) => void askQuestion(event)}><label htmlFor="financial-question" className="text-sm font-medium">Question about {asset.symbol}</label><textarea id="financial-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about a metric, score, or risk factor" rows={4} className="mt-2 w-full resize-none rounded-lg border border-input bg-surface p-3 text-sm leading-6 outline-none focus:border-accent focus:ring-2 focus:ring-ring/20" /><Button type="submit" className="mt-3" disabled={!question.trim() || isLoading}><Send aria-hidden="true" />{isLoading ? "Explaining…" : "Explain this"}</Button></form><p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Suggested</p><div className="mt-3 flex flex-wrap gap-2">{suggestions.map((item) => <button key={item} type="button" disabled={isLoading} onClick={() => void askQuestion(undefined, item)} className="rounded-md border border-border bg-surface px-2.5 py-2 text-left text-xs text-muted-foreground hover:text-foreground">{item}</button>)}</div></div><article className="border-l-0 border-border lg:border-l lg:pl-8" aria-live="polite">{isLoading ? <div><Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" /><p className="mt-3 text-sm text-muted-foreground">Preparing a concise explanation…</p></div> : answer ? <div className="divide-y divide-border">{sections.map(({ key, label }) => <section key={key} className="py-4 first:pt-0"><h3 className="text-sm font-semibold">{label}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{answer[key]}</p></section>)}</div> : <div className="border-y border-border py-8"><p className="text-sm font-medium">Your explanation will appear here.</p><p className="mt-2 text-sm text-muted-foreground">Start with a suggested question or ask what a number means for {asset.symbol}.</p></div>}</article></div><p className="mt-6 text-xs text-muted-foreground">Educational decision-support only. Explanations are not personalized financial advice or trade instructions.</p></section>;
}
