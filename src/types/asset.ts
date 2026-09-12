export type AssetRiskLevel = "Low" | "Moderate" | "High";
export type AssetHypeLevel = "Low" | "Moderate" | "High";

export interface Asset {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  dailyChange: number;
  marketCapCr: number;
  pe: number;
  eps: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  profitMargin: number;
  revenueGrowth: number;
  profitGrowth: number;
  dividendYield: number;
  beta: number;
  volatility: number;
  fundamentalScore: number;
  riskScore: number;
  hypeScore: number;
  growthScore: number;
  financialHealthScore: number;
  valuationScore: number;
  riskLevel: AssetRiskLevel;
  hypeLevel: AssetHypeLevel;
}

export interface AssetDataset {
  disclaimer: string;
  assets: Asset[];
}
