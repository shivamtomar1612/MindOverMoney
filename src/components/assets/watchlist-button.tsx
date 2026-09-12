"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/use-watchlist";
import { cn } from "@/lib/utils";

type WatchlistButtonProps = {
  symbol: string;
  compact?: boolean;
};

export function WatchlistButton({ symbol, compact = false }: WatchlistButtonProps) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(symbol);

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "icon" : "default"}
      className={cn(
        "border-border bg-surface hover:border-primary/30",
        !compact && "h-9 px-3.5",
        watched && "border-warning/25 bg-warning/8 text-warning",
      )}
      aria-label={`${watched ? "Remove" : "Add"} ${symbol} ${watched ? "from" : "to"} watchlist`}
      aria-pressed={watched}
      onClick={() => toggle(symbol)}
    >
      <Star className={cn("size-4", watched && "fill-current")} aria-hidden="true" />
      {!compact && (watched ? "Watching" : "Add to watchlist")}
    </Button>
  );
}
