import type { ReportAnalysis } from "../../types/report-analysis";

export const REPORT_ANALYZER_INSTRUCTIONS = `You are a financial education assistant for beginners. Analyze only the provided extracted report text. Do not invent facts, figures, company names, or recommendations. Never promise returns or give buy/sell instructions. Return only valid JSON matching the requested shape. If a metric is missing, say that it is missing. Keep the language concise and label the interpretation educational.`;

export function buildReportAnalysisPrompt(text: string): string {
  return `Create a beginner-friendly report analysis from this extracted text. Use this exact JSON shape: {"reportTitle":string,"companyName":string,"overallHealth":number,"executiveSummary":string,"beginnerExplanation":string,"revenue":{"status":string,"detail":string},"profitability":{"status":string,"detail":string},"cashFlow":{"status":string,"detail":string},"debt":{"status":string,"detail":string},"margins":{"status":string,"detail":string},"positiveSignals":string[],"risks":string[],"redFlags":string[]}. Status should be one of Strong, Healthy, Moderate, Watch, Needs data. Do not add numeric facts that are absent.\n\nEXTRACTED REPORT TEXT:\n${text.slice(0, 120000)}`;
}

export function normalizeReportModelOutput(value: unknown): ReportAnalysis {
  if (!value || typeof value !== "object") throw new Error("Invalid report analysis");
  const candidate = value as Record<string, unknown>;
  const signalKeys = ["revenue", "profitability", "cashFlow", "debt", "margins"] as const;
  const isSignal = (entry: unknown): entry is { status: string; detail: string } => {
    if (!entry || typeof entry !== "object") return false;
    const signal = entry as Record<string, unknown>;
    return typeof signal.status === "string" && typeof signal.detail === "string";
  };
  if (
    typeof candidate.reportTitle !== "string" ||
    typeof candidate.companyName !== "string" ||
    typeof candidate.overallHealth !== "number" ||
    typeof candidate.executiveSummary !== "string" ||
    typeof candidate.beginnerExplanation !== "string" ||
    !signalKeys.every((key) => isSignal(candidate[key])) ||
    !["positiveSignals", "risks", "redFlags"].every((key) => Array.isArray(candidate[key]) && (candidate[key] as unknown[]).every((item) => typeof item === "string"))
  ) throw new Error("Incomplete report analysis");

  return {
    reportTitle: candidate.reportTitle,
    companyName: candidate.companyName,
    overallHealth: Math.max(0, Math.min(100, Math.round(candidate.overallHealth))),
    executiveSummary: candidate.executiveSummary,
    beginnerExplanation: candidate.beginnerExplanation,
    revenue: candidate.revenue as ReportAnalysis["revenue"],
    profitability: candidate.profitability as ReportAnalysis["profitability"],
    cashFlow: candidate.cashFlow as ReportAnalysis["cashFlow"],
    debt: candidate.debt as ReportAnalysis["debt"],
    margins: candidate.margins as ReportAnalysis["margins"],
    positiveSignals: candidate.positiveSignals as string[],
    risks: candidate.risks as string[],
    redFlags: candidate.redFlags as string[],
    isDemonstration: false,
    disclaimer: "AI-generated interpretation for education only. It is not investment advice.",
    source: "uploaded",
  };
}
