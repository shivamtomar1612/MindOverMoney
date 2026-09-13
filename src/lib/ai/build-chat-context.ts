import { calculateRiskFactors, calculateRiskScore, getRiskLevel, RISK_WEIGHTS } from "../calculations/risk.ts";
import { getAllAssets, getAsset } from "../data/demo-data.ts";
import type { Asset } from "../../types/asset.ts";
import type { ChatContext, ChatMessage, ChatProfileContext } from "../../types/chat.ts";

const MAX_CONTEXT_LENGTH = 7_000;

function compactValue(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return undefined;
  try {
    const serialized = JSON.stringify(value);
    return serialized.length <= 1_000 ? serialized : `${serialized.slice(0, 997)}...`;
  } catch {
    return undefined;
  }
}

function assetLines(asset: Asset, label: string): string[] {
  const calculatedRisk = calculateRiskScore(asset);
  const riskFactors = calculateRiskFactors(asset).map((factor) => ({
    factor: factor.label,
    score: factor.score,
    weight: `${Math.round(factor.weight * 100)}%`,
    contribution: factor.contribution,
  }));
  return [
    `${label}: ${asset.symbol} — ${asset.name}`,
    `Sector: ${asset.sector}`,
    `Demo price: ₹${asset.price}`,
    `Demo daily change: ${asset.dailyChange}%`,
    `P/E: ${asset.pe}`,
    `EPS: ₹${asset.eps}`,
    `ROE: ${asset.roe}%`,
    `ROCE: ${asset.roce}%`,
    `Debt-to-equity: ${asset.debtToEquity}`,
    `Profit margin: ${asset.profitMargin}%`,
    `Revenue growth: ${asset.revenueGrowth}%`,
    `Profit growth: ${asset.profitGrowth}%`,
    `Dividend yield: ${asset.dividendYield}%`,
    `Beta: ${asset.beta}`,
    `Volatility: ${asset.volatility}%`,
    `Calculated risk: ${calculatedRisk}/100 (${getRiskLevel(calculatedRisk)})`,
    `Risk model weights: ${JSON.stringify(RISK_WEIGHTS)}`,
    `Risk factor breakdown: ${JSON.stringify(riskFactors)}`,
    `Fundamental score: ${asset.fundamentalScore}/100`,
    `Growth score: ${asset.growthScore}/100`,
    `Financial health score: ${asset.financialHealthScore}/100`,
    `Valuation score: ${asset.valuationScore}/100`,
    `Demo Hype Proxy: ${asset.hypeScore}/100`,
  ];
}

function assetMentioned(text: string, asset: Asset): boolean {
  const symbol = asset.symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`(^|[^A-Z0-9])${symbol}([^A-Z0-9]|$)`, "i").test(text)) return true;
  const name = asset.name.replace(/\s+(Industries|Consultancy Services|Pharmaceutical Industries)?\s*Ltd\.?$/i, "").trim();
  return name.length >= 3 && text.toLocaleLowerCase("en-IN").includes(name.toLocaleLowerCase("en-IN"));
}

function mentionedAssets(question: string, history: Array<Pick<ChatMessage, "role" | "content">>, selectedSymbol?: string): Asset[] {
  const latestConversation = [...history.slice(-4).map((message) => message.content), question].join("\n");
  return getAllAssets()
    .filter((asset) => asset.symbol !== selectedSymbol && assetMentioned(latestConversation, asset))
    .slice(0, 2);
}

/** Builds a compact, server-controlled context block for model prompts. */
export function buildChatContext(
  context: ChatContext,
  profile?: ChatProfileContext,
  question = "",
  history: Array<Pick<ChatMessage, "role" | "content">> = [],
): string {
  const lines: string[] = [
    "All market figures below are simulated demo data and are not live.",
    `Context type: ${context.type}`,
    `Topic: ${context.title}`,
    ...(context.description ? [`Description: ${context.description}`] : []),
    ...(context.metric ? [`Selected metric: ${context.metric.name}; selected value: ${context.metric.value}`] : []),
    `User experience: ${profile?.experience ?? context.userLevel ?? "Beginner"}`,
  ];

  if (profile) {
    if (profile.riskTolerance) lines.push(`User risk tolerance: ${profile.riskTolerance}`);
    if (profile.riskScore !== undefined) lines.push(`User risk score: ${profile.riskScore}/100`);
    if (profile.investmentHorizon) lines.push(`User investment horizon: ${profile.investmentHorizon}`);
    if (profile.goal) lines.push(`User goal: ${profile.goal}`);
  }

  const selectedAsset = context.asset ? getAsset(context.asset.symbol) : undefined;
  if (selectedAsset) lines.push(...assetLines(selectedAsset, "Current asset"));
  else if (context.asset) lines.push(`Current asset: ${context.asset.symbol} — ${context.asset.name}; no additional asset metrics are available.`);

  const comparisons = mentionedAssets(question, history, selectedAsset?.symbol);
  comparisons.forEach((asset, index) => lines.push(...assetLines(asset, `Mentioned asset ${index + 1}`)));

  if (context.data) {
    Object.entries(context.data).slice(0, 40).forEach(([key, value]) => {
      const formatted = compactValue(value);
      if (formatted !== undefined) lines.push(`Application ${key}: ${formatted}`);
    });
  }

  return lines.join("\n").slice(0, MAX_CONTEXT_LENGTH);
}
