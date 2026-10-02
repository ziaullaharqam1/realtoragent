type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Simple sliding-window rate limiter (in-memory).
 * Suitable for demo / single-instance; use Redis/Upstash in multi-instance prod.
 */
export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const current = buckets.get(input.key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + input.windowMs;
    buckets.set(input.key, { count: 1, resetAt });
    return { allowed: true, remaining: input.limit - 1, resetAt };
  }
  if (current.count >= input.limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }
  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, input.limit - current.count),
    resetAt: current.resetAt,
  };
}

/** Test helper */
export function resetRateLimits(): void {
  buckets.clear();
}
