"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, RotateCcw, Search } from "lucide-react";

import { ChatbotButton } from "@/components/ai/ChatbotButton";
import { EmptyState } from "@/components/product/empty-state";
import { PageHeader } from "@/components/product/page-header";
import { ScoreBar } from "@/components/risk/score-bar";
import { Button } from "@/components/ui/button";
import { calculateRiskScore, getRiskLevel } from "@/lib/calculations/risk";
import { calculateDecisionReadiness } from "@/lib/calculations/simulator";
import { formatInr } from "@/lib/utils/format";
import type { Asset, HoldingHorizon, InvestmentKnowledge, SimulatorReason, SimulatorReviewState, VolatilityTolerance } from "@/types";

type ChoiceOption<T extends string> = { value: T; label: string; description?: string };

const reasons: ChoiceOption<SimulatorReason>[] = [
  { value: "Social media", label: "Social media", description: "A trend, post, or creator caught your attention." },
  { value: "Friend recommended it", label: "Friend recommended it", description: "Someone you know suggested it." },
  { value: "News", label: "News", description: "A headline or event made it feel relevant." },
  { value: "Research", label: "Research", description: "You found it while studying companies." },
  { value: "Long-term plan", label: "Long-term plan", description: "It fits a goal you have been planning for." },
  { value: "Other", label: "Other", description: "Another reason not listed here." },
];
const horizons: ChoiceOption<HoldingHorizon>[] = ["< 1 year", "1–3 years", "3–5 years", "5+ years"].map((value) => ({ value: value as HoldingHorizon, label: value }));
const tolerances: ChoiceOption<VolatilityTolerance>[] = [
  { value: "Low", label: "Low", description: "Large swings would be difficult to hold through." },
  { value: "Moderate", label: "Moderate", description: "Some movement is manageable with context." },
  { value: "High", label: "High", description: "You can remain calm through larger swings." },
];
const knowledgeLevels: ChoiceOption<InvestmentKnowledge>[] = ["Not at all", "A little", "Mostly", "Very well"].map((value) => ({ value: value as InvestmentKnowledge, label: value }));
const initialReviews: SimulatorReviewState = { risk: false, fundamentals: false, valuation: false, growth: false, hype: false };
const reviewLabels: Array<{ key: keyof SimulatorReviewState; label: string; description: string }> = [
  { key: "risk", label: "Risk", description: "Calculated exposure to volatility, beta, debt, and other factors." },
  { key: "fundamentals", label: "Fundamentals", description: "Business quality signals in the demo dataset." },
  { key: "valuation", label: "Valuation", description: "How demanding the demo valuation appears." },
  { key: "growth", label: "Growth", description: "Revenue and profit expansion signals." },
  { key: "hype", label: "Hype", description: "Simulated attention, not live social sentiment." },
];
const stepLabels = ["Asset", "Reason", "Horizon", "Risk awareness", "Understanding", "Review"];
const stepTitles = ["What are you considering?", "Why are you considering it?", "How long do you plan to hold?", "How much volatility can you tolerate?", "How well do you understand this investment?", "Review the signals before continuing."];

