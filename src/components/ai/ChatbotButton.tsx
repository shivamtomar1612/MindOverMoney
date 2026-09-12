"use client";

import { MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFinancialChatbot } from "@/hooks/useFinancialChatbot";
import type { ChatContext } from "@/types/chat";

export function ChatbotButton({ context, label = "Ask AI", variant = "outline" }: { context: ChatContext; label?: string; variant?: "default" | "outline" | "ghost" }) {
  const { openFinancialChatbot } = useFinancialChatbot();
  return <Button type="button" size="sm" variant={variant} onClick={() => openFinancialChatbot(context)}><MessageSquareText aria-hidden="true" />{label}</Button>;
}
