"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, Search } from "lucide-react";

import { ChatbotButton } from "@/components/ai/ChatbotButton";
import { EmptyState } from "@/components/product/empty-state";
import { PageHeader } from "@/components/product/page-header";
import { StatusBadge } from "@/components/product/status-badge";
import { calculateHypeGap, getHypeClassification, getHypeSignals, getSafeFundamentalScore, getSafeHypeScore, getSafeRiskScore, getSafeValuationScore } from "@/lib/calculations/hype";
import type { Asset, HypeSignal } from "@/types";

type Metric = { label: string; value: number; description: string; tone?: "risk" | "warning" | "neutral" };
const inputClass = "h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/20";

export function HypeCheckContent({ assets }: { assets: Asset[] }) {
  const defaultPrimary = assets.find((asset) => asset.symbol === "ZOMATO")?.symbol ?? assets[0]?.symbol ?? "";
  const defaultComparison = assets.find((asset) => asset.symbol === "ITC")?.symbol ?? assets.find((asset) => asset.symbol !== defaultPrimary)?.symbol ?? defaultPrimary;
  const [selectedSymbol, setSelectedSymbol] = useState(defaultPrimary);
  const [compareSymbol, setCompareSymbol] = useState(defaultComparison);
  const [search, setSearch] = useState("");

  const searchMatches = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("en-IN");
    return query ? assets.filter((asset) => [asset.symbol, asset.name, asset.sector].some((value) => value.toLocaleLowerCase("en-IN").includes(query))) : assets;
  }, [assets, search]);

  const selectedAsset = assets.find((asset) => asset.symbol === selectedSymbol) ?? assets[0];
  const compareAsset = assets.find((asset) => asset.symbol === compareSymbol) ?? assets.find((asset) => asset.symbol !== selectedAsset?.symbol) ?? assets[0];

  if (!selectedAsset) return <main className="page-container"><EmptyState title="No demo assets available" description="Add an offline demo asset to compare market attention and fundamentals." /></main>;

  const hypeScore = getSafeHypeScore(selectedAsset);
  const fundamentalScore = getSafeFundamentalScore(selectedAsset);
  const riskScore = getSafeRiskScore(selectedAsset);
  const valuationScore = getSafeValuationScore(selectedAsset);
  const hypeGap = calculateHypeGap(hypeScore, fundamentalScore);
  const classification = getHypeClassification(hypeScore, fundamentalScore);
  const signals = getHypeSignals(selectedAsset);
  const metrics: Metric[] = [
    { label: "Hype proxy", value: hypeScore, description: "Simulated market-attention signal", tone: "warning" },
    { label: "Fundamentals", value: fundamentalScore, description: "Business-quality indicators" },
    { label: "Risk", value: riskScore, description: "Demo risk score", tone: "risk" },
    { label: "Valuation", value: valuationScore, description: "Relative valuation score", tone: "neutral" },
  ];

  const highGap = classification === "HIGH HYPE / MODERATE FUNDAMENTALS";

  return (
    <main className="page-container">
      <PageHeader eyebrow="Research tool" title="Hype Check" description="Separate popularity from fundamentals." action={<span className="text-xs text-muted-foreground">Demo market data — not live.</span>} />

      <section className="mt-8 grid gap-4 border-y border-border bg-surface py-5 md:grid-cols-[1fr_320px]" aria-label="Select a company">
        <label><span className="mb-2 block text-sm font-medium">Search company</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company or symbol" className={`${inputClass} pl-9`} /></span></label>
        <label><span className="mb-2 block text-sm font-medium">Analyze</span><select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)} className={inputClass}>{(searchMatches.length ? searchMatches : assets).map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol} — {asset.name}</option>)}</select></label>
      </section>

      <section className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <div>
          <div className="flex items-end justify-between gap-4 border-b border-border pb-4"><div><p className="font-mono text-xs font-semibold text-primary">{selectedAsset.symbol}</p><h2 className="mt-1 text-2xl font-semibold">Attention versus business signals</h2></div><StatusBadge tone="neutral">Demo Hype Proxy</StatusBadge></div>
          <div className="mt-6 space-y-6">
            {metrics.map((metric) => <HypeBar key={metric.label} {...metric} />)}
          </div>
          <p className="mt-6 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">The hype score is a proxy based on simulated market-attention signals. It is not real social-media sentiment or live news analysis.</p>
        </div>

        <aside className="border-l-0 border-border lg:border-l lg:pl-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Signal</p>
          <div className="mt-3 flex items-start gap-3">{highGap && <AlertTriangle className="mt-1 size-5 shrink-0 text-warning" aria-hidden="true" />}<h2 className="text-xl font-semibold leading-7">{classification}</h2></div>
          <dl className="mt-5 divide-y divide-border border-y border-border"><SignalStat label="Hype gap" value={`${hypeGap >= 0 ? "+" : ""}${hypeGap}`} /><SignalStat label="Company" value={selectedAsset.name.replace(/\s+Ltd\.$/, "")} /></dl>
          <h3 className="mt-6 text-sm font-semibold">What this means</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{highGap ? "Attention is significantly higher than the fundamental score. Strong growth indicators do not automatically make an investment suitable; valuation and volatility still matter." : "The simulated attention signal is not dramatically ahead of business strength. Review valuation, risk, and growth before drawing conclusions."}</p>
          <div className="mt-5"><ChatbotButton label="Ask AI about this analysis" context={{ type: "hype", title: "Hype Check", description: "Demo Hype Proxy comparison of attention and financial signals.", asset: { symbol: selectedAsset.symbol, name: selectedAsset.name }, data: { hypeScore, fundamentalScore, riskScore, valuationScore, classification, hypeGap, demoHypeProxy: true }, userLevel: "Beginner" }} /></div>
        </aside>
      </section>

      <details className="group mt-10 border-y border-border bg-surface py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">How is Hype Score calculated?<ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
        <div className="mt-5 border-t border-border pt-5"><p className="max-w-3xl text-sm leading-6 text-muted-foreground">For demonstration purposes, the hype score uses five simulated proxy signals. It is designed to explain market attention, not predict future prices.</p><div className="mt-5 divide-y divide-border border-y border-border">{signals.map((signal) => <SignalMethod key={signal.key} signal={signal} />)}</div></div>
      </details>

      <section className="mt-12" aria-labelledby="compare-heading">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Compare</p><h2 id="compare-heading" className="mt-2 text-2xl font-semibold">Two assets, the same lenses</h2></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-muted-foreground">First asset<select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)} className={`${inputClass} mt-1.5 text-foreground`}>{assets.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol} — {asset.name}</option>)}</select></label><label className="text-xs font-medium text-muted-foreground">Second asset<select value={compareAsset?.symbol ?? ""} onChange={(event) => setCompareSymbol(event.target.value)} className={`${inputClass} mt-1.5 text-foreground`}>{assets.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol} — {asset.name}</option>)}</select></label></div>
        {compareAsset ? <ComparisonTable first={selectedAsset} second={compareAsset} /> : null}
      </section>
    </main>
  );
}

