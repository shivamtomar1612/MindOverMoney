import type { ChatContext, ChatMessage } from "../../types/chat";
import { buildChatContext } from "./build-chat-context";
import { MIND_OVER_MONEY_CHAT_SYSTEM_INSTRUCTION } from "./chat-prompt";

export const CHAT_SYSTEM_PROMPT = MIND_OVER_MONEY_CHAT_SYSTEM_INSTRUCTION;

export function describeContext(context: ChatContext): string {
  return buildChatContext(context);
}

export function buildChatPrompt(context: ChatContext, messages: Array<Pick<ChatMessage, "role" | "content">>, question: string): string {
  const history = messages.slice(-8).map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n");
  return `${describeContext(context)}\n\nRecent conversation:\n${history || "No previous messages."}\n\nUSER QUESTION:\n${question}`;
}
