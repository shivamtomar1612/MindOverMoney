"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, BookOpen, ChevronRight, ListChecks, WalletCards, X } from "lucide-react";

import { ChatbotButton } from "@/components/ai/ChatbotButton";
import { EmptyState } from "@/components/product/empty-state";
import { PageHeader, SectionHeader } from "@/components/product/page-header";
import { StatusBadge } from "@/components/product/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { usePaperPortfolio } from "@/hooks/use-paper-portfolio";
import { useProfile } from "@/hooks/use-profile";
import { useWatchlist } from "@/hooks/use-watchlist";
import { cn } from "@/lib/utils";
import { formatInr, formatPercent } from "@/lib/utils/format";
import type { Asset, DemoUser } from "@/types";

type DashboardContentProps = { user: DemoUser; marketAssets: Asset[]; allAssets: Asset[]; lessonCount: number };

function OverviewItem({ label, value, detail, href }: { label: string; value: string; detail: string; href: string }) {
  return (
    <Link href={href} className="group block px-5 py-4 transition-colors hover:bg-surface-muted/60">
      <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">{label}</p><ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" /></div>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
    </Link>
  );
}

function ReviewRow({ asset, signal, context }: { asset: Asset; signal: string; context: string }) {
  return (
    <Link href={`/asset/${asset.symbol.toLowerCase()}`} className="grid gap-2 border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-surface-muted/55 sm:grid-cols-[180px_1fr_auto] sm:items-center">
      <div><p className="text-sm font-semibold">{asset.name.replace(" Ltd.", "")}</p><p className="mt-0.5 text-xs text-muted-foreground">{asset.symbol}</p></div>
      <div><p className="text-sm font-medium">{signal}</p><p className="mt-0.5 text-xs text-muted-foreground">{context}</p></div>
      <span className="text-xs font-medium text-primary">Review</span>
    </Link>
  );
}

