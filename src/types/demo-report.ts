export interface DemoReportMetrics {
  revenueGrowth: number;
  profitGrowth: number;
  debtGrowth: number;
  operatingCashFlowGrowth: number;
  profitMargin: number;
  debtToEquity: number;
}

export interface DemoReport {
  reportTitle: string;
  companyName: string;
  isDemonstration: boolean;
  disclaimer: string;
  periodLabel: string;
  metrics: DemoReportMetrics;
  positiveSignals: string[];
  risks: string[];
}
