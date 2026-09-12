"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Loader2, RefreshCw, Send, X } from "lucide-react";

import { ChatbotContextBadge } from "@/components/ai/ChatbotContextBadge";
import { SuggestedQuestions } from "@/components/ai/SuggestedQuestions";
import { Button } from "@/components/ui/button";
import { useFinancialChatbot } from "@/hooks/useFinancialChatbot";
import { getAllAssets } from "@/lib/data/demo-data";
import type { ChatContext } from "@/types/chat";

function presetContexts(): ChatContext[] {
  const allAssets = getAllAssets();
  const zomato = allAssets.find((asset) => asset.symbol === "ZOMATO");
  const assets = allAssets.filter((asset) => ["ZOMATO", "TATAMOTORS", "TCS", "ITC"].includes(asset.symbol)).map((asset) => ({ type: "asset" as const, title: `${asset.symbol} overview`, description: "A beginner-friendly overview of the selected demo asset.", asset: { symbol: asset.symbol, name: asset.name }, data: { price: asset.price, sector: asset.sector, fundamentalScore: asset.fundamentalScore, riskScore: asset.riskScore }, userLevel: "Beginner" as const }));
  return [
    { type: "lesson", title: "P/E Ratio", description: "A valuation measure comparing share price with earnings per share.", userLevel: "Beginner" },
    { type: "metric", title: "Risk Score", metric: { name: "Risk Score", value: zomato ? 78 : "not provided" }, data: { riskScore: zomato ? 78 : undefined }, asset: zomato ? { symbol: zomato.symbol, name: zomato.name } : undefined, userLevel: "Beginner" },
    { type: "hype", title: "Hype Check", description: "A comparison of demo attention proxy, fundamentals, risk and valuation.", asset: zomato ? { symbol: zomato.symbol, name: zomato.name } : undefined, data: zomato ? { hypeScore: zomato.hypeScore, fundamentalScore: zomato.fundamentalScore, riskScore: zomato.riskScore, valuationScore: zomato.valuationScore } : undefined, userLevel: "Beginner" },
    { type: "report", title: "Cash Flow", description: "Operating cash flow in the selected financial report.", data: { section: "Cash Flow", operatingCashFlowGrowth: 9.3 }, userLevel: "Beginner" },
    { type: "simulator", title: "Risk Tolerance", description: "How much volatility a person can tolerate while following an investment plan.", userLevel: "Beginner" },
    ...assets,
  ];
}

export function ChatbotPanel() {
  const { context, isOpen, messages, isLoading, error, closeFinancialChatbot, changeContext, sendMessage, retryLastMessage } = useFinancialChatbot();
  const [question, setQuestion] = useState("");
  const [showContexts, setShowContexts] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const contexts = useMemo(() => presetContexts(), []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, isLoading]);
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && closeFinancialChatbot();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeFinancialChatbot, isOpen]);
  if (!isOpen || !context) return null;

  async function submit(event: FormEvent) { event.preventDefault(); if (!question.trim() || isLoading) return; const current = question; setQuestion(""); await sendMessage(current); }
  const heading = context.metric ? `Understanding ${context.metric.name}` : `Understanding ${context.title}`;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-foreground/20" onMouseDown={(event) => event.target === event.currentTarget && closeFinancialChatbot()}>
      <aside role="dialog" aria-modal="true" aria-label="Mind Over Money AI" className="flex h-full w-full flex-col border-l border-border bg-surface shadow-[0_0_32px_rgba(24,33,28,.14)] sm:max-w-[420px]">
        <header className="border-b border-border px-5 py-4 sm:px-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Mind Over Money AI</p><h2 className="mt-1 truncate text-lg font-semibold">{heading}</h2><div className="mt-1"><ChatbotContextBadge context={context} /></div></div><Button ref={closeRef} variant="ghost" size="icon" onClick={() => { setShowContexts(false); closeFinancialChatbot(); }} aria-label="Close contextual assistant"><X aria-hidden="true" /></Button></div><div className="mt-4 flex items-center justify-between gap-3"><button type="button" onClick={() => setShowContexts((open) => !open)} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">Change context<ChevronDown className={`size-3.5 transition-transform ${showContexts ? "rotate-180" : ""}`} aria-hidden="true" /></button><span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Educational only</span></div>{showContexts && <div className="mt-3 divide-y divide-border border-y border-border">{contexts.map((item) => <button key={`${item.type}-${item.title}`} type="button" onClick={() => { changeContext(item); setShowContexts(false); }} className="flex w-full items-center justify-between gap-4 px-2 py-2.5 text-left text-sm hover:bg-surface-muted"><span>{item.title}</span><ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" /></button>)}</div>}</header>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          {messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[91%] px-3.5 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-lg bg-foreground text-white" : "border-l-2 border-primary bg-surface-muted"}`}><p className="whitespace-pre-wrap">{message.content}</p></div></div>)}
          {isLoading && <div className="flex justify-start"><div className="flex items-center gap-2 border-l-2 border-primary bg-surface-muted px-3.5 py-3 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />Preparing an explanation…</div></div>}
          {error && <div className="border border-danger/20 bg-danger/5 p-4 text-sm text-danger" role="alert"><p>Unable to load this explanation.</p><button type="button" onClick={() => void retryLastMessage()} className="mt-3 inline-flex items-center gap-2 font-medium hover:underline"><RefreshCw className="size-3.5" aria-hidden="true" />Retry</button></div>}
          {messages.length <= 1 && !isLoading && <div className="pt-2"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Suggested questions</p><SuggestedQuestions context={context} onSelect={(value) => void sendMessage(value)} disabled={isLoading} /></div>}
        </div>

        <footer className="border-t border-border px-5 pb-5 pt-4 sm:px-6">{messages.length > 1 && <div className="mb-3"><SuggestedQuestions context={context} onSelect={(value) => void sendMessage(value)} disabled={isLoading} /></div>}<form onSubmit={submit} className="flex items-end gap-2 rounded-lg border border-input bg-background p-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-ring/20"><label className="sr-only" htmlFor="financial-chat-question">Ask anything about {context.title}</label><textarea id="financial-chat-question" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(event); } }} rows={1} placeholder={`Ask about ${context.title}…`} className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground" /><Button type="submit" size="icon" disabled={!question.trim() || isLoading} aria-label="Send message"><Send aria-hidden="true" /></Button></form><p className="mt-2 text-center text-[10px] leading-4 text-muted-foreground">Demo data is not live. No definitive buy or sell instructions.</p></footer>
      </aside>
    </div>
  );
}
