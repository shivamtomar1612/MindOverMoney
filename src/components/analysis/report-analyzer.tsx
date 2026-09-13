"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Check, FileText, Loader2, Upload } from "lucide-react";

import { ChatbotButton } from "@/components/ai/ChatbotButton";
import { PageHeader } from "@/components/product/page-header";
import { StatusBadge } from "@/components/product/status-badge";
import { Button } from "@/components/ui/button";
import { useFinancialChatbot } from "@/hooks/useFinancialChatbot";
import type { ReportAnalysis, ReportSignal } from "@/types/report-analysis";

const MAX_REPORT_SIZE = 10 * 1024 * 1024;

export function ReportAnalyzer({ demoReport }: { demoReport: ReportAnalysis }) {
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openFinancialChatbot } = useFinancialChatbot();

  function reportContextData(current: ReportAnalysis | null): Record<string, unknown> {
    if (!current) return {};
    return {
      company: current.companyName,
      report: current.reportTitle,
      period: current.periodLabel,
      overallHealth: current.overallHealth,
      revenue: current.revenue,
      profitability: current.profitability,
      cashFlow: current.cashFlow,
      debt: current.debt,
      margins: current.margins,
      positiveSignals: current.positiveSignals,
      risks: current.risks,
      redFlags: current.redFlags,
      source: current.source,
    };
  }

  function openReportSection(label: string, detail: string, data?: Record<string, unknown>) {
    openFinancialChatbot({ type: "report", title: label, description: detail, data: { ...reportContextData(analysis), ...data }, userLevel: "Beginner" });
  }

  async function uploadReport(file: File) {
    setError(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) { setError("Please upload a PDF file only."); return; }
    if (file.size > MAX_REPORT_SIZE) { setError("This PDF is larger than the 10 MB limit."); return; }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const extractionResponse = await fetch("/api/report-extract", { method: "POST", body: formData });
      const extraction = (await extractionResponse.json()) as { text?: string; error?: string };
      if (!extractionResponse.ok || !extraction.text) throw new Error(extraction.error || "We couldn't analyze this document. You can try the demo report instead.");
      const response = await fetch("/api/report-analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: extraction.text }) });
      const result = (await response.json()) as ReportAnalysis & { error?: string };
      if (!response.ok || !result.revenue) throw new Error(result.error || "We couldn't analyze this document. You can try the demo report instead.");
      setAnalysis(result);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "We couldn't analyze this document. You can try the demo report instead.";
      setError(message.includes("API") ? "We couldn't analyze this document. You can try the demo report instead." : message);
    } finally {
      setIsLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <main className="page-container">
      <PageHeader eyebrow="Reports" title="Analyze a financial report" description="Turn reported financial information into a structured, beginner-friendly review." />

      <ol className="mt-7 grid border-y border-border bg-surface sm:grid-cols-3" aria-label="Report analysis process">
        {["Upload document", "Processing", "Financial summary"].map((label, index) => <li key={label} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><span className="font-mono text-xs text-primary">0{index + 1}</span><span className="text-sm font-medium">{label}</span></li>)}
      </ol>

      <section className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="border-t border-border pt-5"><Upload className="size-5 text-primary" aria-hidden="true" /><h2 className="mt-4 text-lg font-semibold">Upload document</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">PDF only, up to 10 MB. The server extracts text before the existing analysis layer reviews it.</p><input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadReport(file); }} /><Button className="mt-5" onClick={() => inputRef.current?.click()} disabled={isLoading}>{isLoading ? <><Loader2 className="animate-spin" aria-hidden="true" />Reading report…</> : <><Upload aria-hidden="true" />Choose PDF</>}</Button></div>
        <div className="border-t border-border pt-5"><FileText className="size-5 text-primary" aria-hidden="true" /><h2 className="mt-4 text-lg font-semibold">Try the demo report</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Load Demo Manufacturing Ltd. to see the full workflow without an upload or AI key.</p><Button variant="outline" className="mt-5" onClick={() => { setError(null); setAnalysis(demoReport); }} disabled={isLoading}>Try Demo Report</Button></div>
      </section>

      {error && <div className="mt-6 flex items-start justify-between gap-4 border border-danger/20 bg-danger/5 p-4 text-sm text-danger" role="alert"><span className="flex gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{error}</span><Button size="sm" variant="outline" onClick={() => { setError(null); setAnalysis(demoReport); }}>Use Demo Data</Button></div>}

      {isLoading && <LoadingAnalysis />}

      {analysis && !isLoading && (
        <section className="mt-12 animate-enter" aria-live="polite">
          <div className="flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><StatusBadge tone="accent">{analysis.source === "demo" ? "Demonstration report" : "Uploaded report"}</StatusBadge><span className="text-xs text-muted-foreground">Educational interpretation</span></div><h2 className="mt-3 text-2xl font-semibold">{analysis.companyName}</h2><p className="mt-1 text-sm text-muted-foreground">{analysis.reportTitle}{analysis.periodLabel ? ` · ${analysis.periodLabel}` : ""}</p></div><div className="sm:text-right"><p className="text-xs text-muted-foreground">Overall financial health</p><p className="mt-1 font-mono text-3xl font-semibold tabular-nums">{analysis.overallHealth}<span className="text-sm font-normal text-muted-foreground"> / 100</span></p></div></div>

          <div className="mt-6 overflow-hidden border-y border-border bg-surface"><div className="hidden grid-cols-[160px_110px_1fr_170px] gap-4 border-b border-border bg-surface-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid"><span>Area</span><span>Status</span><span>Interpretation</span><span /></div>{[
            ["Revenue", analysis.revenue], ["Profitability", analysis.profitability], ["Cash Flow", analysis.cashFlow], ["Debt", analysis.debt], ["Margins", analysis.margins],
          ].map(([label, signal]) => <ReportRow key={String(label)} label={String(label)} signal={signal as ReportSignal} onAsk={() => openReportSection(String(label), (signal as ReportSignal).detail)} />)}</div>

          <section className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Executive summary</p><p className="mt-3 text-lg leading-8">{analysis.executiveSummary}</p><h3 className="mt-7 text-sm font-semibold">Beginner explanation</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{analysis.beginnerExplanation}</p><div className="mt-4"><ChatbotButton label="Ask about this report" context={{ type: "report", title: "Executive Summary", description: analysis.executiveSummary, data: reportContextData(analysis), userLevel: "Beginner" }} /></div></div><div className="border-l-0 border-border lg:border-l lg:pl-8"><h3 className="text-sm font-semibold">Red flags</h3><BulletList items={analysis.redFlags} empty="No red flags were identified in the available report text." tone="warning" /><button type="button" onClick={() => openReportSection("Red Flags", analysis.redFlags.join(" "))} className="mt-4 text-sm font-medium text-primary hover:underline">Ask about red flags</button></div></section>

          <div className="mt-10 grid gap-8 border-t border-border pt-8 md:grid-cols-3"><ReportList title="Positive signals" items={analysis.positiveSignals} empty="No positive signals were identified." onAsk={() => openReportSection("Positive Signals", analysis.positiveSignals.join(" "))} /><ReportList title="Risks to review" items={analysis.risks} empty="No specific risks were identified." onAsk={() => openReportSection("Risks", analysis.risks.join(" "))} warning /><ReportList title="Questions to investigate" items={analysis.risks.slice(0, 3).map((risk) => `What evidence would confirm or reduce this concern: ${risk}`)} empty="Review the source report for missing context." /></div>
          <p className="mt-8 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">{analysis.disclaimer} This tool simplifies reported information for learning and does not make investment recommendations.</p>
        </section>
      )}
    </main>
  );
}

function ReportRow({ label, signal, onAsk }: { label: string; signal: ReportSignal; onAsk: () => void }) { const tone = signal.status === "Strong" || signal.status === "Healthy" ? "success" : signal.status === "Needs data" ? "neutral" : "warning"; return <article className="grid gap-3 border-b border-border px-4 py-4 last:border-0 md:grid-cols-[160px_110px_1fr_170px] md:items-center"><h3 className="text-sm font-semibold">{label}</h3><div><StatusBadge tone={tone}>{signal.status}</StatusBadge></div><p className="text-sm leading-6 text-muted-foreground">{signal.detail}</p><button type="button" onClick={onAsk} className="text-left text-sm font-medium text-primary hover:underline md:text-right">Ask about this section</button></article>; }

function BulletList({ items, empty, tone = "default" }: { items: string[]; empty: string; tone?: "default" | "warning" }) { return items.length ? <ul className="mt-4 divide-y divide-border border-y border-border">{items.map((item) => <li key={item} className="flex gap-3 py-3 text-sm leading-6 text-muted-foreground">{tone === "warning" ? <AlertTriangle className="mt-1 size-4 shrink-0 text-warning" aria-hidden="true" /> : <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />}<span>{item}</span></li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">{empty}</p>; }

function ReportList({ title, items, empty, warning = false, onAsk }: { title: string; items: string[]; empty: string; warning?: boolean; onAsk?: () => void }) { return <section><h3 className="text-base font-semibold">{title}</h3><BulletList items={items} empty={empty} tone={warning ? "warning" : "default"} />{onAsk && <button type="button" onClick={onAsk} className="mt-4 text-sm font-medium text-primary hover:underline">Ask about {title.toLowerCase()}</button>}</section>; }

function LoadingAnalysis() { return <div className="mt-10" aria-label="Processing report"><div className="h-6 w-56 animate-pulse bg-surface-muted" /><div className="mt-5 grid gap-3 md:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-24 animate-pulse border border-border bg-surface-muted" />)}</div></div>; }
