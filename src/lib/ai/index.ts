/** AI integration boundary: model providers are server-only; fallbacks keep Demo Mode reliable. */
export { analyzeReportText, getDemoReportAnalysis } from "./report-fallback";
export { getChatWelcome, getFallbackChatResponse } from "./chat-fallback";
export { generateChatResponse } from "./provider";
export { getGeminiModel, getGeminiStatus, isGeminiAvailable } from "./gemini-status";