function HypeBar({ label, value, description, tone }: Metric) {
  const color = tone === "risk" ? "bg-danger" : tone === "warning" ? "bg-warning" : tone === "neutral" ? "bg-muted-foreground" : "bg-primary";
  return <div><div className="mb-2 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wide">{label}</p><p className="mt-0.5 text-xs text-muted-foreground">{description}</p></div><p className="font-mono text-xl font-semibold tabular-nums">{value}<span className="text-xs font-normal text-muted-foreground"> / 100</span></p></div><div className="h-2 bg-surface-muted"><div className={`h-full ${color} transition-[width] duration-200`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>;
}

function SignalStat({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 py-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-sm font-semibold">{value}</dd></div>; }

function SignalMethod({ signal }: { signal: HypeSignal }) { return <div className="grid gap-2 py-4 sm:grid-cols-[180px_1fr_100px]"><div><p className="text-sm font-medium">{signal.label}</p><p className="text-xs text-muted-foreground">{Math.round(signal.weight * 100)}% weight</p></div><p className="text-sm leading-6 text-muted-foreground">{signal.description}</p><p className="font-mono text-sm font-semibold tabular-nums sm:text-right">{signal.score}/100</p></div>; }

function ComparisonTable({ first, second }: { first: Asset; second: Asset }) {
  const rows = [
    ["Hype proxy", getSafeHypeScore(first), getSafeHypeScore(second)],
    ["Fundamentals", getSafeFundamentalScore(first), getSafeFundamentalScore(second)],
    ["Risk", getSafeRiskScore(first), getSafeRiskScore(second)],
    ["Valuation", getSafeValuationScore(first), getSafeValuationScore(second)],
  ];
  return <div className="mt-4 overflow-hidden border-y border-border bg-surface"><div className="grid grid-cols-[1fr_90px_90px] gap-3 border-b border-border bg-surface-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><span>Measure</span><span className="text-right">{first.symbol}</span><span className="text-right">{second.symbol}</span></div>{rows.map(([label, a, b]) => <div key={String(label)} className="grid grid-cols-[1fr_90px_90px] gap-3 border-b border-border px-4 py-3 last:border-0"><span className="text-sm font-medium">{label}</span><span className="text-right font-mono text-sm tabular-nums">{a}/100</span><span className="text-right font-mono text-sm tabular-nums">{b}/100</span></div>)}</div>;
}
