import { cn } from "@/lib/utils";

type ScoreBarProps = {
  label: string;
  score: number;
  className?: string;
  tone?: "primary" | "amber" | "rose" | "blue";
  description?: string;
};

const toneStyles = {
  primary: "bg-primary",
  amber: "bg-warning",
  rose: "bg-danger",
  blue: "bg-primary",
};

export function ScoreBar({ label, score, className, tone = "primary", description }: ScoreBarProps) {
  const boundedScore = Math.max(0, Math.min(100, score));

  return (
    <div className={className}>
      <div className="mb-2 flex items-start justify-between gap-3 text-sm">
        <span><span className="block font-medium text-foreground">{label}</span>{description && <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{description}</span>}</span>
        <span className="shrink-0 font-mono font-semibold text-foreground">{boundedScore}<span className="font-normal text-muted-foreground"> / 100</span></span>
      </div>
      <div className="h-1.5 overflow-hidden bg-surface-muted">
        <div
          className={cn("h-full transition-[width] duration-200", toneStyles[tone])}
          style={{ width: `${boundedScore}%` }}
        />
      </div>
    </div>
  );
}
