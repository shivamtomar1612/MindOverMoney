"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, CircleStop, RefreshCw, Send, SquarePen, Trash2, X } from "lucide-react";

import { ChatMessage } from "@/components/ai/ChatMessage";
import { ChatbotContextBadge } from "@/components/ai/ChatbotContextBadge";
import { SuggestedQuestions, getSuggestedQuestions } from "@/components/ai/SuggestedQuestions";
import { Button } from "@/components/ui/button";
import { useFinancialChatbot } from "@/hooks/useFinancialChatbot";
import { getAllAssets } from "@/lib/data/demo-data";
import type { ChatContext } from "@/types/chat";

function presetContexts(): ChatContext[] {
  const allAssets = getAllAssets();
  const zomato = allAssets.find((asset) => asset.symbol === "ZOMATO");
  const assets = allAssets.filter((asset) => ["ZOMATO", "TATAMOTORS", "TCS", "ITC"].includes(asset.symbol)).map((asset) => ({
    type: "asset" as const,
    title: `${asset.symbol} overview`,
    description: "A beginner-friendly overview of the selected demo asset.",
    asset: { symbol: asset.symbol, name: asset.name },
    data: { price: asset.price, sector: asset.sector, fundamentalScore: asset.fundamentalScore, riskScore: asset.riskScore },
    userLevel: "Beginner" as const,
  }));
  return [
    { type: "lesson", title: "P/E Ratio", description: "A valuation measure comparing share price with earnings per share.", userLevel: "Beginner" },
    { type: "metric", title: "Risk Score", metric: { name: "Risk Score", value: zomato?.riskScore ?? "not provided" }, data: { riskScore: zomato?.riskScore }, asset: zomato ? { symbol: zomato.symbol, name: zomato.name } : undefined, userLevel: "Beginner" },
    { type: "hype", title: "Hype Check", description: "A comparison of demo attention proxy, fundamentals, risk and valuation.", asset: zomato ? { symbol: zomato.symbol, name: zomato.name } : undefined, data: zomato ? { hypeScore: zomato.hypeScore, fundamentalScore: zomato.fundamentalScore, riskScore: zomato.riskScore, valuationScore: zomato.valuationScore } : undefined, userLevel: "Beginner" },
    { type: "report", title: "Cash Flow", description: "Operating cash flow in the selected financial report.", data: { section: "Cash Flow", operatingCashFlowGrowth: 9.3 }, userLevel: "Beginner" },
    { type: "simulator", title: "Risk Tolerance", description: "How much volatility a person can tolerate while following an investment plan.", userLevel: "Beginner" },
    ...assets,
  ];
}

const welcomePrompts = [
  "Explain P/E ratio in simple terms",
  "Which metric should a beginner look at first?",
  "How should I think about investment risk?",
  "What is the difference between hype and fundamentals?",
];

