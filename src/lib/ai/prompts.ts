import type { Asset } from "../../types/asset.ts";
import type { ExplainRequest } from "../../types/ai.ts";

export const FINANCIAL_EXPLAINER_INSTRUCTIONS = `You are Mind Over Money, a financial education assistant for beginners.

Your job is to make financial information understandable, calm, and useful for learning.

Rules:
- Explain concepts in plain English and avoid unnecessary jargon.
- Never guarantee returns or make definitive buy or sell instructions.
- Distinguish the provided facts from your interpretation.
- If the provided data is insufficient, say so instead of filling gaps.
- Use only the supplied lesson and asset data. Do not fabricate financial data.
- Keep each section concise.
- Return only a valid JSON object with exactly these keys: explanation, whyItMatters, assetContext, beginnerTakeaway.`;

const assetFacts = (asset: Asset | null | undefined) => {
  if (!asset) return "No asset data was provided.";

  return JSON.stringify({
    symbol: asset.symbol,
    name: asset.name,
    sector: asset.sector,
    demoPrice: asset.price,
    dailyChange: asset.dailyChange,
    pe: asset.pe,
    eps: asset.eps,
    roe: asset.roe,
    roce: asset.roce,
    debtToEquity: asset.debtToEquity,
    profitMargin: asset.profitMargin,
    revenueGrowth: asset.revenueGrowth,
    profitGrowth: asset.profitGrowth,
    beta: asset.beta,
    volatility: asset.volatility,
    fundamentalScore: asset.fundamentalScore,
    riskScore: asset.riskScore,
    valuationScore: asset.valuationScore,
    disclaimer: "Demo market data — not live.",
  });
};

export function buildExplainerPrompt(
  request: ExplainRequest,
  asset: Asset | null | undefined,
): string {
  return `Explain the user's question using the supplied lesson context and asset facts.

Term: ${request.term?.trim() || "Not specified"}
Question: ${request.question?.trim() || "Give a concise beginner explanation of the term."}
Asset facts (the only company data you may use): ${assetFacts(asset)}

In assetContext, mention the relevant supplied fact or clearly say that the supplied data is insufficient. Keep the answer educational and do not turn interpretation into a recommendation.`;
}
