import { getLesson } from "../data/demo-data.ts";
import type { Asset } from "../../types/asset.ts";
import type { ExplainResponse } from "../../types/ai.ts";

export const UNAVAILABLE_EXPLANATION =
  "AI analysis is currently unavailable. Try one of the predefined metric explanations.";

const normalize = (value: string | undefined) =>
  (value ?? "").trim().toLocaleLowerCase("en-IN").replace(/[–—-]/g, " ").replace(/[^a-z0-9/ ]/g, "").replace(/\s+/g, " ");

const termAliases: Record<string, string> = {
  pe: "P/E Ratio",
  "p/e": "P/E Ratio",
  "price earnings": "P/E Ratio",
  "price to earnings": "P/E Ratio",
  eps: "EPS",
  roe: "ROE",
  roce: "ROCE",
  beta: "Beta",
  volatility: "Volatility",
  debt: "Debt-to-Equity",
  "debt to equity": "Debt-to-Equity",
  debttoequity: "Debt-to-Equity",
  "profit margin": "Profit Margin",
  revenue: "Revenue",
  "net profit": "Net Profit",
  "dividend yield": "Dividend Yield",
  "market cap": "Market Capitalization",
  "market capitalization": "Market Capitalization",
};

const metricContext: Record<string, (asset: Asset) => string> = {
  "P/E Ratio": (asset) => `The supplied demo P/E for ${asset.symbol} is ${asset.pe.toFixed(1)}.`,
  EPS: (asset) => `The supplied demo EPS for ${asset.symbol} is ₹${asset.eps.toFixed(2)}.`,
  ROE: (asset) => `The supplied demo ROE for ${asset.symbol} is ${asset.roe.toFixed(1)}%.`,
  ROCE: (asset) => `The supplied demo ROCE for ${asset.symbol} is ${asset.roce.toFixed(1)}%.`,
  "Debt-to-Equity": (asset) => `The supplied demo debt-to-equity ratio for ${asset.symbol} is ${asset.debtToEquity.toFixed(2)}.`,
  "Profit Margin": (asset) => `The supplied demo profit margin for ${asset.symbol} is ${asset.profitMargin.toFixed(1)}%.`,
  Revenue: (asset) => `The supplied demo revenue growth for ${asset.symbol} is ${asset.revenueGrowth.toFixed(1)}%.`,
  "Net Profit": (asset) => `The supplied demo profit growth for ${asset.symbol} is ${asset.profitGrowth.toFixed(1)}%.`,
  "Dividend Yield": (asset) => `The supplied demo dividend yield for ${asset.symbol} is ${asset.dividendYield.toFixed(2)}%.`,
  Beta: (asset) => `The supplied demo beta for ${asset.symbol} is ${asset.beta.toFixed(2)}.`,
  Volatility: (asset) => `The supplied demo volatility for ${asset.symbol} is ${asset.volatility.toFixed(1)}%.`,
  "Market Capitalization": (asset) => `The supplied demo market capitalization for ${asset.symbol} is ₹${asset.marketCapCr.toLocaleString("en-IN")} crore.`,
};

const unavailableResponse = (): ExplainResponse => ({
  explanation: UNAVAILABLE_EXPLANATION,
  whyItMatters: UNAVAILABLE_EXPLANATION,
  assetContext: UNAVAILABLE_EXPLANATION,
  beginnerTakeaway: UNAVAILABLE_EXPLANATION,
});

function resolveLessonTerm(term: string | undefined, question: string | undefined): string | undefined {
  const normalizedTerm = normalize(term);
  const normalizedQuestion = normalize(question);
  const alias = termAliases[normalizedTerm];
  if (alias) return alias;

  const questionAlias = Object.entries(termAliases).find(([key]) => normalizedQuestion.includes(key));
  if (questionAlias) return questionAlias[1];

  const lesson = getLesson(term ?? "");
  if (lesson) return lesson.term;

  const questionLesson = getLesson(question ?? "");
  return questionLesson?.term;
}

function questionMatches(question: string | undefined, ...words: string[]) {
  const normalizedQuestion = normalize(question);
  return words.some((word) => normalizedQuestion.includes(word));
}

function buildAssetContext(asset: Asset | null | undefined, resolvedTerm: string | undefined, question: string | undefined): string {
  if (!asset) return "No asset-specific demo data was supplied.";
  if (resolvedTerm && metricContext[resolvedTerm]) return metricContext[resolvedTerm](asset);
  if (questionMatches(question, "risky", "risk", "danger", "volatile")) {
    return `The supplied demo risk score for ${asset.symbol} is ${asset.riskScore}/100, with volatility at ${asset.volatility.toFixed(1)}% and beta at ${asset.beta.toFixed(2)}. These are fictional demo figures, not a prediction.`;
  }
  if (questionMatches(question, "fundamental", "business")) {
    return `The supplied demo fundamental score for ${asset.symbol} is ${asset.fundamentalScore}/100. It is a summary signal, not a complete review of the company.`;
  }
  if (questionMatches(question, "company", "stock", "share", "new to investing")) {
    return `${asset.name} is shown in the ${asset.sector} sector. The page uses fictional demo metrics, so this context is for learning rather than a current company assessment.`;
  }
  return "The supplied asset data does not contain enough context for this question.";
}

export function getFallbackExplanation(
  term: string | undefined,
  asset: Asset | null | undefined,
  question: string | undefined,
): ExplainResponse {
  const resolvedTerm = resolveLessonTerm(term, question);
  const lesson = resolvedTerm ? getLesson(resolvedTerm) : undefined;
  const assetContext = buildAssetContext(asset, resolvedTerm, question);

  if (lesson) {
    return {
      explanation: lesson.simpleExplanation,
      whyItMatters: lesson.whyItMatters,
      assetContext,
      beginnerTakeaway: lesson.beginnerTakeaway,
    };
  }

  if (asset && questionMatches(question, "risky", "risk", "danger", "volatile")) {
    return {
      explanation: "Risk is the possibility that an investment's value or outcomes may differ from what you expect. Several signals can contribute to it.",
      whyItMatters: "Understanding the sources of risk helps you compare an asset with your time horizon and comfort level.",
      assetContext,
      beginnerTakeaway: "A risk score is a prompt to investigate, not a prediction or an instruction to trade.",
    };
  }

  if (asset && questionMatches(question, "fundamental", "business", "company", "stock", "share", "new to investing")) {
    return {
      explanation: "A company overview brings several business signals together so a beginner can see the bigger picture before focusing on a single number.",
      whyItMatters: "One metric rarely explains a company on its own; context helps you notice strengths, weaknesses, and missing information.",
      assetContext,
      beginnerTakeaway: "Start with what the business does, then connect its metrics to risk, valuation, and your own goals.",
    };
  }

  return unavailableResponse();
}
