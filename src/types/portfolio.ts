export type PortfolioRiskLevel = "LOW" | "MODERATE" | "HIGH" | "VERY HIGH";

export interface PortfolioHolding {
  symbol: string;
  amountInvested: number;
}

export interface PaperPortfolioState {
  startingBalance: number;
  holdings: PortfolioHolding[];
}

export interface PortfolioHoldingView extends PortfolioHolding {
  name: string;
  sector: string;
  currentValue: number;
  weight: number;
  simulatedReturn: number;
  simulatedReturnPct: number;
  riskScore: number;
  riskLevel: PortfolioRiskLevel;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  weight: number;
}

export interface PortfolioSummary {
  cash: number;
  invested: number;
  portfolioValue: number;
  totalBalance: number;
  profitLoss: number;
  profitLossPct: number;
  portfolioRisk: number;
  portfolioRiskLevel: PortfolioRiskLevel;
  diversification: number;
  holdings: PortfolioHoldingView[];
  sectorAllocation: SectorAllocation[];
}

export const PAPER_PORTFOLIO_STARTING_BALANCE = 100_000;
