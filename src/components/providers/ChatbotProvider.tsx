"use client";

import { useCallback, useMemo, useState } from "react";

import { getChatWelcome } from "@/lib/ai/chat-fallback";
import type { ChatContext, ChatMessage } from "@/types/chat";
import { FinancialChatbotContext, type FinancialChatbotController } from "@/hooks/useFinancialChatbot";

function newMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`, role, content, timestamp: new Date().toISOString() };
}

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<ChatContext | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);

  const openWithContext = useCallback((nextContext: ChatContext) => {
    setContext(nextContext);
    setMessages([newMessage("assistant", getChatWelcome(nextContext))]);
    setLastQuestion(null);
    setError(null);
    setIsOpen(true);
  }, []);

  const closeFinancialChatbot = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const sendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || !context || isLoading) return;
    const userMessage = newMessage("user", trimmed);
    const priorMessages = messages;
    setMessages((current) => [...current, userMessage]);
    setLastQuestion(trimmed);
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          question: trimmed,
          messages: [...priorMessages, userMessage].map(({ role, content }) => ({ role, content })),
        }),
      });
      const payload = (await response.json()) as { answer?: string; message?: string; error?: string };
      const answer = payload.answer ?? payload.message;
      if (!response.ok || !answer) throw new Error(payload.error || "The assistant is temporarily unavailable. Please try again.");
      setMessages((current) => [...current, newMessage("assistant", answer)]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "The assistant is temporarily unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [context, isLoading, messages]);

  const retryLastMessage = useCallback(async () => {
    if (!lastQuestion || !context || isLoading) return;
    setError(null);
    await sendMessage(lastQuestion);
  }, [context, isLoading, lastQuestion, sendMessage]);

  const controller = useMemo<FinancialChatbotController>(() => ({
    context,
    isOpen,
    messages,
    isLoading,
    error,
    openFinancialChatbot: openWithContext,
    changeContext: openWithContext,
    closeFinancialChatbot,
    sendMessage,
    retryLastMessage,
  }), [closeFinancialChatbot, context, error, isLoading, isOpen, messages, openWithContext, retryLastMessage, sendMessage]);

  return <FinancialChatbotContext.Provider value={controller}>{children}</FinancialChatbotContext.Provider>;
}
