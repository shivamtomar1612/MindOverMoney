"use client";

import { createContext, useContext } from "react";

import type { ChatContext, ChatMessage } from "@/types/chat";

export type FinancialChatbotController = {
  context: ChatContext | null;
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  openFinancialChatbot: (context: ChatContext) => void;
  changeContext: (context: ChatContext) => void;
  closeFinancialChatbot: () => void;
  sendMessage: (question: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
};

export const FinancialChatbotContext = createContext<FinancialChatbotController | null>(null);

export function useFinancialChatbot(): FinancialChatbotController {
  const controller = useContext(FinancialChatbotContext);
  if (!controller) throw new Error("useFinancialChatbot must be used inside ChatbotProvider");
  return controller;
}
