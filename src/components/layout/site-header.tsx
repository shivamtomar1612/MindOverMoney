import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-md bg-foreground text-[11px] font-semibold tracking-tight text-white">M/M</span>
      {!compact && <span className="text-sm font-semibold tracking-[-0.01em]">Mind Over Money</span>}
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Mind Over Money home"><Wordmark /></Link>
        <nav className="flex items-center gap-2" aria-label="Public navigation">
          <Link href="/learn" className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground sm:inline-flex">Learn</Link>
          <Link href="/login" className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground sm:inline-flex">Log in</Link>
          <Link href="/explore" className={cn(buttonVariants({ size: "sm" }), "h-9")}>Start exploring</Link>
        </nav>
      </div>
    </header>
  );
}