export function DashboardContent({ user, marketAssets, allAssets, lessonCount }: DashboardContentProps) {
  const { symbols, remove } = useWatchlist();
  const { summary } = usePaperPortfolio(allAssets);
  const { profile } = useProfile(user);
  const { summary: learning } = useLearningProgress(lessonCount, profile.literacyScore);
  const watchedAssets = allAssets.filter((asset) => symbols.includes(asset.symbol));
  const tata = allAssets.find((asset) => asset.symbol === "TATAMOTORS");
  const zomato = allAssets.find((asset) => asset.symbol === "ZOMATO");
  const tcs = allAssets.find((asset) => asset.symbol === "TCS");

  return (
    <main className="page-container">
      <PageHeader
        eyebrow="Dashboard"
        title={`Good evening, ${profile.name}`}
        description="Here’s your investing learning snapshot."
        action={<div className="flex flex-wrap items-center gap-2"><StatusBadge tone="neutral">Demo mode</StatusBadge><ChatbotButton label="Ask AI about this snapshot" context={{ type: "asset", title: "Your investing learning snapshot", description: "A concise view of your learning progress, risk profile and paper portfolio in the Mind Over Money demo.", data: { riskTolerance: profile.riskTolerance, riskScore: profile.riskScore, literacyScore: learning.score, portfolioValue: summary.totalBalance }, userLevel: "Beginner" }} /><Link href="/explore" className={cn(buttonVariants({ size: "sm" }), "h-9")}>Explore investments <ArrowRight /></Link></div>}
      />

      <section className="mt-6 overflow-hidden rounded-xl border border-border bg-surface" aria-label="Account overview">
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          <OverviewItem label="Risk profile" value={`${profile.riskTolerance} · ${profile.riskScore}`} detail="Selected comfort level" href="/profile" />
          <OverviewItem label="Financial literacy" value={`${learning.score}%`} detail={`${learning.level} · ${learning.completedLessons}/${learning.totalLessons} lessons`} href="/learn" />
          <OverviewItem label="Paper portfolio" value={formatInr(summary.totalBalance)} detail={summary.invested ? `${formatInr(summary.invested)} invested` : "₹1,00,000 starting capital"} href="/portfolio" />
          <OverviewItem label="Watchlist" value={`${watchedAssets.length} ${watchedAssets.length === 1 ? "company" : "companies"}`} detail="Saved for later review" href="/explore" />
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader title="Market snapshot" description="Illustrative prices from the offline demo dataset." action={<span className="text-xs text-muted-foreground">Demo market data — not live</span>} />
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="hidden grid-cols-[1.5fr_0.8fr_0.7fr_0.65fr_0.45fr] gap-4 border-b border-border bg-surface-muted/60 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Company</span><span className="text-right">Price</span><span className="text-right">Change</span><span className="text-right">Fundamentals</span><span className="text-right">Risk</span>
          </div>
          {marketAssets.map((asset) => (
            <Link key={asset.symbol} href={`/asset/${asset.symbol.toLowerCase()}`} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-surface-muted/55 sm:grid-cols-[1.5fr_0.8fr_0.7fr_0.65fr_0.45fr] sm:gap-4">
              <div className="min-w-0"><p className="text-sm font-semibold">{asset.symbol}</p><p className="truncate text-xs text-muted-foreground">{asset.name}</p></div>
              <div className="text-right"><p className="text-sm font-medium tabular-nums">{formatInr(asset.price)}</p><p className={cn("mt-0.5 text-xs tabular-nums sm:hidden", asset.dailyChange >= 0 ? "text-success" : "text-danger")}>{formatPercent(asset.dailyChange)}</p></div>
              <span className={cn("hidden text-right text-sm font-medium tabular-nums sm:block", asset.dailyChange >= 0 ? "text-success" : "text-danger")}>{formatPercent(asset.dailyChange)}</span>
              <span className="hidden text-right text-sm tabular-nums sm:block">{asset.fundamentalScore}/100</span>
              <span className="hidden text-right sm:block"><StatusBadge tone={asset.riskLevel === "Low" ? "success" : asset.riskLevel === "Moderate" ? "warning" : "danger"}>{asset.riskLevel}</StatusBadge></span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-9 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
        <section>
          <SectionHeader title="Things worth reviewing" description="Concise prompts based on the demo dataset—not recommendations." />
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
            {tata && <ReviewRow asset={tata} signal="Higher volatility" context={`Calculated risk should be compared with your ${profile.riskTolerance.toLowerCase()} profile.`} />}
            {zomato && <ReviewRow asset={zomato} signal="High valuation risk and attention" context="Hype proxy is materially above the fundamental score." />}
            {tcs && <ReviewRow asset={tcs} signal="Strong financial health" context="Review valuation alongside lower relative volatility." />}
          </div>
        </section>

        <section>
          <SectionHeader title="Watchlist" description="Companies saved for comparison." action={<Link href="/explore" className="text-xs font-medium text-primary">Add company</Link>} />
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
            {watchedAssets.length ? watchedAssets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
                <Link href={`/asset/${asset.symbol.toLowerCase()}`} className="min-w-0"><p className="text-sm font-semibold">{asset.symbol}</p><p className="truncate text-xs text-muted-foreground">{asset.name}</p></Link>
                <Button variant="ghost" size="icon-sm" onClick={() => remove(asset.symbol)} aria-label={`Remove ${asset.symbol} from watchlist`}><X /></Button>
              </div>
            )) : <EmptyState icon={Bookmark} title="No watchlist assets yet" description="Save companies here to compare them later." action={<Link href="/explore" className={buttonVariants({ variant: "outline", size: "sm" })}>Explore investments</Link>} />}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground"><p className="flex items-center gap-2"><BookOpen className="size-3.5" /> {learning.completedLessons} lessons complete</p><p className="flex items-center gap-2"><WalletCards className="size-3.5" /> {summary.holdings.length} holdings</p></div>
        </section>
      </div>

      <div className="mt-10 flex items-start gap-2 border-t border-border pt-4 text-xs leading-5 text-muted-foreground"><ListChecks className="mt-0.5 size-3.5 shrink-0" />Market values are simulated. Review prompts are educational and do not constitute investment advice.</div>
    </main>
  );
}
