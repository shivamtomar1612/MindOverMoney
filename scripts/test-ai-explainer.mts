import assert from "node:assert/strict";

import { getFallbackExplanation } from "../src/lib/ai/fallback.ts";
import { getAsset } from "../src/lib/data/demo-data.ts";

const questions = [
  { term: "P/E", asset: "TATAMOTORS", question: "What is P/E?" },
  { term: "Beta", asset: "ZOMATO", question: "What does beta mean?" },
  { term: "ROE", asset: "TATAMOTORS", question: "Explain ROE for a beginner." },
  { term: "Debt-to-Equity", asset: "TATAMOTORS", question: "What does debt-to-equity mean?" },
  { asset: "TATAMOTORS", question: "Why is this stock risky?" },
  { asset: "ZOMATO", question: "Explain this company like I'm 20 and new to investing." },
];

for (const input of questions) {
  const body = getFallbackExplanation(input.term, getAsset(input.asset ?? ""), input.question) as unknown as Record<string, unknown>;
  for (const field of ["explanation", "whyItMatters", "assetContext", "beginnerTakeaway"]) {
    assert.equal(typeof body[field], "string", `${field} should be a string`);
    assert.ok(String(body[field]).length > 0, `${field} should not be empty`);
  }
  assert.equal(JSON.stringify(body).includes("OpenAI API"), false, "raw provider errors must not leak");
}

const unavailableBody = getFallbackExplanation(undefined, getAsset("ZOMATO"), "Tell me something unknowable about the future price.") as { explanation: string };
assert.equal(unavailableBody.explanation, "AI analysis is currently unavailable. Try one of the predefined metric explanations.");

console.log("AI explainer validation passed without an OpenAI API key.");
