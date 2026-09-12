import { ReportAnalyzer } from "@/components/analysis/report-analyzer";
import { getDemoReport } from "@/lib/data/demo-data";
import { getDemoReportAnalysis } from "@/lib/ai/report-fallback";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report Analyzer",
  description: "Turn a financial report into a beginner-friendly educational explanation.",
};

export default function AnalyzePage() {
  return <ReportAnalyzer demoReport={getDemoReportAnalysis(getDemoReport())} />;
}
