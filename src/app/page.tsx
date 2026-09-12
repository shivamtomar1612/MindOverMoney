import Link from "next/link";
import { ArrowRight, Check, FileSearch, Gauge, GraduationCap } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getAllAssets } from "@/lib/data";
import { cn } from "@/lib/utils";
import { formatInr, formatPercent } from "@/lib/utils/format";

const principles = [
  { title: "Understand", copy: "Plain-language explanations for financial metrics and company reports.", icon: GraduationCap },
  { title: "Compare", copy: "See fundamentals, valuation, hype and risk in the same decision frame.", icon: FileSearch },
  { title: "Pause", copy: "A guided process that helps separate research from social pressure.", icon: Gauge },
];

export default function Home() {
  const assets = getAllAssets().filter((asset) => ["NIFTY50", "TCS", "ZOMATO"].includes(asset.symbol));

  return (
    <main>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Financial clarity for first-time investors</p>
            <h1 className="mt-4 text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Understand your investments before you act.</h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground">Mind Over Money turns unfamiliar metrics, risk signals and financial reports into practical explanations you can use to make a more informed decision.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/explore" className={cn(buttonVariants({ size: "lg" }), "h-11")}>Start exploring <ArrowRight /></Link>
              <Link href="#how-it-works" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}>See how it works</Link>
            </div>
            <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" />Educational decision support only. Demo data is simulated and not live.</p>
          </div>

          <div className="border border-border bg-background p-2 shadow-sm">
            <div className="border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div><p className="text-sm font-semibold">Market review</p><p className="text-xs text-muted-foreground">A clearer view of the signals</p></div>
                <span className="rounded-md border border-border bg-surface-muted px-2 py-1 text-[11px] text-muted-foreground">Demo data</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-border bg-surface-muted/60 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <span>Company</span><span>Price</span><span>1D</span>
              </div>
              {assets.map((asset) => (
                <div key={asset.symbol} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                  <div className="min-w-0"><p className="text-sm font-semibold">{asset.symbol}</p><p className="truncate text-xs text-muted-foreground">{asset.name}</p></div>
                  <span className="text-sm font-medium tabular-nums">{formatInr(asset.price)}</span>
                  <span className={cn("w-16 text-right text-sm font-medium tabular-nums", asset.dailyChange >= 0 ? "text-success" : "text-danger")}>{formatPercent(asset.dailyChange)}</span>
                </div>
              ))}
              <div className="grid gap-5 border-t border-border bg-surface-muted/35 p-4 sm:grid-cols-3">
                <div><p className="text-xs text-muted-foreground">Your risk profile</p><p className="mt-1 text-sm font-semibold">Conservative · 25/100</p></div>
                <div><p className="text-xs text-muted-foreground">Learning progress</p><p className="mt-1 text-sm font-semibold">42% · Beginner</p></div>
                <div><p className="text-xs text-muted-foreground">Paper capital</p><p className="mt-1 text-sm font-semibold tabular-nums">₹1,00,000</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em]">Information is useful only when it becomes understanding.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">We do not tell users what to buy. We help them understand what they are looking at, where uncertainty sits, and what deserves more research.</p>
          </div>
          <div className="border-t border-border">
            {principles.map(({ title, copy, icon: Icon }, index) => (
              <article key={title} className="grid grid-cols-[32px_1fr] gap-4 border-b border-border py-5">
                <div className="pt-0.5 text-primary"><Icon className="size-4" aria-hidden="true" /></div>
                <div className="grid gap-1 sm:grid-cols-[140px_1fr]"><h3 className="text-base font-semibold"><span className="mr-2 text-xs text-muted-foreground">0{index + 1}</span>{title}</h3><p className="text-sm leading-6 text-muted-foreground">{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-[1180px] gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem</p><p className="mt-2 text-sm leading-6">Financial platforms give beginners information. They do not always give them understanding.</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Solution</p><p className="mt-2 text-sm leading-6">Simple, personalized and explainable insights built around the questions beginners actually have.</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Discipline</p><p className="mt-2 text-sm leading-6">A structured pause between market attention and an investment decision.</p></div>
        </div>
      </section>
    </main>
  );
}
