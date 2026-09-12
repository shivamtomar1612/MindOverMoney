"use client";

import Link from "next/link";
import { useState } from "react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowRight, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/product/empty-state";
import { PageHeader, SectionHeader } from "@/components/product/page-header";
import { RiskSpectrum } from "@/components/product/risk-spectrum";
import { StatusBadge } from "@/components/product/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { usePaperPortfolio } from "@/hooks/use-paper-portfolio";
import { generatePortfolioHistory } from "@/lib/calculations/portfolio";
import { cn } from "@/lib/utils";
import { formatInr, formatPercent } from "@/lib/utils/format";
import type { Asset, PortfolioHoldingView } from "@/types";

const controlClass = "h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/20";

export function PaperPortfolio({ assets }: { assets: Asset[] }) {
  const { summary, add, remove, state } = usePaperPortfolio(assets);
  const [selectedSymbol, setSelectedSymbol] = useState(assets[0]?.symbol ?? "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const history = generatePortfolioHistory(state, assets);
  const selectedAsset = assets.find((asset) => asset.symbol === selectedSymbol);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = add(selectedSymbol, Number(amount));
    setError(result);
    if (!result) setAmount("");
  }

  const riskTone = summary.portfolioRiskLevel === "LOW" ? "success" : summary.portfolioRiskLevel === "MODERATE" ? "warning" : "danger";

  return (
    <main className="page-container">
      <PageHeader eyebrow="Simulation" title="Paper Portfolio" description="Practice allocation and concentration without using real money." action={<Link href="/explore" className={buttonVariants({ variant: "outline", size: "sm" })}>Explore investments<ArrowRight aria-hidden="true" /></Link>} />
      <p className="mt-4 text-xs font-medium text-muted-foreground">Paper Portfolio — No real money involved. Starting capital {formatInr(state.startingBalance)}.</p>

      <section className="mt-7 grid grid-cols-2 border-y border-border bg-surface md:grid-cols-5" aria-label="Portfolio summary">
        <SummaryMetric label="Portfolio value" value={formatInr(summary.portfolioValue)} />
        <SummaryMetric label="Invested" value={formatInr(summary.invested)} />
        <SummaryMetric label="Cash" value={formatInr(summary.cash)} />
        <SummaryMetric label="P&L" value={`${summary.profitLoss >= 0 ? "+" : ""}${formatInr(summary.profitLoss)}`} detail={formatPercent(summary.profitLossPct)} tone={summary.profitLoss >= 0 ? "positive" : "negative"} />
        <SummaryMetric label="Portfolio risk" value={`${summary.portfolioRisk}/100`} detail={summary.portfolioRiskLevel} />
      </section>

      <section className="mt-9 grid gap-8 lg:grid-cols-[330px_1fr]">
        <div>
          <h2 className="text-lg font-semibold">Add a demo holding</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Amounts are validated against available simulated cash.</p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block text-sm font-medium">Asset<select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)} className={`${controlClass} mt-2`}>{assets.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol} — {asset.name}</option>)}</select></label>
            <label className="block text-sm font-medium">Amount in rupees<input type="number" min="100" step="100" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="e.g. 20000" className={`${controlClass} mt-2`} /></label>
            <div className="flex justify-between gap-4 text-xs text-muted-foreground"><span>Available cash</span><span className="font-mono tabular-nums text-foreground">{formatInr(summary.cash)}</span></div>
            {error && <div role="alert" className="flex items-start gap-2 border border-danger/20 bg-danger/5 p-3 text-sm text-danger"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{error}</div>}
            <Button type="submit" className="w-full"><Plus aria-hidden="true" />Add {selectedAsset?.symbol ?? "asset"}</Button>
          </form>
        </div>

        <article className="border-l-0 border-border lg:border-l lg:pl-8">
          <div className="flex items-end justify-between gap-4"><div><h2 className="text-lg font-semibold">Simulated performance</h2><p className="mt-1 text-xs text-muted-foreground">Deterministic demo history · values do not randomly change</p></div><span className="font-mono text-xs text-muted-foreground">{formatInr(summary.totalBalance)}</span></div>
          <div className="mt-4 h-64 w-full" aria-label="Deterministic paper portfolio performance chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid vertical={false} stroke="#e5e8e5" /><XAxis dataKey="label" tick={{ fill: "#6b746e", fontSize: 10 }} tickLine={false} axisLine={false} interval={5} /><YAxis hide domain={["dataMin - 1000", "dataMax + 1000"]} /><Tooltip contentStyle={{ background: "#fff", border: "1px solid #dce2dd", borderRadius: "8px", fontSize: "12px" }} formatter={(value) => [formatInr(Number(value)), "Total demo balance"]} /><Line type="monotone" dataKey="value" stroke="#176b4d" strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
        </article>
      </section>

      <section className="mt-12">
        <SectionHeader title="Holdings" description={`${summary.holdings.length} simulated ${summary.holdings.length === 1 ? "position" : "positions"}`} />
        {summary.holdings.length ? <HoldingsTable holdings={summary.holdings} onRemove={remove} /> : <div className="mt-4"><EmptyState title="No holdings yet" description="Add a demo asset to understand how allocation and risk interact." actionLabel="Explore investments" actionHref="/explore" /></div>}
      </section>

      <section className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div><SectionHeader title="Sector allocation" description={`Diversification score ${summary.diversification}/100`} />{summary.sectorAllocation.length ? <div className="mt-5 divide-y divide-border border-y border-border">{summary.sectorAllocation.map((allocation) => <div key={allocation.sector} className="grid grid-cols-[140px_1fr_60px] items-center gap-4 py-3"><span className="text-sm font-medium">{allocation.sector}</span><div className="h-2 bg-surface-muted"><div className="h-full bg-primary" style={{ width: `${allocation.weight}%` }} /></div><span className="text-right font-mono text-xs tabular-nums">{allocation.weight.toFixed(1)}%</span></div>)}</div> : <p className="mt-4 text-sm text-muted-foreground">Allocation appears after you add a holding.</p>}</div>
        <aside className="border-l-0 border-border lg:border-l lg:pl-8"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Portfolio risk</h2><StatusBadge tone={riskTone}>{summary.portfolioRiskLevel}</StatusBadge></div><p className="mt-3 font-mono text-3xl font-semibold tabular-nums">{summary.portfolioRisk}<span className="text-sm font-normal text-muted-foreground"> / 100</span></p><div className="mt-5"><RiskSpectrum score={summary.portfolioRisk} /></div><p className="mt-5 text-xs leading-5 text-muted-foreground">Weighted average of each holding&apos;s calculated demo risk, based on invested amounts.</p></aside>
      </section>
    </main>
  );
}

