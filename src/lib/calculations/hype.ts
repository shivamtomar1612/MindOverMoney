import type { Asset } from "@/types";
import type {
  HypeClassification,
  HypeSignal,
  HypeSignalKey,
} from "@/types";

export const HYPE_SIGNAL_WEIGHTS: Record<HypeSignalKey, number> = {
  priceMomentum: 0.3,
  volatility: 0.25,
  trendProxy: 0.2,
  newsAttentionProxy: 0.15,
  retailInterestProxy: 0.1,
};

const clampScore = (value: number | null | undefined): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(Math.max(0, Math.min(100, value as number)));
};

const positiveNumber = (value: number | null | undefined): number =>
  Number.isFinite(value) && (value as number) > 0 ? (value as number) : 0;

export function getSafeHypeScore(asset: Partial<Asset> | null | undefined): number {
  return clampScore(asset?.hypeScore);
}

export function getSafeFundamentalScore(
  asset: Partial<Asset> | null | undefined,
): number {
  return clampScore(asset?.fundamentalScore);
}

export function getSafeRiskScore(asset: Partial<Asset> | null | undefined): number {
  return clampScore(asset?.riskScore);
}

export function getSafeValuationScore(
  asset: Partial<Asset> | null | undefined,
): number {
  return clampScore(asset?.valuationScore);
}

export function calculateHypeGap(
  hypeScore: number | null | undefined,
  fundamentalScore: number | null | undefined,
): number {
  return clampScore(hypeScore) - clampScore(fundamentalScore);
}

export function getHypeClassification(
  hypeScore: number | null | undefined,
  fundamentalScore: number | null | undefined,
): HypeClassification {
  const hypeGap = calculateHypeGap(hypeScore, fundamentalScore);

  if (hypeGap >= 20) {
    return "HIGH HYPE / MODERATE FUNDAMENTALS";
  }

  if (hypeGap >= 10) {
    return "MODERATE HYPE GAP";
  }

  return "HYPE AND FUNDAMENTALS RELATIVELY ALIGNED";
}

export function getHypeSignals(asset: Partial<Asset> | null | undefined): HypeSignal[] {
  const dailyChange = Math.abs(asset?.dailyChange ?? 0);
  const volatility = positiveNumber(asset?.volatility);
  const growthScore = asset?.growthScore ??
    ((positiveNumber(asset?.revenueGrowth) / 50) * 50 +
      (positiveNumber(asset?.profitGrowth) / 100) * 50);
  const hypeScore = getSafeHypeScore(asset);

  return [
    {
      key: "priceMomentum",
      label: "Price momentum",
      score: clampScore((dailyChange / 3) * 100),
      weight: HYPE_SIGNAL_WEIGHTS.priceMomentum,
      description: "The magnitude of the demo daily move, regardless of direction.",
    },
    {
      key: "volatility",
      label: "Volatility",
      score: clampScore((volatility / 40) * 100),
      weight: HYPE_SIGNAL_WEIGHTS.volatility,
      description: "The size and frequency of demo price swings.",
    },
    {
      key: "trendProxy",
      label: "Trend proxy",
      score: clampScore(growthScore),
      weight: HYPE_SIGNAL_WEIGHTS.trendProxy,
      description: "A simulated signal based on growth momentum and market direction.",
    },
    {
      key: "newsAttentionProxy",
      label: "News attention proxy",
      score: hypeScore,
      weight: HYPE_SIGNAL_WEIGHTS.newsAttentionProxy,
      description: "A fictional attention signal; no news or social feed is connected.",
    },
    {
      key: "retailInterestProxy",
      label: "Retail interest proxy",
      score: clampScore((hypeScore + (dailyChange / 3) * 100) / 2),
      weight: HYPE_SIGNAL_WEIGHTS.retailInterestProxy,
      description: "A simulated retail-interest signal for demonstration only.",
    },
  ];
}

export function calculateDemoHypeProxy(asset: Partial<Asset> | null | undefined): number {
  const signals = getHypeSignals(asset);
  const weightedScore = signals.reduce(
    (total, signal) => total + signal.score * signal.weight,
    0,
  );

  return Math.round(weightedScore);
}
