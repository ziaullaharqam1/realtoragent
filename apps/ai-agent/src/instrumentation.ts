/**
 * Next.js instrumentation — starts the in-process daily leads ticker
 * so local/dev runs fire at the configured time (default 10:00).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { startDailyLeadsTicker } = await import("@/lib/ai-agent/schedule/ticker");
  startDailyLeadsTicker();
}
