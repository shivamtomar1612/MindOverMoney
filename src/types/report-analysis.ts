export type ReportSignalStatus = "Strong" | "Healthy" | "Moderate" | "Watch" | "Needs data";

export interface ReportSignal {
  status: ReportSignalStatus;
  detail: string;
}

export interface ReportAnalysis {
  reportTitle: string;
  companyName: string;
  periodLabel?: string;
  overallHealth: number;
  executiveSummary: string;
  beginnerExplanation: string;
  revenue: ReportSignal;
  profitability: ReportSignal;
  cashFlow: ReportSignal;
  debt: ReportSignal;
  margins: ReportSignal;
  positiveSignals: string[];
  risks: string[];
  redFlags: string[];
  isDemonstration: boolean;
  disclaimer: string;
  source: "demo" | "uploaded";
}
