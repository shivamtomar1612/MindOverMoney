"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { FinancialChatbotContext, type FinancialChatbotController } from "@/hooks/useFinancialChatbot";
import { createChatTitle } from "@/lib/ai/chat-title";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ChatContext, ChatMessage } from "@/types/chat";

const GUEST_STORAGE_KEY = "mind-over-money:chat-conversation";
const MAX_LOCAL_MESSAGES = 100;

type StoredChat = { context: ChatContext; title: string | null; messages: ChatMessage[] };
type StreamEvent = { type: "meta" | "delta" | "done" | "error"; provider?: ChatMessage["provider"]; content?: string; message?: string };

function newMessage(role: ChatMessage["role"], content: string, status: ChatMessage["status"] = "complete"): ChatMessage {
  return { id: crypto.randomUUID(), role, content, timestamp: new Date().toISOString(), status };
}

function contextKey(context: ChatContext | null): string {
  return context ? [context.type, context.title, context.asset?.symbol, context.metric?.name, context.metric?.value].filter(Boolean).join("|") : "";
}

function validStoredChat(value: unknown): value is StoredChat {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredChat>;
  return Boolean(candidate.context && typeof candidate.context.title === "string" && Array.isArray(candidate.messages));
}

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, demoMode } = useAuth();
  const client = getSupabaseBrowserClient();
  const useRemote = Boolean(client && user && !user.isDemo && !demoMode);
  const [context, setContextState] = useState<ChatContext | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [, setConversationIdState] = useState<string | null>(null);
  const [provider, setProvider] = useState<ChatMessage["provider"] | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessagesState] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoadingState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contextRef = useRef<ChatContext | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const conversationIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const restoredForRef = useRef<string | null>(null);

  const setContext = useCallback((value: ChatContext | null) => { contextRef.current = value; setContextState(value); }, []);
  const setConversationId = useCallback((value: string | null) => { conversationIdRef.current = value; setConversationIdState(value); }, []);
  const setIsLoading = useCallback((value: boolean) => { isLoadingRef.current = value; setIsLoadingState(value); }, []);
  const setMessages = useCallback((update: ChatMessage[] | ((current: ChatMessage[]) => ChatMessage[])) => {
    setMessagesState((current) => {
      const next = typeof update === "function" ? update(current) : update;
      messagesRef.current = next;
      return next;
    });
  }, []);

  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (!useRemote || !client) return {};
    const { data } = await client.auth.getSession();
    return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {};
  }, [client, useRemote]);

  useEffect(() => {
    if (authLoading) return;
    const restoreKey = useRemote && user ? `remote:${user.id}` : "guest";
    if (restoredForRef.current === restoreKey) return;
    restoredForRef.current = restoreKey;
    const localKey = useRemote && user ? `${GUEST_STORAGE_KEY}:${user.id}` : GUEST_STORAGE_KEY;
    const restoreLocal = () => {
      try {
        const parsed: unknown = JSON.parse(window.localStorage.getItem(localKey) ?? "null");
        if (validStoredChat(parsed)) {
          setContext(parsed.context);
          setTitle(parsed.title);
          setMessages(parsed.messages.slice(-MAX_LOCAL_MESSAGES).map((message) => ({ ...message, status: "complete" })));
        }
      } catch {
        window.localStorage.removeItem(localKey);
      }
    };

    if (!useRemote) {
      restoreLocal();
      return;
    }

    let active = true;
    void authHeaders().then((headers) => fetch("/api/chat/history", { headers })).then(async (response) => {
      if (!active) return;
      if (!response.ok) { restoreLocal(); return; }
      const payload = await response.json() as {
        conversation?: { id: string; title: string; context: ChatContext } | null;
        messages?: Array<{ id: string; role: "user" | "assistant"; content: string; created_at: string }>;
      };
      if (!payload.conversation) { restoreLocal(); return; }
      setContext(payload.conversation.context);
      setTitle(payload.conversation.title);
      setConversationId(payload.conversation.id);
      setMessages((payload.messages ?? []).map((message) => ({ id: message.id, role: message.role, content: message.content, timestamp: message.created_at, status: "complete" })));
    }).catch(() => { if (active) restoreLocal(); });
    return () => { active = false; };
  }, [authHeaders, authLoading, setContext, setConversationId, setMessages, useRemote, user]);

  useEffect(() => {
    if (authLoading || !context) return;
    const value: StoredChat = { context, title, messages: messages.slice(-MAX_LOCAL_MESSAGES) };
    const localKey = useRemote && user ? `${GUEST_STORAGE_KEY}:${user.id}` : GUEST_STORAGE_KEY;
    window.localStorage.setItem(localKey, JSON.stringify(value));
  }, [authLoading, context, messages, title, useRemote, user]);

  const resetConversation = useCallback((nextContext: ChatContext | null = contextRef.current) => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setContext(nextContext);
    setMessages([]);
    setConversationId(null);
    setTitle(null);
    setProvider(null);
    setError(null);
  }, [setContext, setConversationId, setIsLoading, setMessages]);

  const openFinancialChatbot = useCallback((nextContext: ChatContext) => {
    if (contextKey(contextRef.current) !== contextKey(nextContext)) resetConversation(nextContext);
    else setContext(nextContext);
    setError(null);
    setIsOpen(true);
  }, [resetConversation, setContext]);

  const changeContext = useCallback((nextContext: ChatContext) => {
    resetConversation(nextContext);
    setIsOpen(true);
  }, [resetConversation]);

  const closeFinancialChatbot = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const ensureConversation = useCallback(async (question: string, chatContext: ChatContext): Promise<string | undefined> => {
    if (!useRemote) return undefined;
    if (conversationIdRef.current) return conversationIdRef.current;
    const nextTitle = createChatTitle(question, chatContext);
    setTitle(nextTitle);
    try {
      const headers = await authHeaders();
      const response = await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ action: "create", title: nextTitle, context: chatContext }),
      });
      const payload = await response.json() as { conversation?: { id?: string } };
      if (response.ok && payload.conversation?.id) {
        setConversationId(payload.conversation.id);
        return payload.conversation.id;
      }
    } catch {
      // Chat remains fully usable when persistence is unavailable.
    }
    return undefined;
  }, [authHeaders, setConversationId, useRemote]);

  const runRequest = useCallback(async (question: string, baseMessages: ChatMessage[]) => {
    const trimmed = question.trim().slice(0, 1_500);
    const chatContext = contextRef.current;
    if (!trimmed || !chatContext || isLoadingRef.current) return;

    const nextTitle = title ?? createChatTitle(trimmed, chatContext);
    if (!title) setTitle(nextTitle);
    const userMessage = newMessage("user", trimmed);
    const assistantMessage = newMessage("assistant", "", "streaming");
    setMessages([...baseMessages, userMessage, assistantMessage]);
    setProvider(null);
    setError(null);
    setIsLoading(true);
    const abortController = new AbortController();
    abortRef.current = abortController;

    const updateAssistant = (update: (message: ChatMessage) => ChatMessage) => {
      setMessages((current) => current.map((message) => message.id === assistantMessage.id ? update(message) : message));
    };

    try {
      const remoteConversationId = await ensureConversation(trimmed, chatContext);
      if (abortController.signal.aborted) throw new DOMException("Generation stopped", "AbortError");
      const headers = await authHeaders();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream", ...headers },
        signal: abortController.signal,
        body: JSON.stringify({
          context: chatContext,
          question: trimmed,
          messages: baseMessages.filter((message) => message.content.trim()).slice(-10).map(({ role, content }) => ({ role, content })),
          stream: true,
          ...(remoteConversationId ? { conversationId: remoteConversationId } : {}),
        }),
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(payload.message || "The assistant is temporarily unavailable. Please try again.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let received = false;
      let completed = false;

      const processEvent = (raw: string) => {
        const dataLine = raw.split("\n").find((line) => line.startsWith("data:"));
        if (!dataLine) return;
        const event = JSON.parse(dataLine.slice(5).trim()) as StreamEvent;
        if (event.type === "meta" && event.provider) setProvider(event.provider);
        if (event.type === "delta" && event.content) {
          received = true;
          updateAssistant((message) => ({ ...message, content: message.content + event.content, provider: event.provider ?? message.provider }));
        }
        if (event.type === "done") {
          completed = true;
          if (event.provider) setProvider(event.provider);
          updateAssistant((message) => ({ ...message, status: "complete", provider: event.provider ?? message.provider }));
        }
        if (event.type === "error") throw new Error(event.message || "Gemini is temporarily unavailable. Please try again.");
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        events.filter(Boolean).forEach(processEvent);
      }
      if (buffer.trim()) processEvent(buffer);
      if (!received) throw new Error("Gemini returned an empty response. Please try again.");
      if (!completed) updateAssistant((message) => ({ ...message, status: "complete" }));
    } catch (requestError) {
      if (abortController.signal.aborted) {
        setMessages((current) => current.flatMap((message) => message.id === assistantMessage.id && !message.content ? [] : message.id === assistantMessage.id ? [{ ...message, status: "complete" as const }] : [message]));
      } else {
        updateAssistant((message) => ({ ...message, status: "error" }));
        setError(requestError instanceof Error ? requestError.message : "Gemini is temporarily unavailable. Please try again.");
      }
    } finally {
      if (abortRef.current === abortController) abortRef.current = null;
      setIsLoading(false);
    }
  }, [authHeaders, ensureConversation, setIsLoading, setMessages, title]);

  const sendMessage = useCallback(async (question: string) => {
    await runRequest(question, messagesRef.current.filter((message) => message.status !== "streaming"));
  }, [runRequest]);

  const regenerateLastMessage = useCallback(async () => {
    if (isLoadingRef.current) return;
    const current = messagesRef.current;
    const lastUserIndex = current.findLastIndex((message) => message.role === "user");
    if (lastUserIndex < 0) return;
    const question = current[lastUserIndex].content;
    const base = current.slice(0, lastUserIndex);
    setMessages(base);
    await runRequest(question, base);
  }, [runRequest, setMessages]);

  const retryLastMessage = regenerateLastMessage;

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const newChat = useCallback(() => resetConversation(), [resetConversation]);

  const clearConversation = useCallback(async () => {
    const id = conversationIdRef.current;
    if (useRemote && id) {
      try {
        const headers = await authHeaders();
        await fetch("/api/chat/history", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify({ action: "delete", conversationId: id }) });
      } catch {
        // Local UI clearing is still allowed when remote deletion cannot complete.
      }
    }
    const localKey = useRemote && user ? `${GUEST_STORAGE_KEY}:${user.id}` : GUEST_STORAGE_KEY;
    window.localStorage.removeItem(localKey);
    resetConversation();
  }, [authHeaders, resetConversation, useRemote, user]);

  const controller = useMemo<FinancialChatbotController>(() => ({
    context,
    title,
    provider,
    isOpen,
    messages,
    isLoading,
    error,
    openFinancialChatbot,
    changeContext,
    closeFinancialChatbot,
    sendMessage,
    retryLastMessage,
    regenerateLastMessage,
    newChat,
    clearConversation,
    stopGeneration,
  }), [changeContext, clearConversation, closeFinancialChatbot, context, error, isLoading, isOpen, messages, newChat, openFinancialChatbot, provider, regenerateLastMessage, retryLastMessage, sendMessage, stopGeneration, title]);

  return <FinancialChatbotContext.Provider value={controller}>{children}</FinancialChatbotContext.Provider>;
}