export function DecisionSimulator({ assets }: { assets: Asset[] }) {
  const defaultAsset = assets.find((asset) => asset.symbol === "ZOMATO") ?? assets[0];
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [search, setSearch] = useState("");
  const [assetSymbol, setAssetSymbol] = useState(defaultAsset?.symbol ?? "");
  const [reason, setReason] = useState<SimulatorReason>();
  const [horizon, setHorizon] = useState<HoldingHorizon>();
  const [volatilityTolerance, setVolatilityTolerance] = useState<VolatilityTolerance>();
  const [knowledge, setKnowledge] = useState<InvestmentKnowledge>();
  const [reviewed, setReviewed] = useState<SimulatorReviewState>(initialReviews);

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("en-IN");
    return query ? assets.filter((asset) => [asset.symbol, asset.name, asset.sector].some((value) => value.toLocaleLowerCase("en-IN").includes(query))) : assets;
  }, [assets, search]);
  const asset = assets.find((item) => item.symbol === assetSymbol) ?? defaultAsset;
  const calculatedRisk = useMemo(() => asset ? calculateRiskScore(asset) : 0, [asset]);
  const allReviewed = Object.values(reviewed).every(Boolean);
  const canContinue = step === 1 ? Boolean(asset) : step === 2 ? Boolean(reason) : step === 3 ? Boolean(horizon) : step === 4 ? Boolean(volatilityTolerance) : step === 5 ? Boolean(knowledge) : allReviewed;
  const readiness = asset && reason && horizon && volatilityTolerance && knowledge ? calculateDecisionReadiness({ asset, reason, horizon, volatilityTolerance, knowledge, reviewed }) : null;

  if (!asset) return <main className="page-container"><EmptyState title="No demo assets available" description="Add an offline demo asset to begin the guided flow." /></main>;

  function goBack() { if (showResults) { setShowResults(false); setStep(6); } else setStep((current) => Math.max(1, current - 1)); }
  function continueFlow() { if (!canContinue) return; if (step < 6) setStep((current) => current + 1); else setShowResults(true); }
  function restart() { setStep(1); setShowResults(false); setSearch(""); setAssetSymbol(defaultAsset?.symbol ?? ""); setReason(undefined); setHorizon(undefined); setVolatilityTolerance(undefined); setKnowledge(undefined); setReviewed(initialReviews); }

  const stepContext = step === 1
    ? { type: "asset" as const, title: `${asset.symbol} selection`, description: "Choosing an asset is the first step in a deliberate research process.", asset: { symbol: asset.symbol, name: asset.name }, data: { price: asset.price }, userLevel: "Beginner" as const }
    : step === 2 ? { type: "simulator" as const, title: "Reason for investment", description: "Your starting reason can reveal social influence or a deliberate plan.", data: { reason }, userLevel: "Beginner" as const }
    : step === 3 ? { type: "simulator" as const, title: "Investment horizon", description: "Time horizon is how long you expect to stay with an idea.", data: { horizon }, userLevel: "Beginner" as const }
    : step === 4 ? { type: "simulator" as const, title: "Risk tolerance", description: "Risk tolerance describes the volatility you can emotionally and financially tolerate.", data: { volatilityTolerance }, userLevel: "Beginner" as const }
    : step === 5 ? { type: "simulator" as const, title: "Investment understanding", description: "Understanding helps identify what still needs research.", data: { knowledge }, userLevel: "Beginner" as const }
    : { type: "simulator" as const, title: "Reviewing financial signals", description: "Review risk, fundamentals, valuation, growth, and hype before acting.", asset: { symbol: asset.symbol, name: asset.name }, data: { risk: calculatedRisk, fundamentals: asset.fundamentalScore, valuation: asset.valuationScore, growth: asset.growthScore, hype: asset.hypeScore }, userLevel: "Beginner" as const };

  return (
    <main className="page-container max-w-5xl">
      <PageHeader eyebrow="Guided decision flow" title="Think Before You Invest" description="Slow down. Understand first." action={<span className="text-xs text-muted-foreground">Simulated decisions only</span>} />
      <ProgressStepper current={showResults ? 7 : step} onSelect={(next) => { setShowResults(false); setStep(next); }} />

      {!showResults ? (
        <section key={step} className="mt-8 animate-enter" aria-labelledby="simulator-step-heading">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-start">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Step {String(step).padStart(2, "0")}</p><h2 id="simulator-step-heading" className="mt-2 text-2xl font-semibold">{stepTitles[step - 1]}</h2></div>
            <ChatbotButton label="Ask why this matters" context={stepContext} />
          </div>
          <div className="py-7">
            {step === 1 && <AssetChoice assets={filteredAssets.length ? filteredAssets : assets} selected={asset.symbol} search={search} onSearch={setSearch} onSelect={(symbol) => { setAssetSymbol(symbol); setSearch(""); }} />}
            {step === 2 && <ChoiceList options={reasons} value={reason} onChange={setReason} />}
            {step === 3 && <ChoiceList options={horizons} value={horizon} onChange={setHorizon} />}
            {step === 4 && <ChoiceList options={tolerances} value={volatilityTolerance} onChange={setVolatilityTolerance} />}
            {step === 5 && <ChoiceList options={knowledgeLevels} value={knowledge} onChange={setKnowledge} />}
            {step === 6 && <ReviewStep asset={asset} calculatedRisk={calculatedRisk} reviewed={reviewed} onChange={setReviewed} />}
          </div>
          <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row"><Button variant="outline" onClick={goBack} disabled={step === 1}><ArrowLeft aria-hidden="true" />Back</Button><Button onClick={continueFlow} disabled={!canContinue}>Continue<ArrowRight aria-hidden="true" /></Button></div>
        </section>
      ) : readiness ? (
        <section className="mt-8 animate-enter" aria-labelledby="readiness-heading">
          <div className="grid gap-8 border-b border-border pb-8 md:grid-cols-[220px_1fr]">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Decision readiness</p><p className="mt-3 font-mono text-5xl font-semibold tabular-nums">{readiness.score}<span className="text-xl font-normal text-muted-foreground"> / 100</span></p></div>
            <div><h2 id="readiness-heading" className="text-2xl font-semibold">You have paused to review the main signals.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">This score reflects how thoroughly you moved through the educational process. It is not a prediction or suitability verdict.</p><div className="mt-4"><ChatbotButton label="Ask about decision readiness" context={{ type: "simulator", title: "Decision Readiness", description: "A transparent educational review score.", asset: { symbol: asset.symbol, name: asset.name }, data: { score: readiness.score, reason, horizon, volatilityTolerance, knowledge }, userLevel: "Beginner" }} /></div></div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <ResultList title="What you understand" items={["Risk", "Fundamentals", "Time horizon"]} positive />
            <ResultList title="What you may want to review" items={["Valuation", "Debt", "Volatility"]} />
          </div>

          <section className="mt-8 border-y border-border py-5"><div className="flex gap-3">{(reason === "Social media" || reason === "Friend recommended it") && <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />}<div><h3 className="text-sm font-semibold">Behavioral insight</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{reason === "Social media" || reason === "Friend recommended it" ? "Your initial motivation appears to be influenced by external recommendations. Consider validating the underlying fundamentals before making a decision." : "Your starting point appears more deliberate. Keep checking for gaps that your first impression may miss."}</p></div></div></section>

          <section className="mt-8"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Final takeaway</p><h3 className="mt-2 text-xl font-semibold">You&apos;re better informed, but there are still areas worth researching.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Continue learning and verify the flagged signals before making your own decision.</p></section>

          <details className="group mt-8 border-y border-border py-4"><summary className="cursor-pointer list-none text-sm font-semibold">How was {readiness.score}/100 calculated?</summary><div className="mt-4 divide-y divide-border border-t border-border">{Object.entries(readiness.breakdown).map(([key, value]) => <div key={key} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</span><span className="font-mono tabular-nums">{value}/100 · {Math.round(readiness.weights[key as keyof typeof readiness.weights] * 100)}%</span></div>)}</div></details>
          <div className="mt-6 flex flex-wrap gap-3"><Button variant="outline" onClick={goBack}><ArrowLeft aria-hidden="true" />Review answers</Button><Button onClick={restart}><RotateCcw aria-hidden="true" />Start again</Button></div>
        </section>
      ) : null}
    </main>
  );
}