export function ChatbotPanel() {
  const {
    context, title, provider, isOpen, messages, isLoading, error,
    closeFinancialChatbot, changeContext, sendMessage, retryLastMessage,
    regenerateLastMessage, newChat, clearConversation, stopGeneration,
  } = useFinancialChatbot();
  const [question, setQuestion] = useState("");
  const [showContexts, setShowContexts] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const contexts = useMemo(() => presetContexts(), []);
  const lastAssistantId = [...messages].reverse().find((message) => message.role === "assistant")?.id;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: messages.some((message) => message.status === "streaming") ? "auto" : "smooth" });
  }, [messages]);
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && closeFinancialChatbot();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeFinancialChatbot, isOpen]);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 144)}px`;
  }, [question]);

  if (!isOpen || !context) return null;

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!question.trim() || isLoading) return;
    const current = question;
    setQuestion("");
    await sendMessage(current);
  }

  async function copyMessage(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => current === id ? null : current), 1_600);
    } catch {
      setCopiedId(null);
    }
  }

  const heading = context.metric ? `Understanding ${context.metric.name}` : title ?? `Understanding ${context.title}`;
  const providerLabel = provider === "gemini" ? "Gemini powered" : provider === "openai" ? "AI assistant" : provider === "fallback" ? "Offline guidance" : "Gemini powered";
  const suggestions = [...new Set([...getSuggestedQuestions(context), ...welcomePrompts])].slice(0, 5);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-foreground/20 backdrop-blur-[1px]" onMouseDown={(event) => event.target === event.currentTarget && closeFinancialChatbot()}>
      <aside role="dialog" aria-modal="true" aria-label="Mind Over Money AI" className="flex h-[100dvh] w-full flex-col border-l border-border bg-surface shadow-[0_0_28px_rgba(24,33,28,.12)] sm:max-w-[480px]">
        <header className="shrink-0 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2"><span className="text-sm font-semibold">Mind Over Money AI</span><span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground"><span className="size-1.5 rounded-full bg-success" aria-hidden="true" />{providerLabel}</span></div>
              <h2 className="mt-1 truncate text-base font-semibold">{heading}</h2>
              <div className="mt-0.5"><ChatbotContextBadge context={context} /></div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button type="button" variant="ghost" size="icon-sm" onClick={newChat} aria-label="Start a new chat"><SquarePen aria-hidden="true" /></Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => void clearConversation()} disabled={!messages.length} aria-label="Clear this conversation"><Trash2 aria-hidden="true" /></Button>
              <Button ref={closeRef} type="button" variant="ghost" size="icon-sm" onClick={() => { setShowContexts(false); closeFinancialChatbot(); }} aria-label="Close contextual assistant"><X aria-hidden="true" /></Button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setShowContexts((open) => !open)} aria-expanded={showContexts} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">Change context<ChevronDown className={`size-3.5 transition-transform ${showContexts ? "rotate-180" : ""}`} aria-hidden="true" /></button>
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Educational only</span>
          </div>
          {showContexts && <div className="mt-3 max-h-52 divide-y divide-border overflow-y-auto border-y border-border">{contexts.map((item) => <button key={`${item.type}-${item.title}`} type="button" onClick={() => { changeContext(item); setShowContexts(false); }} className="flex w-full items-center justify-between gap-4 px-2 py-2.5 text-left text-sm hover:bg-surface-muted"><span>{item.title}</span><ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" /></button>)}</div>}
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
          {!messages.length ? (
            <section className="flex min-h-full flex-col justify-center py-6">
              <div className="grid size-10 place-items-center rounded-xl border border-primary/20 bg-accent text-sm font-bold text-primary" aria-hidden="true">M</div>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">How can I help you understand this?</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Understand markets, decode financial metrics, challenge investment hype, and learn before you invest.</p>
              <div className="mt-7 grid gap-2">
                {suggestions.map((prompt) => <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-3 text-left text-sm transition-colors hover:border-primary/30 hover:bg-surface-muted"><span>{prompt}</span><ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /></button>)}
              </div>
            </section>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => <ChatMessage key={message.id} message={message} copied={copiedId === message.id} onCopy={() => void copyMessage(message.id, message.content)} onRegenerate={() => void regenerateLastMessage()} canRegenerate={!isLoading && message.id === lastAssistantId} />)}
              {error && <div className="ml-10 border-l-2 border-danger/40 bg-danger/5 px-3 py-3 text-sm text-danger" role="alert"><p>{error}</p><Button type="button" variant="ghost" size="xs" onClick={() => void retryLastMessage()} className="mt-2 text-danger"><RefreshCw aria-hidden="true" />Retry</Button></div>}
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-border bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
          {messages.length > 0 && !isLoading && <div className="mb-3 overflow-x-auto pb-1"><SuggestedQuestions context={context} onSelect={(value) => void sendMessage(value)} disabled={isLoading} /></div>}
          <form onSubmit={submit} className="flex items-end gap-2 rounded-xl border border-input bg-background p-2 shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-ring/20">
            <label className="sr-only" htmlFor="financial-chat-question">Ask anything about {context.title}</label>
            <textarea ref={inputRef} id="financial-chat-question" value={question} maxLength={1_500} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(); } }} rows={1} placeholder={`Ask about ${context.title}…`} className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-5 outline-none placeholder:text-muted-foreground" />
            {isLoading ? <Button type="button" size="icon" variant="outline" onClick={stopGeneration} aria-label="Stop generating"><CircleStop aria-hidden="true" /></Button> : <Button type="submit" size="icon" disabled={!question.trim()} aria-label="Send message"><Send aria-hidden="true" /></Button>}
          </form>
          <p className="mt-2 text-center text-[10px] leading-4 text-muted-foreground">Enter to send · Shift + Enter for a new line · Demo market data is not live.</p>
        </footer>
      </aside>
    </div>
  );
}
