import type { Asset } from "../../types/asset.ts";

export interface HistoricalPricePoint {
  label: string;
  price: number;
}

export function generatePriceHistory(asset: Asset, pointCount = 30): HistoricalPricePoint[] {
  const seed = [...asset.symbol].reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    0,
  );
  const amplitude = Math.min(asset.volatility / 450, 0.09);
  const growthTilt = (asset.revenueGrowth - 8) / 1300;

  const rawSeries = Array.from({ length: pointCount }, (_, index) => {
    const distanceFromEnd = index - (pointCount - 1);
    const wave = Math.sin(seed * 0.013 + index * 0.61) * amplitude;
    const secondaryWave = Math.cos(seed * 0.007 + index * 0.27) * amplitude * 0.42;
    const trend = distanceFromEnd * growthTilt;

    return asset.price * (1 + wave + secondaryWave + trend);
  });
  const finalScale = asset.price / rawSeries[rawSeries.length - 1];

  return rawSeries.map((price, index) => ({
    label: `D${index + 1}`,
    price: Number((price * finalScale).toFixed(2)),
  }));
}
