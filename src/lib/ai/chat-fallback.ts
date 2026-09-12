import type { ChatContext } from "../../types/chat";

const normalize = (value: string) => value.toLocaleLowerCase("en-IN").replace(/[–—]/g, "-");

const safeReframe = (question: string) => {
  const lowered = normalize(question);
  return /\b(buy|sell|purchase|invest tomorrow|guarantee|guaranteed|sure profit|insider|manipulate)\b/.test(lowered);
};

function contextValue(context: ChatContext, key: string): string | undefined {
  const value = context.data?.[key];
  return value === undefined || value === null ? undefined : String(value);
}

export function getChatWelcome(context: ChatContext): string {
  const assetPrefix = context.asset ? `${context.asset.name.replace(/\s+Ltd\.$/, "")} (${context.asset.symbol})` : "this topic";
  return `You’re currently learning about ${context.title}${context.asset ? ` for ${assetPrefix}` : ""}. Ask me anything about what it means, why it matters, or how it applies here.\n\nThis is educational guidance using the provided demo context—not a live market signal or a buy/sell recommendation.`;
}

export function getFallbackChatResponse(context: ChatContext, question: string): string {
  const title = normalize(context.title);
  const asked = normalize(question);
  const assetLabel = context.asset ? `${context.asset.name.replace(/\s+Ltd\.$/, "")} (${context.asset.symbol})` : "the selected context";

  if (safeReframe(question)) {
    return `Simple answer\n\nI can't make a definitive buy/sell decision or guarantee an outcome.\n\nWhy it matters\n\nA thoughtful review looks at valuation, fundamentals, risk, time horizon and your own risk tolerance together.\n\nIn this context\n\nWe are discussing ${context.title}${context.asset ? ` for ${assetLabel}` : ""}. Use the demo figures as learning prompts, then research the underlying information before deciding.\n\nBeginner takeaway\n\nUse this assistant to understand the trade-offs, not to outsource your decision.`;
  }

  if (title.includes("p/e") || title.includes("price-to-earnings") || asked.includes("p/e")) {
    const value = context.metric?.value ?? contextValue(context, "pe");
    return `Simple answer\n\nP/E compares what investors pay for one share with the earnings generated per share. A P/E of 20 means the price is 20 times annual earnings.\n\nWhy it matters\n\nIt helps you discuss how highly the market values a company relative to its current earnings. A high P/E can reflect growth expectations, but it can also leave less room for disappointment.\n\nIn this context\n\n${context.asset ? `${assetLabel} has a demo P/E of ${value ?? "not provided"}.` : `The selected P/E value is ${value ?? "not provided"}.`} Demo numbers are not live data.\n\nBeginner takeaway\n\nCompare P/E with growth, business quality and risk rather than using it alone.`;
  }

  if (title.includes("eps") || asked.includes("eps")) {
    return `Simple answer\n\nEPS means earnings per share: a company's profit divided across its shares.\n\nWhy it matters\n\nIt gives a per-share view of profitability and is one input used in valuation ratios such as P/E.\n\nIn this context\n\n${context.asset ? `${assetLabel} has a demo EPS value of ${context.metric?.value ?? contextValue(context, "eps") ?? "not provided"}.` : "Use the value shown in the selected context as an illustrative figure."}\n\nBeginner takeaway\n\nCheck whether EPS is growing sustainably, not just whether one period looks high.`;
  }

  if (title.includes("roe") || asked.includes("roe")) {
    return `Simple answer\n\nROE, or return on equity, shows how efficiently a company generates profit from shareholders' invested equity.\n\nWhy it matters\n\nA higher ROE can signal efficient use of capital, but debt levels and industry differences can change the interpretation.\n\nIn this context\n\nThe selected ROE is ${context.metric?.value ?? contextValue(context, "roe") ?? "not provided"}. Treat it as demo context and compare it with peers and debt.\n\nBeginner takeaway\n\nROE is more useful when you ask what is driving it.`;
  }

  if (title.includes("roce") || asked.includes("roce")) {
    return `Simple answer\n\nROCE measures how efficiently a business generates operating profit from the capital used in the business.\n\nWhy it matters\n\nIt helps you think about operating performance before focusing only on share price.\n\nIn this context\n\nThe selected ROCE is ${context.metric?.value ?? contextValue(context, "roce") ?? "not provided"}; compare it with the company's cost of capital and peers.\n\nBeginner takeaway\n\nA stable ROCE can be more informative than a single strong year.`;
  }

  if (title.includes("debt-to-equity") || title.includes("debt to equity") || asked.includes("debt-to-equity")) {
    return `Simple answer\n\nDebt-to-equity compares money borrowed by a company with shareholders' equity.\n\nWhy it matters\n\nMore debt can magnify growth and losses, and it creates interest and repayment obligations.\n\nIn this context\n\nThe selected debt-to-equity value is ${context.metric?.value ?? contextValue(context, "debtToEquity") ?? "not provided"}. Interpret it with cash flow and the company's industry.\n\nBeginner takeaway\n\nDebt is not automatically bad, but debt that grows faster than the business deserves attention.`;
  }

  if (title.includes("beta") || asked.includes("beta")) {
    return `Simple answer\n\nBeta describes how much an asset has moved historically relative to a broad market benchmark. A beta above 1 usually means larger market-linked swings.\n\nWhy it matters\n\nIt is one way to discuss market sensitivity, not a complete measure of risk.\n\nIn this context\n\nThe selected beta is ${context.metric?.value ?? contextValue(context, "beta") ?? "not provided"}. It does not predict the next move.\n\nBeginner takeaway\n\nBeta describes sensitivity to the market; it does not tell you whether a company is financially strong.`;
  }

  if (title.includes("volatility") || asked.includes("volatility")) {
    return `Simple answer\n\nVolatility describes how widely a price has moved around its average. Higher volatility means a bumpier path, not automatically a bad asset.\n\nWhy it matters\n\nLarge swings can make it harder to stay aligned with a plan and can increase emotional decision-making.\n\nIn this context\n\nThe selected volatility is ${context.metric?.value ?? contextValue(context, "volatility") ?? "not provided"}. This is demo context, not a forecast.\n\nBeginner takeaway\n\nMatch the amount of price movement you can tolerate with your time horizon.`;
  }

  if (title.includes("dividend") || asked.includes("dividend")) {
    return `Simple answer\n\nDividend yield compares a dividend payment with the share price.\n\nWhy it matters\n\nIt can help you understand income from an investment, but dividends can change and are never guaranteed.\n\nIn this context\n\nThe selected dividend yield is ${context.metric?.value ?? contextValue(context, "dividendYield") ?? "not provided"}. The demo figure is not a promise of future income.\n\nBeginner takeaway\n\nCheck whether the business can sustainably fund the dividend.`;
  }

  if (title.includes("risk tolerance")) {
    return `Simple answer\n\nRisk tolerance is how much uncertainty and price movement you can realistically stay comfortable with while following a plan.\n\nWhy it matters\n\nA mismatch between your tolerance and an asset's volatility can encourage panic or impulsive decisions.\n\nIn this context\n\nThe simulator is asking you to name your tolerance before you focus on a headline or recommendation. That answer is personal and can change with your goals and time horizon.\n\nBeginner takeaway\n\nChoose a level you can live with, not the level that sounds most confident.`;
  }

  if (title.includes("horizon") || asked.includes("time horizon")) {
    return `Simple answer\n\nInvestment horizon is how long you expect to stay invested or keep researching an idea.\n\nWhy it matters\n\nA longer horizon can give a plan more time, while a short horizon leaves less room for large price swings to recover.\n\nIn this context\n\nThe simulator uses your selected horizon to check whether your expectations match the asset's risk and volatility signals.\n\nBeginner takeaway\n\nTime horizon is a planning input, not a promise about what the price will do.`;
  }

  if (title.includes("risk") || asked.includes("risk score") || asked.includes("risky")) {
    return `Simple answer\n\nA risk score is a compact way to summarize selected risk signals; it is not a prediction.\n\nWhy it matters\n\nBreaking risk into volatility, beta, debt, profitability and price movement helps you see what is behind a headline score.\n\nIn this context\n\nThe demo risk score is ${context.metric?.value ?? contextValue(context, "riskScore") ?? "not provided"}. Review the factors rather than treating the number as a verdict.\n\nBeginner takeaway\n\nAsk which risk factors drive the score and whether they fit your plan.`;
  }

  if (title.includes("hype") || asked.includes("hype")) {
    return `Simple answer\n\nHype is attention or excitement around an asset; it is different from evidence about the business.\n\nWhy it matters\n\nAttention can move faster than revenue, profits or cash flow and may encourage impulsive decisions.\n\nIn this context\n\nThis analysis uses a Demo Hype Proxy of ${context.metric?.value ?? contextValue(context, "hypeScore") ?? "not provided"}, alongside fundamentals of ${contextValue(context, "fundamentalScore") ?? "not provided"}, risk of ${contextValue(context, "riskScore") ?? "not provided"}, and valuation of ${contextValue(context, "valuationScore") ?? "not provided"}. These are simulated values.\n\nBeginner takeaway\n\nTreat hype as a reason to investigate, not as proof of quality or future returns.`;
  }

  if (title.includes("fundamental") || asked.includes("fundamental")) {
    return `Simple answer\n\nFundamentals describe the underlying business: growth, profitability, financial health and how the company is valued.\n\nWhy it matters\n\nThey help you distinguish business evidence from short-term attention.\n\nIn this context\n\nThe selected fundamental score is ${context.metric?.value ?? contextValue(context, "fundamentalScore") ?? "not provided"}. It is a demo summary, so inspect the component metrics.\n\nBeginner takeaway\n\nA score is a starting point for questions, not a substitute for understanding the business.`;
  }

  if (title.includes("valuation") || asked.includes("valuation")) {
    return `Simple answer\n\nValuation asks how much the market is paying for the business relative to its earnings, growth and financial strength.\n\nWhy it matters\n\nA strong company can still be priced with very high expectations, while a low price can reflect real business risks.\n\nIn this context\n\nThe demo valuation score is ${context.metric?.value ?? contextValue(context, "valuationScore") ?? "not provided"}. Use it with growth, fundamentals and risk.\n\nBeginner takeaway\n\nGood business and reasonable price are separate questions.`;
  }

  if (title.includes("revenue") || asked.includes("revenue")) {
    return `Simple answer\n\nRevenue is the money a company brings in before expenses. Revenue growth shows whether that top line is expanding or shrinking.\n\nWhy it matters\n\nGrowth is more useful when it converts into profit and cash flow.\n\nIn this context\n\nThe report or asset context shows revenue information only where it was provided; missing figures should remain an open question.\n\nBeginner takeaway\n\nGrowing sales are encouraging, but they are not the same as growing profits.`;
  }

  if (title.includes("profit") || asked.includes("profit")) {
    return `Simple answer\n\nProfit is what remains after a company pays its costs. Profit growth shows how that result is changing over time.\n\nWhy it matters\n\nProfitability helps you ask whether growth is economically useful, not just popular.\n\nIn this context\n\nUse the reported profit growth and margin figures provided in the selected context; no live data is being inferred.\n\nBeginner takeaway\n\nLook at profit together with margins and cash flow.`;
  }

  if (title.includes("cash flow") || asked.includes("cash flow")) {
    return `Simple answer\n\nOperating cash flow is cash generated by the company's everyday operations.\n\nWhy it matters\n\nPositive cash flow can support reinvestment and obligations, but one period is not a complete picture.\n\nIn this context\n\nThe selected report section contains the cash-flow information supplied to this chat. Ask about the reported growth or whether it keeps pace with profit.\n\nBeginner takeaway\n\nProfit on paper and cash arriving in the business are related but not identical.`;
  }

  if (title.includes("diversification") || asked.includes("diversif")) {
    return `Simple answer\n\nDiversification means spreading exposure across different assets, sectors or risks instead of depending on one outcome.\n\nWhy it matters\n\nIt can reduce the impact of one company or theme going wrong, although it cannot remove all risk.\n\nIn this context\n\nUse the selected asset as one part of a learning exercise, not as a complete portfolio plan.\n\nBeginner takeaway\n\nAvoid letting one exciting idea become your entire decision.`;
  }

  if (context.type === "asset") {
    return `Simple answer\n\n${assetLabel} is being used here as a demo case study. An asset overview is a starting point, not a conclusion.\n\nWhy it matters\n\nYou can understand a company more clearly by looking at its business, growth, financial health, valuation, risk and market attention together.\n\nIn this context\n\nThe provided demo context includes ${contextValue(context, "sector") ? `the ${contextValue(context, "sector")} sector` : "selected asset information"}${contextValue(context, "fundamentalScore") ? ` and a demo fundamental score of ${contextValue(context, "fundamentalScore")}` : ""}.\n\nBeginner takeaway\n\nAsk one focused question at a time and verify the underlying facts before making a decision.`;
  }

  return `Simple answer\n\nI can help you unpack ${context.title} in plain English. The selected context is the starting point for this conversation.\n\nWhy it matters\n\nUnderstanding the definition, the underlying evidence and the limitations is more useful than relying on a single headline score.\n\nIn this context\n\n${context.description ?? `Ask a specific question about ${context.title}, its value, or the factors shown here.`}\n\nBeginner takeaway\n\nIf you want to discuss a different topic, use “Change context” so the explanation stays focused.`;
}