function SummaryMetric({ label, value, detail, tone }: { label: string; value: string; detail?: string; tone?: "positive" | "negative" }) { return <div className="border-b border-r border-border px-4 py-4 last:border-r-0 md:border-b-0"><p className="text-xs text-muted-foreground">{label}</p><p className={cn("mt-1 font-mono text-lg font-semibold tabular-nums", tone === "positive" && "text-success", tone === "negative" && "text-danger")}>{value}</p>{detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}</div>; }

function HoldingsTable({ holdings, onRemove }: { holdings: PortfolioHoldingView[]; onRemove: (symbol: string) => void }) {
  return <div className="mt-4 overflow-hidden border-y border-border bg-surface"><div className="hidden grid-cols-[1.5fr_120px_120px_90px_90px_90px_40px] gap-3 border-b border-border bg-surface-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid"><span>Asset</span><span className="text-right">Invested</span><span className="text-right">Current</span><span className="text-right">P&L</span><span className="text-right">Weight</span><span className="text-right">Risk</span><span /></div>{holdings.map((holding) => <HoldingRow key={holding.symbol} holding={holding} onRemove={() => onRemove(holding.symbol)} />)}</div>;
}

function HoldingRow({ holding, onRemove }: { holding: PortfolioHoldingView; onRemove: () => void }) {
  const positive = holding.simulatedReturn >= 0;
  return <article className="grid gap-4 border-b border-border px-4 py-4 last:border-0 md:grid-cols-[1.5fr_120px_120px_90px_90px_90px_40px] md:items-center md:gap-3 md:py-3"><div><p className="text-sm font-semibold">{holding.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{holding.symbol} · {holding.sector}</p></div><HoldingCell label="Invested" value={formatInr(holding.amountInvested)} /><HoldingCell label="Current" value={formatInr(holding.currentValue)} /><HoldingCell label="P&L" value={`${positive ? "+" : ""}${formatPercent(holding.simulatedReturnPct)}`} tone={positive ? "positive" : "negative"} /><HoldingCell label="Weight" value={`${holding.weight.toFixed(1)}%`} /><HoldingCell label="Risk" value={`${holding.riskScore}/100`} /><Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${holding.symbol} from paper portfolio`}><Trash2 aria-hidden="true" /></Button></article>;
}

function HoldingCell({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) { return <div className="flex justify-between gap-4 md:block md:text-right"><span className="text-xs text-muted-foreground md:hidden">{label}</span><span className={cn("font-mono text-sm tabular-nums", tone === "positive" && "text-success", tone === "negative" && "text-danger")}>{value}</span></div>; }
