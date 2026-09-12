import type { ChatContext } from "@/types/chat";

const labels: Record<ChatContext["type"], string> = { lesson: "Learning", metric: "Metric", asset: "Asset", report: "Report", hype: "Hype Check", simulator: "Simulator" };

export function ChatbotContextBadge({ context }: { context: ChatContext }) {
  const value = context.metric?.value;
  return <p className="truncate text-xs text-muted-foreground"><span className="font-semibold text-foreground">{context.asset ? context.asset.symbol : labels[context.type]}</span><span aria-hidden="true"> · </span>{context.metric ? `${context.metric.name}${value !== undefined ? ` ${value}` : ""}` : context.title}</p>;
}
