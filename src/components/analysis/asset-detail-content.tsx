"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";

import { ChatbotButton } from "@/components/ai/ChatbotButton";
import { FinancialExplainerPanel } from "@/components/ai/financial-explainer-panel";
import { AssetAnalysisCharts } from "@/components/analysis/asset-analysis-charts";
import { MetricExplainer } from "@/components/analysis/metric-explainer";
import { WatchlistButton } from "@/components/assets/watchlist-button";
import { Disclaimer } from "@/components/product/disclaimer";
import { RiskSpectrum } from "@/components/product/risk-spectrum";
import { StatusBadge } from "@/components/product/status-badge";
import { ScoreBar } from "@/components/risk/score-bar";
import { Button, buttonVariants } from "@/components/ui/button";
import { metricExplanations } from "@/data/metric-explanations";
import { generatePriceHistory } from "@/lib/calculations/price-history";
import { calculateRiskCompatibility, calculateRiskFactors, calculateRiskScore, getCompatibilityExplanation, getRiskExplanation, getRiskLevel } from "@/lib/calculations/risk";
import { cn } from "@/lib/utils";
import { formatInr, formatMarketCap, formatPercent } from "@/lib/utils/format";
import type { Asset, DemoUser, MetricExplanation, MetricKey } from "@/types";

type MetricItem = { key: MetricKey; value: string };

const scoreDescriptions: Record<string, string> = {
  Fundamentals: "Business quality indicators in the demo dataset.",
  Growth: "Revenue and profit expansion signals.",
  "Financial health": "Balance-sheet and profitability indicators.",
  Valuation: "How demanding the current demo valuation appears.",
  Hype: "Simulated market-attention proxy, not live sentiment.",
};

