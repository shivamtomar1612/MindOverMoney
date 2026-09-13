const WINDOW_MS = 60_000;
const MAX_REQUESTS = 18;

type Entry = { count: number; resetAt: number };
const requests = new Map<string, Entry>();

export function checkChatRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const current = requests.get(identifier);

  if (!current || current.resetAt <= now) {
    requests.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }

  current.count += 1;
  if (requests.size > 500) {
    for (const [key, entry] of requests) if (entry.resetAt <= now) requests.delete(key);
  }
  return { allowed: true, retryAfterSeconds: 0 };
}
