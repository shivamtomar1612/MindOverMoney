import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-border bg-surface-muted text-muted-foreground",
  success: "border-success/20 bg-success/8 text-success",
  warning: "border-warning/25 bg-warning/8 text-warning",
  danger: "border-danger/25 bg-danger/8 text-danger",
  accent: "border-primary/20 bg-accent text-primary",
};

export function StatusBadge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: keyof typeof tones; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}
