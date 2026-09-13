import assert from "node:assert/strict";

import { getChatWelcome, getFallbackChatResponse } from "../src/lib/ai/chat-fallback.ts";
import { buildChatContext } from "../src/lib/ai/build-chat-context.ts";
import { createChatTitle } from "../src/lib/ai/chat-title.ts";
import type { ChatContext } from "../src/types/chat.ts";

const peContext: ChatContext = {
  type: "metric",
  title: "P/E Ratio",
  asset: { symbol: "ZOMATO", name: "Zomato Ltd." },
  metric: { name: "P/E", value: 92.4 },
  data: { pe: 92.4 },
  userLevel: "Beginner",
};

assert.match(getChatWelcome(peContext), /P\/E Ratio/);
assert.match(getFallbackChatResponse(peContext, "Is a high P\/E bad?"), /P\/E/i);
assert.match(getFallbackChatResponse({ type: "metric", title: "Risk Score", metric: { name: "Risk Score", value: 67 }, data: { riskScore: 67 } }, "What makes this risky?"), /risk score/i);
assert.match(getFallbackChatResponse({ type: "hype", title: "ZOMATO Hype Check", data: { hypeScore: 95, fundamentalScore: 67, riskScore: 78, valuationScore: 34 } }, "Why should I not confuse hype with fundamentals?"), /Demo Hype Proxy|hype/i);
assert.match(getFallbackChatResponse({ type: "report", title: "Cash Flow", data: { operatingCashFlowGrowth: 9.3 } }, "Why is positive cash flow a good sign?"), /cash flow/i);
assert.match(getFallbackChatResponse({ type: "simulator", title: "Risk Tolerance" }, "Why does this matter?"), /Risk tolerance/i);
assert.match(getFallbackChatResponse(peContext, "Should I buy Zomato tomorrow?"), /can't make a definitive buy\/sell decision/i);
assert.match(getFallbackChatResponse({ type: "lesson", title: "Diversification" }, "Explain this like I am new."), /Diversification/i);
const followUp = getFallbackChatResponse(peContext, "What about TCS?", [
  { role: "user", content: "What is P/E?" },
  { role: "assistant", content: "P/E compares price with earnings per share." },
]);
assert.match(followUp, /Tata Consultancy Services|TCS/i);
assert.match(followUp, /31\.4/);
const comparison = getFallbackChatResponse(peContext, "Compare TCS and Infosys");
assert.match(comparison, /\| TCS \| INFY \|/);
const contextBlock = buildChatContext(peContext, { experience: "Beginner", riskTolerance: "Conservative", investmentHorizon: "5+ years" }, "Why is this risky?");
assert.match(contextBlock, /ZOMATO/);
assert.match(contextBlock, /Risk model weights/);
assert.match(contextBlock, /User risk tolerance: Conservative/);
assert.equal(createChatTitle("Explain ROE in simple terms", { type: "lesson", title: "ROE" }), "Understanding ROE");
console.log("Chatbot validation passed: context welcome, metric, hype, report, simulator, safety, and fallback responses.");
