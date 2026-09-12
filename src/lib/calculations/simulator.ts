import type {
  DecisionReadinessInputs,
  DecisionReadinessResult,
  ReadinessBreakdown,
} from "@/types";

export const DECISION_READINESS_WEIGHTS: ReadinessBreakdown = {
  riskUnderstanding: 0.25,
  fundamentalUnderstanding: 0.25,
  timeHorizon: 0.15,
  volatilityAwareness: 0.15,
  reasonForInvestment: 0.1,
  hypeAwareness: 0.1,
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const knowledgeScores = {
  "Not at all": 39,
  "A little": 60,
  Mostly: 80,
  "Very well": 100,
} as const;

const horizonScores = {
  "< 1 year": 45,
  "1–3 years": 65,
  "3–5 years": 82,
  "5+ years": 100,
} as const;

const reasonScores = {
  "Social media": 40,
  "Friend recommended it": 40,
  News: 60,
  Research: 85,
  "Long-term plan": 100,
  Other: 55,
} as const;

export function calculateDecisionReadiness(inputs: DecisionReadinessInputs): DecisionReadinessResult {
  const breakdown: ReadinessBreakdown = {
    riskUnderstanding: clamp(knowledgeScores[inputs.knowledge] + (inputs.reviewed.risk ? 20 : 0)),
    fundamentalUnderstanding: inputs.reviewed.fundamentals ? 100 : 35,
    timeHorizon: horizonScores[inputs.horizon],
    volatilityAwareness: inputs.volatilityTolerance === "Low" ? 90 : inputs.volatilityTolerance === "Moderate" ? 75 : 60,
    reasonForInvestment: reasonScores[inputs.reason],
    hypeAwareness: inputs.reviewed.hype ? (inputs.reason === "Social media" || inputs.reason === "Friend recommended it" ? 100 : 85) : 35,
  };

  const score = clamp(
    breakdown.riskUnderstanding * DECISION_READINESS_WEIGHTS.riskUnderstanding +
      breakdown.fundamentalUnderstanding * DECISION_READINESS_WEIGHTS.fundamentalUnderstanding +
      breakdown.timeHorizon * DECISION_READINESS_WEIGHTS.timeHorizon +
      breakdown.volatilityAwareness * DECISION_READINESS_WEIGHTS.volatilityAwareness +
      breakdown.reasonForInvestment * DECISION_READINESS_WEIGHTS.reasonForInvestment +
      breakdown.hypeAwareness * DECISION_READINESS_WEIGHTS.hypeAwareness,
  );

  return { score, breakdown, weights: DECISION_READINESS_WEIGHTS };
}
