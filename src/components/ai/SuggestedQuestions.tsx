import type { ChatContext } from "@/types/chat";

export function getSuggestedQuestions(context: ChatContext): string[] {
  const title = context.title.toLocaleLowerCase("en-IN");
  if (title.includes("p/e") || title.includes("price-to-earnings")) return ["What does P/E actually mean?", "Is this P/E high or low?", "Why does valuation matter?", "Explain this like I'm a beginner."];
  if (title.includes("risk")) return ["How was this risk score calculated?", "What makes this asset risky?", "Is volatility the same as risk?"];
  if (context.type === "hype" || title.includes("hype")) return ["Why is the hype score so high?", "What is the difference between hype and fundamentals?", "Why is valuation important here?"];
  if (title.includes("cash flow")) return ["Why is cash flow important?", "Is positive cash flow a good sign?", "Explain operating cash flow simply."];
  if (context.type === "lesson") return ["Explain this in one simple example.", "Why does this matter to a beginner?", "What should I compare it with?"];
  if (context.type === "report") return ["What is the most important signal here?", "What should I investigate next?", "Explain this section simply."];
  if (context.type === "simulator") return ["Why does this matter before investing?", "How does this affect my decision readiness?", "Explain this like I'm new to investing."];
  return ["What does this mean in simple language?", "Why does this matter?", "What should a beginner look at next?"];
}

export function SuggestedQuestions({ context, onSelect, disabled }: { context: ChatContext; onSelect: (question: string) => void; disabled?: boolean }) {
  return <div className="flex flex-wrap gap-2">{getSuggestedQuestions(context).map((question) => <button key={question} type="button" disabled={disabled} onClick={() => onSelect(question)} className="rounded-md border border-border bg-surface px-2.5 py-2 text-left text-xs leading-4 text-muted-foreground hover:border-primary/30 hover:text-foreground disabled:opacity-50">{question}</button>)}</div>;
}
