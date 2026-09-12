export type MetricKey =
  | "pe"
  | "eps"
  | "roe"
  | "roce"
  | "debtToEquity"
  | "profitMargin"
  | "revenueGrowth"
  | "profitGrowth"
  | "dividendYield"
  | "beta"
  | "volatility"
  | "marketCapCr";

export interface MetricExplanation {
  key: MetricKey;
  label: string;
  shortExplanation: string;
  whatItMeans: string;
  whyItMatters: string;
  beginnerTakeaway: string;
}