function ProgressStepper({ current, onSelect }: { current: number; onSelect: (step: number) => void }) {
  return <div className="mt-7 overflow-x-auto border-b border-border"><ol className="flex min-w-[660px]" aria-label="Decision flow progress">{stepLabels.map((label, index) => { const step = index + 1; const complete = step < current; const active = step === current; return <li key={label} className="flex-1"><button type="button" disabled={!complete} onClick={() => onSelect(step)} className={`w-full border-b-2 px-2 py-3 text-left text-xs transition ${active ? "border-primary text-foreground" : complete ? "border-primary/30 text-foreground" : "border-transparent text-muted-foreground"}`}><span className="mr-2 font-mono">{String(step).padStart(2, "0")}</span>{label}</button></li>; })}</ol></div>;
}

function ChoiceList<T extends string>({ options, value, onChange }: { options: ChoiceOption<T>[]; value: T | undefined; onChange: (value: T) => void }) {
  return <div className="max-w-2xl divide-y divide-border border-y border-border">{options.map((option) => { const selected = option.value === value; return <button key={option.value} type="button" aria-pressed={selected} onClick={() => onChange(option.value)} className={`flex w-full items-start justify-between gap-4 px-3 py-4 text-left transition hover:bg-surface-muted ${selected ? "bg-accent" : ""}`}><span><span className="block text-sm font-semibold">{option.label}</span>{option.description && <span className="mt-1 block text-sm leading-6 text-muted-foreground">{option.description}</span>}</span><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{selected && <Check className="size-3" aria-hidden="true" />}</span></button>; })}</div>;
}

