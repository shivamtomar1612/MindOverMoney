import assert from "node:assert/strict";

import { getAsset } from "../src/lib/data/demo-data.ts";
import { calculateDecisionReadiness, DECISION_READINESS_WEIGHTS } from "../src/lib/calculations/simulator.ts";
import type { SimulatorReviewState } from "../src/types/simulator.ts";

const zomato = getAsset("ZOMATO");
assert.ok(zomato, "ZOMATO must exist in the simulator catalog");

const reviewed: SimulatorReviewState = {
  risk: true,
  fundamentals: true,
  valuation: true,
  growth: true,
  hype: true,
};

const cautious = calculateDecisionReadiness({
  asset: zomato,
  reason: "Social media",
  horizon: "< 1 year",
  volatilityTolerance: "Low",
  knowledge: "Not at all",
  reviewed,
});

assert.equal(cautious.score, 74, "the documented ZOMATO cautious demo path should score 74");
assert.equal(cautious.breakdown.riskUnderstanding, 59);
assert.equal(cautious.breakdown.hypeAwareness, 100);

const researchPlan = calculateDecisionReadiness({
  asset: zomato,
  reason: "Long-term plan",
  horizon: "5+ years",
  volatilityTolerance: "High",
  knowledge: "Very well",
  reviewed,
});

assert.ok(researchPlan.score > cautious.score, "a more deliberate plan should improve readiness");
assert.equal(Number(Object.values(DECISION_READINESS_WEIGHTS).reduce((sum, weight) => sum + weight, 0).toFixed(2)), 1);

const incomplete = calculateDecisionReadiness({
  asset: zomato,
  reason: "Friend recommended it",
  horizon: "< 1 year",
  volatilityTolerance: "Low",
  knowledge: "Not at all",
  reviewed: { ...reviewed, fundamentals: false, hype: false },
});

assert.ok(incomplete.score < cautious.score, "an incomplete review should reduce readiness");
assert.ok(incomplete.score >= 0 && incomplete.score <= 100);

console.log("Decision simulator validation passed for cautious, deliberate, and incomplete paths.");
