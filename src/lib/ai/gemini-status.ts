/** Server-only Gemini configuration helpers. Never return or log the key. */
export function isGeminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
}

export function getGeminiStatus(): "configured" | "not configured" {
  return isGeminiAvailable() ? "configured" : "not configured";
}