function AssetChoice({ assets, selected, search, onSearch, onSelect }: { assets: Asset[]; selected: string; search: string; onSearch: (value: string) => void; onSelect: (symbol: string) => void }) {
  const current = assets.find((asset) => asset.symbol === selected);
  return <div><label className="block max-w-xl"><span className="text-sm font-medium">Search or select an asset</span><span className="relative mt-2 block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search company or symbol" className="h-10 w-full rounded-lg border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/20" /></span></label><div className="mt-5 max-h-80 max-w-2xl divide-y divide-border overflow-y-auto border-y border-border">{assets.map((asset) => <button key={asset.symbol} type="button" onClick={() => onSelect(asset.symbol)} className={`flex w-full items-center justify-between gap-4 px-3 py-3 text-left hover:bg-surface-muted ${asset.symbol === selected ? "bg-accent" : ""}`}><span><span className="block text-sm font-semibold">{asset.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">{asset.symbol} · {asset.sector}</span></span><span className="font-mono text-sm tabular-nums">{formatInr(asset.price)}</span></button>)}</div>{current && <p className="mt-4 text-sm text-muted-foreground">Selected: <span className="font-semibold text-foreground">{current.name}</span></p>}</div>;
}

function ReviewStep({ asset, calculatedRisk, reviewed, onChange }: { asset: Asset; calculatedRisk: number; reviewed: SimulatorReviewState; onChange: React.Dispatch<React.SetStateAction<SimulatorReviewState>> }) {
  const signals = [
    { key: "risk" as const, label: "Risk", score: calculatedRisk, note: `${getRiskLevel(calculatedRisk)} calculated risk`, tone: "rose" as const },
    { key: "fundamentals" as const, label: "Fundamentals", score: asset.fundamentalScore, note: "Business-quality signal", tone: "primary" as const },
    { key: "valuation" as const, label: "Valuation", score: asset.valuationScore, note: "Relative valuation signal", tone: "amber" as const },
    { key: "growth" as const, label: "Growth", score: asset.growthScore, note: "Growth signal", tone: "primary" as const },
    { key: "hype" as const, label: "Hype", score: asset.hypeScore, note: "Demo attention proxy", tone: "amber" as const },
  ];
  return <div><div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">{signals.map((signal) => <ScoreBar key={signal.key} label={signal.label} score={signal.score} tone={signal.tone} description={signal.note} />)}</div><p className="mt-8 text-sm font-semibold">Confirm that you reviewed each factor</p><div className="mt-3 divide-y divide-border border-y border-border">{reviewLabels.map((item) => <label key={item.key} className="flex cursor-pointer items-start gap-3 py-3"><input type="checkbox" checked={reviewed[item.key]} onChange={(event) => onChange((current) => ({ ...current, [item.key]: event.target.checked }))} className="mt-1 size-4 accent-[var(--primary)]" /><span><span className="block text-sm font-medium">{item.label}</span><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{item.description}</span></span></label>)}</div></div>;
}

function ResultList({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) { return <section><h3 className="text-lg font-semibold">{title}</h3><ul className="mt-4 divide-y divide-border border-y border-border">{items.map((item) => <li key={item} className="flex items-center gap-3 py-3 text-sm"><span className={`grid size-5 place-items-center rounded-full border ${positive ? "border-success/30 text-success" : "border-warning/30 text-warning"}`}>{positive ? <Check className="size-3" aria-hidden="true" /> : <AlertTriangle className="size-3" aria-hidden="true" />}</span>{item}</li>)}</ul></section>; }
