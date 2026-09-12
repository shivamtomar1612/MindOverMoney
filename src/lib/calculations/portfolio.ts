import { calculateRiskScore, getRiskLevel } from "./risk.ts";
import { generatePriceHistory } from "./price-history.ts";
import type { Asset } from "../../types/asset.ts";
import type {
  PaperPortfolioState,
  PortfolioHolding,
  PortfolioRiskLevel,
  PortfolioSummary,
  SectorAllocation,
} from "../../types/portfolio.ts";
import { PAPER_PORTFOLIO_STARTING_BALANCE } from "../../types/portfolio.ts";

const clamp = (value: number, minimum = 0, maximum = 100) => Math.min(maximum, Math.max(minimum, value));
const round = (value: number, decimals = 2) => Number(value.toFixed(decimals));

export function createEmptyPortfolio(): PaperPortfolioState {
  return { startingBalance: PAPER_PORTFOLIO_STARTING_BALANCE, holdings: [] };
}

export function normalizePortfolioState(value: unknown): PaperPortfolioState {
  if (!value || typeof value !== "object") return createEmptyPortfolio();
  const candidate = value as Record<string, unknown>;
  const holdings = Array.isArray(candidate.holdings)
    ? candidate.holdings
        .filter((holding): holding is Record<string, unknown> => Boolean(holding && typeof holding === "object"))
        .map((holding) => ({ symbol: typeof holding.symbol === "string" ? holding.symbol.toUpperCase() : "", amountInvested: typeof holding.amountInvested === "number" ? holding.amountInvested : Number(holding.amountInvested) }))
        .filter((holding): holding is PortfolioHolding => Boolean(holding.symbol) && Number.isFinite(holding.amountInvested) && holding.amountInvested > 0)
        .reduce<PortfolioHolding[]>((unique, holding) => {
          const existing = unique.find((item) => item.symbol === holding.symbol);
          if (existing) existing.amountInvested += holding.amountInvested;
          else unique.push({ ...holding });
          return unique;
        }, [])
    : [];
  return { startingBalance: PAPER_PORTFOLIO_STARTING_BALANCE, holdings };
}

export function getAvailableCash(state: PaperPortfolioState): number {
  return round(Math.max(0, state.startingBalance - state.holdings.reduce((total, holding) => total + holding.amountInvested, 0)));
}

export type PortfolioMutationResult = { state: PaperPortfolioState; error?: string };

export function addPortfolioHolding(state: PaperPortfolioState, symbol: string, amount: number): PortfolioMutationResult {
  const normalizedSymbol = symbol.trim().toUpperCase();
  if (!normalizedSymbol) return { state, error: "Choose an asset first." };
  if (!Number.isFinite(amount) || amount <= 0) return { state, error: "Enter an amount greater than ₹0." };
  const availableCash = getAvailableCash(state);
  if (amount > availableCash) return { state, error: `That amount is larger than your available cash of ₹${availableCash.toLocaleString("en-IN")}.` };
  const holdings = state.holdings.map((holding) => ({ ...holding }));
  const existing = holdings.find((holding) => holding.symbol === normalizedSymbol);
  if (existing) existing.amountInvested = round(existing.amountInvested + amount);
  else holdings.push({ symbol: normalizedSymbol, amountInvested: round(amount) });
  return { state: { ...state, holdings } };
}

export function removePortfolioHolding(state: PaperPortfolioState, symbol: string): PaperPortfolioState {
  return { ...state, holdings: state.holdings.filter((holding) => holding.symbol !== symbol.toUpperCase()) };
}

function simulatedReturnPct(asset: Asset): number {
  const history = generatePriceHistory(asset);
  return history.length > 1 ? round(((history[history.length - 1].price / history[0].price) - 1) * 100, 2) : 0;
}

export function getSimulatedReturnPct(asset: Asset): number {
  return simulatedReturnPct(asset);
}

export function getPortfolioRiskLevel(score: number): PortfolioRiskLevel {
  return getRiskLevel(score);
}

export function calculatePortfolio(state: PaperPortfolioState, assets: Asset[]): PortfolioSummary {
  const assetMap = new Map(assets.map((asset) => [asset.symbol, asset]));
  const holdings = state.holdings
    .map((holding) => {
      const asset = assetMap.get(holding.symbol);
      if (!asset) return null;
      const returnPct = simulatedReturnPct(asset);
      const currentValue = round(holding.amountInvested * (1 + returnPct / 100));
      const riskScore = calculateRiskScore(asset);
      return { ...holding, name: asset.name, sector: asset.sector, currentValue, weight: 0, simulatedReturn: round(currentValue - holding.amountInvested), simulatedReturnPct: returnPct, riskScore, riskLevel: getPortfolioRiskLevel(riskScore) };
    })
    .filter((holding): holding is NonNullable<typeof holding> => Boolean(holding));
  const invested = round(holdings.reduce((total, holding) => total + holding.amountInvested, 0));
  const portfolioValue = round(holdings.reduce((total, holding) => total + holding.currentValue, 0));
  const cash = round(Math.max(0, state.startingBalance - invested));
  const totalBalance = round(cash + portfolioValue);
  const profitLoss = round(portfolioValue - invested);
  const profitLossPct = invested > 0 ? round((profitLoss / invested) * 100) : 0;

  const weightedHoldings = holdings.map((holding) => ({ ...holding, weight: portfolioValue > 0 ? round((holding.currentValue / portfolioValue) * 100, 1) : 0 }));
  const portfolioRisk = invested > 0 ? Math.round(holdings.reduce((total, holding) => total + holding.riskScore * holding.amountInvested, 0) / invested) : 0;
  const sectorValues = weightedHoldings.reduce<Record<string, number>>((result, holding) => {
    result[holding.sector] = (result[holding.sector] ?? 0) + holding.currentValue;
    return result;
  }, {});
  const sectorAllocation: SectorAllocation[] = Object.entries(sectorValues)
    .map(([sector, value]) => ({ sector, value: round(value), weight: portfolioValue > 0 ? round((value / portfolioValue) * 100, 1) : 0 }))
    .sort((first, second) => second.value - first.value);
  const hhi = weightedHoldings.reduce((total, holding) => total + (holding.weight / 100) ** 2, 0);

  return {
    cash,
    invested,
    portfolioValue,
    totalBalance,
    profitLoss,
    profitLossPct,
    portfolioRisk: clamp(portfolioRisk),
    portfolioRiskLevel: getPortfolioRiskLevel(portfolioRisk),
    diversification: holdings.length ? Math.round(clamp((1 - hhi) * 100)) : 0,
    holdings: weightedHoldings,
    sectorAllocation,
  };
}

export interface PortfolioHistoryPoint {
  label: string;
  value: number;
}

export function generatePortfolioHistory(state: PaperPortfolioState, assets: Asset[], pointCount = 30): PortfolioHistoryPoint[] {
  const assetMap = new Map(assets.map((asset) => [asset.symbol, asset]));
  const histories = state.holdings.map((holding) => ({ holding, history: assetMap.get(holding.symbol) ? generatePriceHistory(assetMap.get(holding.symbol) as Asset, pointCount) : [] })).filter((item) => item.history.length > 0);
  const cash = getAvailableCash(state);
  return Array.from({ length: pointCount }, (_, index) => ({
    label: `D${index + 1}`,
    value: round(cash + histories.reduce((total, item) => total + item.holding.amountInvested * (item.history[index].price / item.history[0].price), 0)),
  }));
}
