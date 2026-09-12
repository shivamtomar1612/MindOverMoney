"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MetricExplanation } from "@/types";

export function MetricExplainer({ metric, onClose }: { metric: MetricExplanation | null; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!metric) return;
    const handleKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [metric, onClose]);

  if (!metric) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-foreground/20" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside role="dialog" aria-modal="true" aria-labelledby="metric-explainer-title" className="h-full w-full max-w-[440px] overflow-y-auto border-l border-border bg-surface p-6 shadow-[0_0_32px_rgba(24,33,28,.12)] sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Metric explainer</p><h2 id="metric-explainer-title" className="mt-2 text-2xl font-semibold">{metric.label}</h2></div>
          <Button ref={closeButtonRef} variant="ghost" size="icon" onClick={onClose} aria-label="Close metric explanation"><X aria-hidden="true" /></Button>
        </div>
        <div className="divide-y divide-border">
          <ExplainerSection title="What it means" body={metric.whatItMeans} />
          <ExplainerSection title="Why it matters" body={metric.whyItMatters} />
          <ExplainerSection title="Beginner takeaway" body={metric.beginnerTakeaway} accent />
        </div>
        <p className="border-t border-border pt-5 text-xs leading-5 text-muted-foreground">Educational interpretation of demo data. This is not personalized financial advice.</p>
      </aside>
    </div>
  );
}

function ExplainerSection({ title, body, accent = false }: { title: string; body: string; accent?: boolean }) {
  return <section className="py-6"><h3 className={`text-sm font-semibold ${accent ? "text-primary" : "text-foreground"}`}>{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p></section>;
}
