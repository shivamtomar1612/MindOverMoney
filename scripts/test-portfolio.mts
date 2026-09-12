import assert from "node:assert/strict";

import {
  addPortfolioHolding,
  calculatePortfolio,
  createEmptyPortfolio,
  generatePortfolioHistory,
  removePortfolioHolding,
} from "../src/lib/calculations/portfolio.ts";
import { calculateRiskScore } from "../src/lib/calculations/risk.ts";
import { getAllAssets } from "../src/lib/data/demo-data.ts";

const assets = getAllAssets();
let state = createEmptyPortfolio();

for (const [symbol, amount] of [["TCS", 20_000], ["ITC", 15_000], ["ICICIBANK", 10_000]] as const) {
  const result = addPortfolioHolding(state, symbol, amount);
  assert.equal(result.error, undefined);
  state = result.state;
}

const summary = calculatePortfolio(state, assets);
assert.equal(summary.cash, 55_000);
assert.equal(summary.invested, 45_000);
assert.equal(summary.holdings.length, 3);
assert.ok(summary.portfolioValue > 0);
assert.equal(summary.holdings.reduce((total, holding) => total + holding.weight, 0).toFixed(1), "100.0");
assert.deepEqual(summary.sectorAllocation.map((item) => item.sector).sort(), ["FMCG", "Information Technology", "Private Sector Bank"].sort());
const expectedRisk = Math.round((calculateRiskScore(assets.find((asset) => asset.symbol === "TCS")!) * 20_000 + calculateRiskScore(assets.find((asset) => asset.symbol === "ITC")!) * 15_000 + calculateRiskScore(assets.find((asset) => asset.symbol === "ICICIBANK")!) * 10_000) / 45_000);
assert.equal(summary.portfolioRisk, expectedRisk);

const firstHistory = generatePortfolioHistory(state, assets);
const secondHistory = generatePortfolioHistory(state, assets);
assert.deepEqual(firstHistory, secondHistory, "portfolio history must be deterministic");
assert.equal(firstHistory.length, 30);

for (const amount of [-1, 0, Number.NaN, Number.POSITIVE_INFINITY]) {
  const result = addPortfolioHolding(state, "TCS", amount);
  assert.ok(result.error, `invalid amount ${String(amount)} should be rejected`);
  assert.deepEqual(result.state, state);
}
const tooLarge = addPortfolioHolding(state, "TCS", 55_001);
assert.match(tooLarge.error ?? "", /available cash/i);
assert.deepEqual(removePortfolioHolding(state, "ITC").holdings.map((holding) => holding.symbol), ["TCS", "ICICIBANK"]);

console.log("Portfolio validation passed: required holdings, cash, values, risk, diversification, deterministic history, and invalid amounts.");