export function AssetDetailContent({ asset, user }: { asset: Asset; user: DemoUser }) {
  const [selectedMetric, setSelectedMetric] = useState<MetricExplanation | null>(null);
  const closeExplainer = useCallback(() => setSelectedMetric(null), []);
  const riskFactors = useMemo(() => calculateRiskFactors(asset), [asset]);
  const riskScore = useMemo(() => calculateRiskScore(asset), [asset]);
  const riskLevel = getRiskLevel(riskScore);
  const compatibility = calculateRiskCompatibility(user.riskScore, riskScore);
  const priceHistory = useMemo(() => generatePriceHistory(asset), [asset]);
  const overallHealth = Number(((asset.fundamentalScore * .3 + asset.growthScore * .2 + asset.financialHealthScore * .2 + asset.valuationScore * .15 + (100 - riskScore) * .15) / 10).toFixed(1));

  const scores = [
    { label: "Fundamentals", score: asset.fundamentalScore },
    { label: "Risk", score: riskScore, description: "Higher means more exposure to risk factors." },
    { label: "Growth", score: asset.growthScore },
    { label: "Financial health", score: asset.financialHealthScore },
    { label: "Valuation", score: asset.valuationScore },
    { label: "Hype", score: asset.hypeScore },
  ];

  const metrics: MetricItem[] = [
    { key: "pe", value: asset.pe.toFixed(1) },
    { key: "eps", value: formatInr(asset.eps) },
    { key: "roe", value: `${asset.roe.toFixed(1)}%` },
    { key: "roce", value: `${asset.roce.toFixed(1)}%` },
    { key: "debtToEquity", value: asset.debtToEquity.toFixed(2) },
    { key: "profitMargin", value: `${asset.profitMargin.toFixed(1)}%` },
    { key: "revenueGrowth", value: `${asset.revenueGrowth.toFixed(1)}%` },
    { key: "profitGrowth", value: `${asset.profitGrowth.toFixed(1)}%` },
    { key: "dividendYield", value: `${asset.dividendYield.toFixed(2)}%` },
    { key: "beta", value: asset.beta.toFixed(2) },
    { key: "volatility", value: `${asset.volatility.toFixed(1)}%` },
    { key: "marketCapCr", value: formatMarketCap(asset.marketCapCr) },
  ];

  const riskTone = riskScore <= 30 ? "success" : riskScore <= 60 ? "warning" : "danger";

  return (
    <main className="page-container">
      <Link href="/explore" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 mb-5 text-muted-foreground")}><ArrowLeft aria-hidden="true" />Explore investments</Link>

      <header className="flex flex-col justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-semibold tracking-[0.12em] text-primary">{asset.symbol}</span><StatusBadge tone={riskTone}>{riskLevel} risk</StatusBadge></div>
          <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.025em] sm:text-[36px]">{asset.name.replace(/\s+Ltd\.$/, "")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{asset.name} · {asset.sector}</p>
        </div>
        <div className="flex items-end gap-4">
          <div className="md:text-right"><p className="text-xs text-muted-foreground">Demo price</p><p className="mt-1 font-mono text-3xl font-semibold tabular-nums">{formatInr(asset.price)}</p><p className={cn("mt-1 font-mono text-sm font-semibold tabular-nums", asset.dailyChange >= 0 ? "text-success" : "text-danger")}>{formatPercent(asset.dailyChange)}</p></div>
          <WatchlistButton symbol={asset.symbol} />
        </div>
      </header>

      <nav className="-mx-1 mt-3 flex gap-1 overflow-x-auto border-b border-border px-1" aria-label="Asset analysis sections">
        {[["Overview", "#overview"], ["Fundamentals", "#fundamentals"], ["Risk", "#risk"], ["Valuation", "#fundamentals"], ["Hype", "/hype-check"], ["Learn", "/learn"]].map(([label, href], index) => <Link key={label} href={href} className={cn("whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium", index === 0 ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{label}</Link>)}
      </nav>

      <p className="mt-4 text-xs text-muted-foreground">Demo market data — not live. Scores are educational interpretations of simulated inputs.</p>

      <section className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]" aria-labelledby="health-heading">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Overall investment health</p>
          <h2 id="health-heading" className="mt-3 font-mono text-5xl font-semibold tabular-nums">{overallHealth}<span className="text-xl font-normal text-muted-foreground"> / 10</span></h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">A blended educational score across quality, growth, financial health, valuation, and calculated risk.</p>
        </div>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {scores.map((item) => <ScoreBar key={item.label} label={item.label} score={item.score} tone={item.label === "Risk" ? "rose" : item.label === "Valuation" ? "amber" : "primary"} description={item.description ?? scoreDescriptions[item.label]} />)}
        </div>
      </section>

      <div className="mt-10"><AssetAnalysisCharts asset={asset} history={priceHistory} riskFactors={riskFactors} /></div>

      <section id="risk" className="mt-12 scroll-mt-20 border-t border-border pt-8" aria-labelledby="risk-heading">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Transparent risk engine</p><h2 id="risk-heading" className="mt-2 text-2xl font-semibold">Risk score: <span className="font-mono tabular-nums">{riskScore} / 100</span></h2></div><StatusBadge tone={riskTone}>{riskLevel}</StatusBadge></div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{getRiskExplanation(asset)}</p>
            <div className="mt-7"><RiskSpectrum score={riskScore} /></div>
            <details className="group mt-7 border-y border-border py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Why this score?<ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
              <div className="mt-5 divide-y divide-border border-t border-border">
                {riskFactors.map((factor) => <div key={factor.key} className="grid gap-2 py-4 sm:grid-cols-[150px_1fr_70px]"><div><p className="text-sm font-medium">{factor.label}</p><p className="text-xs text-muted-foreground">{Math.round(factor.weight * 100)}% weight</p></div><p className="text-sm leading-6 text-muted-foreground">{factor.explanation}</p><p className="font-mono text-sm font-semibold tabular-nums sm:text-right">{factor.score}/100</p></div>)}
              </div>
            </details>
            <div className="mt-4"><ChatbotButton label="Ask about this risk score" context={{ type: "metric", title: "Risk Score", description: getRiskExplanation(asset), asset: { symbol: asset.symbol, name: asset.name }, metric: { name: "Risk Score", value: riskScore }, data: { riskScore, riskLevel, riskFactors }, userLevel: "Beginner" }} /></div>
          </div>

          <aside className="border-l-0 border-border lg:border-l lg:pl-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">How does this compare with your profile?</p>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              <ProfileRow label="Your profile" value={user.riskTolerance} detail={`${user.riskScore}/100`} />
              <ProfileRow label="Asset risk" value={riskLevel} detail={`${riskScore}/100`} />
              <ProfileRow label="Compatibility" value={`${compatibility}%`} detail="Risk alignment" />
            </dl>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">{getCompatibilityExplanation(user.riskScore, riskScore)}</p>
            <p className="mt-3 text-sm font-medium text-primary">Consider researching further.</p>
          </aside>
        </div>
      </section>

      <section id="fundamentals" className="mt-12 scroll-mt-20" aria-labelledby="metrics-heading">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Fundamentals</p><h2 id="metrics-heading" className="mt-2 text-2xl font-semibold">Financial metrics, explained</h2><p className="mt-2 text-sm text-muted-foreground">Open a definition or ask a contextual question without leaving this analysis.</p></div>
        <div className="mt-6 overflow-hidden border-y border-border bg-surface">
          <div className="hidden grid-cols-[170px_120px_1fr_170px] gap-4 border-b border-border bg-surface-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid"><span>Metric</span><span>Value</span><span>Plain-English meaning</span><span /></div>
          {metrics.map(({ key, value }) => {
            const explanation = metricExplanations[key];
            return <article key={key} className="grid gap-3 border-b border-border px-4 py-4 last:border-0 md:grid-cols-[170px_120px_1fr_170px] md:items-center"><div><p className="text-sm font-semibold">{explanation.label}</p></div><p className="font-mono text-sm font-semibold tabular-nums">{value}</p><p className="text-sm leading-6 text-muted-foreground">{explanation.shortExplanation}</p><div className="flex gap-1 md:justify-end"><Button size="sm" variant="ghost" onClick={() => setSelectedMetric(explanation)}>Explain</Button><ChatbotButton label="Ask AI" context={{ type: "metric", title: explanation.label, description: explanation.shortExplanation, asset: { symbol: asset.symbol, name: asset.name }, metric: { name: explanation.label, value }, data: { metricKey: key, value }, userLevel: "Beginner" }} /></div></article>;
          })}
        </div>
      </section>

      <FinancialExplainerPanel asset={asset} />
      <div className="mt-10"><Disclaimer /></div>
      <MetricExplainer metric={selectedMetric} onClose={closeExplainer} />
    </main>
  );
}

function ProfileRow({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="text-right"><span className="block text-sm font-semibold">{value}</span><span className="font-mono text-xs text-muted-foreground">{detail}</span></dd></div>;
}
