import Link from "next/link";

import { Wordmark } from "@/components/layout/site-header";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1fr_auto] md:items-start lg:px-8">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-2xl text-xs leading-5 text-muted-foreground">Mind Over Money provides educational insights and simulated analysis. It does not provide personalized financial advice or execute trades.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground" aria-label="Footer navigation">
          <Link className="hover:text-foreground" href="/explore">Explore</Link>
          <Link className="hover:text-foreground" href="/analyze">Reports</Link>
          <Link className="hover:text-foreground" href="/learn">Learn</Link>
        </nav>
      </div>
    </footer>
  );
}
