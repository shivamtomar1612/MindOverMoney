import type { ChatContext } from "@/types/chat";

const MAX_CONTEXT_LENGTH = 6000;

function formatValue(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

/** Builds a compact, data-only context block for server-side model prompts. */
export function buildChatContext(context: ChatContext): string {
  const lines = [
    `Context type: ${context.type}`,
    `Topic: ${context.title}`,
    context.description ? `Description: ${context.description}` : undefined,
    context.asset ? `Asset: ${context.asset.symbol} — ${context.asset.name}` : undefined,
    context.metric ? `Metric: ${context.metric.name}; value: ${context.metric.value}` : undefined,
    `User experience: ${context.userLevel ?? "Beginner"}`,
  ];

  if (context.data) {
    Object.entries(context.data).slice(0, 40).forEach(([key, value]) => {
      const formatted = formatValue(value);
      if (formatted !== undefined) lines.push(`${key}: ${formatted}`);
    });
  }

  return lines.filter((line): line is string => Boolean(line)).join("\n").slice(0, MAX_CONTEXT_LENGTH);
}
