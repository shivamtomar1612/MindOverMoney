import type { ChatContext } from "@/types/chat";

const TERM_TITLES: Array<[RegExp, string]> = [
  [/\bp\/?e\b|price[- ]to[- ]earnings/i, "Understanding P/E"],
  [/\broe\b|return on equity/i, "Understanding ROE"],
  [/\broce\b|return on capital/i, "Understanding ROCE"],
  [/\bbeta\b/i, "Understanding Beta"],
  [/volatil/i, "Understanding Volatility"],
  [/cash flow/i, "Understanding Cash Flow"],
  [/debt[- ]to[- ]equity|debt\/equity/i, "Understanding Debt-to-Equity"],
  [/hype|sentiment/i, "Understanding Market Hype"],
  [/risk/i, "Understanding Investment Risk"],
];

export function createChatTitle(question: string, context: ChatContext): string {
  const normalized = question.replace(/\s+/g, " ").trim();
  const matched = TERM_TITLES.find(([pattern]) => pattern.test(normalized));
  if (matched) return context.asset ? `${matched[1]} · ${context.asset.symbol}` : matched[1];

  if (context.metric) return `Understanding ${context.metric.name}${context.asset ? ` · ${context.asset.symbol}` : ""}`;
  if (context.asset) return `${context.asset.symbol} research`;
  if (context.type === "report") return `${context.title} report review`;

  const words = normalized.replace(/[?!.]+$/g, "").split(" ").slice(0, 7).join(" ");
  return (words || context.title).slice(0, 64);
}
