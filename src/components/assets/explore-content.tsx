"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

import { EmptyState } from "@/components/product/empty-state";
import { PageHeader } from "@/components/product/page-header";
import { RiskBadge } from "@/components/risk/risk-badge";
import { Button } from "@/components/ui/button";
import { WatchlistButton } from "@/components/assets/watchlist-button";
import { formatInr, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { Asset, AssetHypeLevel, AssetRiskLevel } from "@/types";

type SortOption = "fundamentalScore" | "riskScore" | "hypeScore" | "price";

type ExploreContentProps = { assets: Asset[] };

const controlClass =
  "h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/20";

export function ExploreContent({ assets }: ExploreContentProps) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All sectors");
  const [risk, setRisk] = useState<"All risks" | AssetRiskLevel>("All risks");
  const [hype, setHype] = useState<"All hype" | AssetHypeLevel>("All hype");
  const [minimumFundamentalScore, setMinimumFundamentalScore] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("fundamentalScore");

  const sectors = useMemo(
    () => [...new Set(assets.map((asset) => asset.sector))].sort(),
    [assets],
  );

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en-IN");
    return assets
      .filter((asset) => {
        const matchesSearch =
          !normalizedQuery ||
          [asset.symbol, asset.name, asset.sector].some((value) =>
            value.toLocaleLowerCase("en-IN").includes(normalizedQuery),
          );
        return (
          matchesSearch &&
          (sector === "All sectors" || asset.sector === sector) &&
          (risk === "All risks" || asset.riskLevel === risk) &&
          (hype === "All hype" || asset.hypeLevel === hype) &&
          asset.fundamentalScore >= minimumFundamentalScore
        );
      })
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [assets, hype, minimumFundamentalScore, query, risk, sector, sortBy]);

  const hasFilters =
    query !== "" || sector !== "All sectors" || risk !== "All risks" ||
    hype !== "All hype" || minimumFundamentalScore !== 0;

  function clearFilters() {
    setQuery("");
    setSector("All sectors");
    setRisk("All risks");
    setHype("All hype");
    setMinimumFundamentalScore(0);
  }

  return (
    <main className="page-container">
      <PageHeader
        eyebrow="Research"
        title="Explore investments"
        description="Compare the demo market using business quality, growth, valuation, risk, and market attention."
        action={<span className="text-xs text-muted-foreground">Demo market data — not live.</span>}
      />

      <section className="mt-8 border-y border-border bg-surface py-5" aria-label="Asset filters">
        <label className="block max-w-2xl">
          <span className="mb-2 block text-sm font-medium">Search by company or symbol</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try TCS, banking, or NIFTY 50"
              className={`${controlClass} pl-9`}
            />
          </span>
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Filter label="Sector" value={sector} onChange={setSector} options={["All sectors", ...sectors]} />
          <Filter label="Risk" value={risk} onChange={(value) => setRisk(value as typeof risk)} options={["All risks", "Low", "Moderate", "High"]} />
          <Filter label="Hype" value={hype} onChange={(value) => setHype(value as typeof hype)} options={["All hype", "Low", "Moderate", "High"]} />
          <Filter label="Fundamentals" value={String(minimumFundamentalScore)} onChange={(value) => setMinimumFundamentalScore(Number(value))} options={["0", "70", "80", "90"]} optionLabels={["All scores", "70 and above", "80 and above", "90 and above"]} />
          <Filter label="Sort by" value={sortBy} onChange={(value) => setSortBy(value as SortOption)} options={["fundamentalScore", "riskScore", "hypeScore", "price"]} optionLabels={["Fundamental score", "Risk", "Hype", "Price"]} />
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filteredAssets.length} {filteredAssets.length === 1 ? "investment" : "investments"}
        </p>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X aria-hidden="true" />Clear filters</Button>
        ) : null}
      </div>

      {filteredAssets.length ? (
        <section className="mt-3 overflow-hidden border-y border-border bg-surface" aria-label="Investment results">
          <div className="hidden grid-cols-[minmax(220px,1.7fr)_110px_80px_80px_90px_100px_80px_88px] items-center gap-3 border-b border-border bg-surface-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
            <span>Company</span><span className="text-right">Price</span><span className="text-right">1D</span><span className="text-right">P/E</span><span className="text-right">Growth</span><span>Risk</span><span className="text-right">Hype</span><span />
          </div>
          {filteredAssets.map((asset) => (
            <article key={asset.symbol} className="group border-b border-border px-4 py-4 last:border-b-0 hover:bg-surface-muted/70 lg:grid lg:grid-cols-[minmax(220px,1.7fr)_110px_80px_80px_90px_100px_80px_88px] lg:items-center lg:gap-3 lg:py-3">
              <Link href={`/asset/${asset.symbol}`} className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <p className="truncate text-sm font-semibold">{asset.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{asset.symbol} · {asset.sector}</p>
              </Link>
              <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3 lg:contents">
                <Cell label="Price" value={formatInr(asset.price)} />
                <Cell label="1D" value={formatPercent(asset.dailyChange)} tone={asset.dailyChange >= 0 ? "positive" : "negative"} />
                <Cell label="P/E" value={asset.pe.toFixed(1)} />
                <Cell label="Growth" value={`${asset.growthScore}/100`} />
                <div><dt className="text-xs text-muted-foreground lg:hidden">Risk</dt><dd className="mt-1 lg:mt-0"><RiskBadge level={asset.riskLevel} /></dd></div>
                <Cell label="Hype" value={`${asset.hypeScore}/100`} />
              </dl>
              <div className="mt-4 flex items-center justify-between gap-2 lg:mt-0 lg:justify-end">
                <WatchlistButton symbol={asset.symbol} compact />
                <Link href={`/asset/${asset.symbol}`} aria-label={`Open ${asset.name}`} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowRight className="size-4" /></Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="mt-3"><EmptyState title="No investments match this view" description="Broaden your search or remove one of the filters." actionLabel="Clear filters" onAction={clearFilters} /></div>
      )}
    </main>
  );
}

function Filter({ label, value, onChange, options, optionLabels }: { label: string; value: string; onChange: (value: string) => void; options: string[]; optionLabels?: string[] }) {
  return (
    <label className="block text-xs font-medium text-muted-foreground">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`${controlClass} mt-1.5 text-foreground`}>
        {options.map((option, index) => <option key={option} value={option}>{optionLabels?.[index] ?? option}</option>)}
      </select>
    </label>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="min-w-0 lg:text-right">
      <dt className="text-xs text-muted-foreground lg:hidden">{label}</dt>
      <dd className={cn("mt-1 truncate font-mono text-sm tabular-nums lg:mt-0", tone === "positive" && "text-success", tone === "negative" && "text-danger")}>{value}</dd>
    </div>
  );
}
