import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  getAllAssets,
  getAsset,
  getDemoReport,
  getLesson,
  getLessons,
  getUser,
  searchAssets,
} from "../src/lib/data/demo-data.ts";

const jsonFiles = [
  "assets.json",
  "users.json",
  "lessons.json",
  "demo-report.json",
];

for (const filename of jsonFiles) {
  const contents = await readFile(new URL(`../src/data/${filename}`, import.meta.url), "utf8");
  assert.doesNotThrow(() => JSON.parse(contents), `${filename} must contain valid JSON`);
}

const assets = getAllAssets();
assert.equal(assets.length, 10, "the catalog must contain 10 demo assets");
assert.equal(getAsset(" tcs ")?.symbol, "TCS", "asset lookup should ignore casing and whitespace");
assert.equal(getAsset("MISSING"), undefined, "a missing symbol should return undefined");

const bankResults = searchAssets("bank");
assert.deepEqual(
  bankResults.map((asset) => asset.symbol),
  ["HDFCBANK", "ICICIBANK"],
  "asset search should match names and sectors",
);
assert.equal(searchAssets("").length, assets.length, "an empty search should return all assets");
assert.equal(searchAssets("   ").length, assets.length, "a whitespace-only search should return all assets");

assert.equal(getUser("RIYA")?.riskScore, 50, "demo user lookup should be case-insensitive");
assert.equal(getLessons().length, 20, "the lesson library must contain 20 lessons");
assert.equal(getLesson("cash flow")?.term, "Cash Flow", "lesson lookup should be case-insensitive");
assert.equal(getDemoReport().isDemonstration, true, "the report must be explicitly marked as a demonstration");

console.log("Demo data validation passed: JSON, lookups, searches, and empty states are valid.");
