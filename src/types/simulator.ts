import type { Asset } from "./asset";

export type SimulatorReason =
  | "Social media"
  | "Friend recommended it"
  | "News"
  | "Research"
  | "Long-term plan"
  | "Other";

export type HoldingHorizon = "< 1 year" | "1–3 years" | "3–5 years" | "5+ years";
export type VolatilityTolerance = "Low" | "Moderate" | "High";
export type InvestmentKnowledge = "Not at all" | "A little" | "Mostly" | "Very well";

export interface SimulatorReviewState {
  risk: boolean;
  fundamentals: boolean;
  valuation: boolean;
  growth: boolean;
  hype: boolean;
}

export interface DecisionReadinessInputs {
  asset: Asset;
  reason: SimulatorReason;
  horizon: HoldingHorizon;
  volatilityTolerance: VolatilityTolerance;
  knowledge: InvestmentKnowledge;
  reviewed: SimulatorReviewState;
}

export interface ReadinessBreakdown {
  riskUnderstanding: number;
  fundamentalUnderstanding: number;
  timeHorizon: number;
  volatilityAwareness: number;
  reasonForInvestment: number;
  hypeAwareness: number;
}

export interface DecisionReadinessResult {
  score: number;
  breakdown: ReadinessBreakdown;
  weights: ReadinessBreakdown;
}
