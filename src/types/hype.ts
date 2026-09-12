import type { Asset } from "./asset";

export type HypeClassification =
  | "HIGH HYPE / MODERATE FUNDAMENTALS"
  | "MODERATE HYPE GAP"
  | "HYPE AND FUNDAMENTALS RELATIVELY ALIGNED";

export type HypeSignalKey =
  | "priceMomentum"
  | "volatility"
  | "trendProxy"
  | "newsAttentionProxy"
  | "retailInterestProxy";

export interface HypeSignal {
  key: HypeSignalKey;
  label: string;
  score: number;
  weight: number;
  description: string;
}

export interface HypeSnapshot {
  asset: Asset;
  hypeScore: number;
  fundamentalScore: number;
  riskScore: number;
  valuationScore: number;
  hypeGap: number;
  classification: HypeClassification;
  signals: HypeSignal[];
}
