import type { Asset } from "../../types/asset.ts";

export const RISK_WEIGHTS = {
  volatility: 0.3,
  beta: 0.2,
  debt: 0.15,
  profitability: 0.15,
  priceMovement: 0.1,
  marketSensitivity: 0.1,
} as const;

export type RiskFactorKey = keyof typeof RISK_WEIGHTS;
export type CalculatedRiskLevel = "LOW" | "MODERATE" | "HIGH" | "VERY HIGH";

export interface RiskFactor {
  key: RiskFactorKey;
  label: string;
  score: number;
  weight: number;
  contribution: number;
  explanation: string;
}

const clamp = (value: number, minimum = 0, maximum = 100) =>
  Math.min(maximum, Math.max(minimum, value));

const round = (value: number) => Math.round(value);

export function calculateRiskFactors(asset: Asset): RiskFactor[] {
  const profitabilityStrength = clamp(
    (asset.profitMargin / 20) * 40 +
      (asset.roe / 25) * 30 +
      (asset.roce / 30) * 30,
  );

  const factorInputs: Array<
    Omit<RiskFactor, "weight" | "contribution"> & { key: RiskFactorKey }
  > = [
    {
      key: "volatility",
      label: "Volatility",
      score: clamp((asset.volatility / 40) * 100),
      explanation: "Historical price variability, scaled so 40% volatility represents the top of the demo range.",
    },
    {
      key: "beta",
      label: "Beta exposure",
      score: clamp((asset.beta / 1.6) * 100),
      explanation: "How strongly the asset has tended to move with the broader market.",
    },
    {
      key: "debt",
      label: "Debt load",
      score: clamp((asset.debtToEquity / 1.5) * 100),
      explanation: "Balance-sheet pressure estimated from debt relative to shareholder equity.",
    },
    {
      key: "profitability",
      label: "Profitability risk",
      score: 100 - profitabilityStrength,
      explanation: "Lower margins, ROE, and ROCE increase this factor; stronger profitability reduces it.",
    },
    {
      key: "priceMovement",
      label: "Recent price movement",
      score: clamp((Math.abs(asset.dailyChange) / 3) * 100),
      explanation: "The magnitude of the demo daily move, regardless of whether it was positive or negative.",
    },
    {
      key: "marketSensitivity",
      label: "Market sensitivity",
      score: clamp(((asset.beta - 0.6) / 1) * 100),
      explanation: "Extra sensitivity above a relatively defensive beta baseline of 0.6.",
    },
  ];

  return factorInputs.map((factor) => {
    const weight = RISK_WEIGHTS[factor.key];
    const score = round(factor.score);

    return {
      ...factor,
      score,
      weight,
      contribution: Number((score * weight).toFixed(1)),
    };
  });
}

export function calculateRiskScore(asset: Asset): number {
  return round(
    calculateRiskFactors(asset).reduce(
      (total, factor) => total + factor.score * factor.weight,
      0,
    ),
  );
}

export function getRiskLevel(score: number): CalculatedRiskLevel {
  const normalizedScore = clamp(score);

  if (normalizedScore <= 30) return "LOW";
  if (normalizedScore <= 60) return "MODERATE";
  if (normalizedScore <= 80) return "HIGH";
  return "VERY HIGH";
}

export function calculateRiskCompatibility(userRisk: number, assetRisk: number): number {
  const userScore = clamp(userRisk);
  const assetScore = clamp(assetRisk);
  const difference = assetScore - userScore;
  const mismatchPenalty = difference > 0 ? difference * 1.5 : Math.abs(difference) * 0.5;

  return round(clamp(100 - mismatchPenalty));
}

export function getRiskExplanation(asset: Asset): string {
  const score = calculateRiskScore(asset);
  const level = getRiskLevel(score);
  const leadingFactors = calculateRiskFactors(asset)
    .filter((factor) => factor.score >= 50)
    .sort((first, second) => second.contribution - first.contribution)
    .slice(0, 2)
    .map((factor) => factor.label.toLocaleLowerCase("en-IN"));

  if (leadingFactors.length === 0) {
    return "Risk is lower because none of the measured factors is elevated in this demo model.";
  }

  const joinedFactors =
    leadingFactors.length === 1
      ? leadingFactors[0]
      : `${leadingFactors[0]} and ${leadingFactors[1]}`;
  const levelPhrase = level === "LOW" ? "contained" : level === "MODERATE" ? "moderate" : "elevated";

  return `Risk is ${levelPhrase} mainly because this asset has elevated ${joinedFactors}.`;
}

export function getCompatibilityExplanation(userRisk: number, assetRisk: number): string {
  const difference = assetRisk - userRisk;

  if (difference >= 30) {
    return "Your preferred risk level is considerably lower than this asset's current risk profile.";
  }
  if (difference >= 12) {
    return "This asset's risk is above your preferred level, so consider researching further.";
  }
  if (difference <= -20) {
    return "This asset's calculated risk is below your stated tolerance, but suitability still depends on your goals and time horizon.";
  }

  return "This asset's calculated risk is broadly aligned with your stated tolerance.";
}
