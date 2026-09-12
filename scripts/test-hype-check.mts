import assert from "node:assert/strict";

import { getAllAssets, getAsset } from "../src/lib/data/demo-data.ts";
import {
  calculateDemoHypeProxy,
  calculateHypeGap,
  getHypeClassification,
  getHypeSignals,
  getSafeFundamentalScore,
  getSafeHypeScore,
} from "../src/lib/calculations/hype.ts";

const zomato = getAsset("ZOMATO");
assert.ok(zomato, "ZOMATO must exist in the demo catalog");
assert.equal(zomato.hypeScore, 95);
assert.equal(zomato.fundamentalScore, 67);
assert.equal(zomato.riskScore, 78);
assert.equal(zomato.valuationScore, 34);
assert.equal(calculateHypeGap(zomato.hypeScore, zomato.fundamentalScore), 28);
assert.equal(getHypeClassification(zomato.hypeScore, zomato.fundamentalScore), "HIGH HYPE / MODERATE FUNDAMENTALS");

assert.equal(getHypeClassification(80, 65), "MODERATE HYPE GAP");
assert.equal(getHypeClassification(70, 61), "HYPE AND FUNDAMENTALS RELATIVELY ALIGNED");
assert.equal(getHypeClassification(100, 0), "HIGH HYPE / MODERATE FUNDAMENTALS");
assert.equal(calculateHypeGap(-20, 140), -100, "extreme inputs should be safely bounded");

for (const asset of getAllAssets()) {
  const signals = getHypeSignals(asset);
  assert.equal(signals.length, 5, `${asset.symbol} should expose all five proxy signals`);
  assert.equal(Number(signals.reduce((sum, signal) => sum + signal.weight, 0).toFixed(2)), 1);
  assert.ok(signals.every((signal) => signal.score >= 0 && signal.score <= 100));
  assert.ok(calculateDemoHypeProxy(asset) >= 0 && calculateDemoHypeProxy(asset) <= 100);
}

const missing = {};
assert.doesNotThrow(() => getHypeSignals(missing), "missing fields must not crash signal calculation");
assert.equal(getSafeHypeScore(missing), 0);
assert.equal(getSafeFundamentalScore(missing), 0);
assert.equal(getHypeClassification(undefined, undefined), "HYPE AND FUNDAMENTALS RELATIVELY ALIGNED");

console.log("Hype Check validation passed for all assets, thresholds, extremes, and missing data.");
