import assert from "node:assert/strict";

import { getAsset, getUser } from "../src/lib/data/demo-data.ts";
import {
  calculateRiskCompatibility,
  calculateRiskFactors,
  calculateRiskScore,
  getRiskLevel,
} from "../src/lib/calculations/risk.ts";
import { generatePriceHistory } from "../src/lib/calculations/price-history.ts";

const expectedLevels = {
  TATAMOTORS: "HIGH",
  ZOMATO: "HIGH",
  TCS: "LOW",
  ITC: "LOW",
} as const;

const aarav = getUser("aarav");
assert.ok(aarav, "Aarav must exist in the demo dataset");

for (const [symbol, expectedLevel] of Object.entries(expectedLevels)) {
  const asset = getAsset(symbol);
  assert.ok(asset, `${symbol} must exist in the demo dataset`);

  const firstScore = calculateRiskScore(asset);
  const secondScore = calculateRiskScore(asset);
  const factors = calculateRiskFactors(asset);
  const history = generatePriceHistory(asset);

  assert.equal(firstScore, secondScore, `${symbol} risk calculation must be deterministic`);
  assert.equal(getRiskLevel(firstScore), expectedLevel, `${symbol} risk classification must match`);
  assert.equal(factors.length, 6, `${symbol} must have all six risk factors`);
  assert.equal(
    Number(factors.reduce((sum, factor) => sum + factor.weight, 0).toFixed(2)),
    1,
    "risk weights must total 100%",
  );
  assert.equal(history.length, 30, `${symbol} must have 30 deterministic price points`);
  assert.equal(history.at(-1)?.price, asset.price, `${symbol} history must end at its demo price`);

  const compatibility = calculateRiskCompatibility(aarav.riskScore, firstScore);
  assert.ok(compatibility >= 0 && compatibility <= 100, `${symbol} compatibility must stay within 0–100`);
}

assert.equal(getRiskLevel(30), "LOW");
assert.equal(getRiskLevel(31), "MODERATE");
assert.equal(getRiskLevel(60), "MODERATE");
assert.equal(getRiskLevel(61), "HIGH");
assert.equal(getRiskLevel(80), "HIGH");
assert.equal(getRiskLevel(81), "VERY HIGH");

console.log("Risk engine validation passed for TATAMOTORS, ZOMATO, TCS, and ITC.");
