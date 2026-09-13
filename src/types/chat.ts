export type ChatContextType = "lesson" | "metric" | "asset" | "report" | "hype" | "simulator";

export type ChatUserLevel = "Beginner" | "Intermediate" | "Advanced";

export type ChatContext = {
  type: ChatContextType;
  title: string;
  description?: string;
  asset?: {
    symbol: string;
    name: string;
  };
  metric?: {
    name: string;
    value: number | string;
  };
  data?: Record<string, unknown>;
  userLevel?: ChatUserLevel;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: "streaming" | "complete" | "error";
  provider?: "gemini" | "openai" | "fallback";
};

export type ChatProfileContext = {
  experience?: string;
  riskTolerance?: string;
  riskScore?: number;
  investmentHorizon?: string;
  goal?: string;
};

export type ChatConversation = {
  id: string;
  title: string;
  context: ChatContext;
  createdAt: string;
  updatedAt: string;
};

export type ChatRequest = {
  context: ChatContext;
  messages: Array<Pick<ChatMessage, "role" | "content">>;
  question: string;
};

export type ChatResponse = { answer: string };
