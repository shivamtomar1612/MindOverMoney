import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ icon: Icon, title, description, action, actionLabel, actionHref, onAction }: { icon?: LucideIcon; title: string; description: string; action?: ReactNode; actionLabel?: string; actionHref?: string; onAction?: () => void }) {
  return (
    <div className="border border-dashed border-border bg-surface-muted/45 px-5 py-10 text-center">
      {Icon && <Icon className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />}
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
      {!action && actionLabel && actionHref && <Link href={actionHref} className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{actionLabel}</Link>}
      {!action && actionLabel && onAction && <button type="button" onClick={onAction} className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{actionLabel}</button>}
    </div>
  );
}
