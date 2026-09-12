import demoReportJson from "../../data/demo-report.json" with { type: "json" };
import type { DemoReport } from "../../types/demo-report";
import type { ReportAnalysis, ReportSignal, ReportSignalStatus } from "../../types/report-analysis";

const demoReport = demoReportJson as DemoReport;

const round = (value: number) => Math.round(value * 10) / 10;

function statusForGrowth(value: number | undefined, strongAt = 10): ReportSignalStatus {
  if (value === undefined || Number.isNaN(value)) return "Needs data";
  if (value >= strongAt) return "Strong";
  if (value >= 0) return "Healthy";
  return "Watch";
}

function makeSignal(status: ReportSignalStatus, detail: string): ReportSignal {
  return { status, detail };
}

export function getDemoReportAnalysis(report: DemoReport = demoReport): ReportAnalysis {
  const { metrics } = report;
  return {
    reportTitle: report.reportTitle,
    companyName: report.companyName,
    periodLabel: report.periodLabel,
    overallHealth: 78,
    executiveSummary:
      "The company is growing at a healthy pace and generating positive cash flow. However, debt and margin stability should be monitored.",
    beginnerExplanation:
      "The company is growing at a healthy pace and generating positive cash flow. However, debt and margin stability should be monitored.",
    revenue: makeSignal(
      statusForGrowth(metrics.revenueGrowth),
      `Revenue growth is ${round(metrics.revenueGrowth)}% in this demonstration report.`,
    ),
    profitability: makeSignal(
      metrics.profitGrowth >= 15 ? "Strong" : statusForGrowth(metrics.profitGrowth),
      `Profit growth is ${round(metrics.profitGrowth)}%, with a reported profit margin of ${round(metrics.profitMargin)}%.`,
    ),
    cashFlow: makeSignal(
      metrics.operatingCashFlowGrowth >= 0 ? "Healthy" : "Watch",
      `Operating cash flow growth is ${round(metrics.operatingCashFlowGrowth)}% and remains positive in this fictional report.`,
    ),
    debt: makeSignal(
      metrics.debtGrowth > metrics.revenueGrowth || metrics.debtToEquity >= 0.7 ? "Moderate" : "Healthy",
      `Debt growth is ${round(metrics.debtGrowth)}% and debt-to-equity is ${round(metrics.debtToEquity)}.`,
    ),
    margins: makeSignal(
      metrics.profitMargin >= 15 ? "Healthy" : "Watch",
      `Profit margin is ${round(metrics.profitMargin)}%; the report notes that recent improvement should be monitored.`,
    ),
    positiveSignals: report.positiveSignals,
    risks: report.risks,
    redFlags: [
      "Debt is growing faster than revenue and operating cash flow.",
      "Margin improvement is still modest and could reverse if costs rise.",
    ],
    isDemonstration: true,
    disclaimer: report.disclaimer,
    source: "demo",
  };
}

function firstNumber(text: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = Number(match[1].replace(/,/g, ""));
      if (Number.isFinite(value)) return value;
    }
  }
  return undefined;
}

function signalOrMissing(label: string, value: number | undefined, status: ReportSignalStatus, unit = "%"): ReportSignal {
  if (value === undefined) return makeSignal("Needs data", `No clear ${label.toLowerCase()} figure was found in the extracted text.`);
  return makeSignal(status, `${label} is ${round(value)}${unit} in the extracted report text.`);
}

export function analyzeReportText(text: string): ReportAnalysis {
  const normalized = text.replace(/\s+/g, " ").trim();
  const revenueGrowth = firstNumber(normalized, [/revenue(?: growth)?[^\d-]*(-?\d+(?:\.\d+)?)\s*%/i]);
  const profitGrowth = firstNumber(normalized, [/profit(?: growth)?[^\d-]*(-?\d+(?:\.\d+)?)\s*%/i]);
  const debtGrowth = firstNumber(normalized, [/debt(?: growth)?[^\d-]*(-?\d+(?:\.\d+)?)\s*%/i]);
  const cashFlowGrowth = firstNumber(normalized, [/(?:operating )?cash flow(?: growth)?[^\d-]*(-?\d+(?:\.\d+)?)\s*%/i]);
  const profitMargin = firstNumber(normalized, [/profit margin[^\d-]*(-?\d+(?:\.\d+)?)\s*%/i]);
  const debtToEquity = firstNumber(normalized, [/debt[- ]to[- ]equity[^\d-]*(-?\d+(?:\.\d+)?)/i]);

  const available = [revenueGrowth, profitGrowth, debtGrowth, cashFlowGrowth, profitMargin, debtToEquity].filter(
    (value) => value !== undefined,
  ).length;
  const overallHealth = available === 0
    ? 50
    : Math.max(0, Math.min(100, Math.round(
        50 +
          (revenueGrowth ?? 0) * 0.8 +
          (profitGrowth ?? 0) * 0.6 +
          (cashFlowGrowth ?? 0) * 0.4 -
          Math.max(0, (debtGrowth ?? 0) - (revenueGrowth ?? 0)) * 0.35 -
          Math.max(0, 15 - (profitMargin ?? 15)) * 0.4,
      )));

  const summary = available === 0
    ? "The extracted text did not provide enough financial metrics for a reliable summary. Review the original report or try the demonstration report."
    : "The extracted report contains a mix of growth and financial-health signals. This educational summary highlights only the figures found in the document and leaves missing areas for further review.";

  return {
    reportTitle: "Uploaded financial report",
    companyName: "Company name not identified",
    overallHealth,
    executiveSummary: summary,
    beginnerExplanation: summary,
    revenue: signalOrMissing("Revenue growth", revenueGrowth, statusForGrowth(revenueGrowth)),
    profitability: signalOrMissing("Profit growth", profitGrowth, profitGrowth === undefined ? "Needs data" : profitGrowth >= 15 ? "Strong" : statusForGrowth(profitGrowth)),
    cashFlow: signalOrMissing("Operating cash flow growth", cashFlowGrowth, cashFlowGrowth !== undefined && cashFlowGrowth >= 0 ? "Healthy" : "Watch"),
    debt: signalOrMissing("Debt growth", debtGrowth, debtGrowth !== undefined && debtGrowth > (revenueGrowth ?? 0) ? "Moderate" : debtGrowth === undefined ? "Needs data" : "Healthy"),
    margins: signalOrMissing("Profit margin", profitMargin, profitMargin !== undefined && profitMargin >= 15 ? "Healthy" : profitMargin === undefined ? "Needs data" : "Watch"),
    positiveSignals: revenueGrowth !== undefined || profitGrowth !== undefined || cashFlowGrowth !== undefined
      ? ["Only figures present in the extracted text are used in this interpretation."]
      : [],
    risks: debtGrowth !== undefined && debtGrowth > (revenueGrowth ?? 0) ? ["Debt growth is higher than the revenue growth figure found in the report."] : [],
    redFlags: available < 3 ? ["Several core metrics were not identified in the extracted text."] : [],
    isDemonstration: false,
    disclaimer: "AI-generated interpretation for education only. It is based only on the text extracted from this upload and is not investment advice.",
    source: "uploaded",
  };
}
