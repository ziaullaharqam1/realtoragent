import { runDailyLeadsDigest, shouldRunDailyDigest } from "./daily-leads";

const globalForTicker = globalThis as unknown as {
  __proppilotDigestTicker?: ReturnType<typeof setInterval>;
  __proppilotDigestTickerStarted?: boolean;
};

/**
 * In-process minute ticker for local/dev so digests fire at the configured
 * time without relying on Vercel Cron. Safe to call multiple times.
 */
export function startDailyLeadsTicker(intervalMs = 60_000): void {
  if (process.env.DISABLE_DIGEST_TICKER === "true") return;
  if (globalForTicker.__proppilotDigestTickerStarted) return;
  globalForTicker.__proppilotDigestTickerStarted = true;

  const tick = () => {
    try {
      const check = shouldRunDailyDigest();
      if (!check.due) return;
      void runDailyLeadsDigest({ triggeredBy: "schedule" }).catch((err) => {
        console.error("[daily-leads] ticker run failed", err);
      });
    } catch (err) {
      console.error("[daily-leads] ticker check failed", err);
    }
  };

  // Immediate check (covers boot after 10:00)
  tick();
  globalForTicker.__proppilotDigestTicker = setInterval(tick, intervalMs);
  // Do not keep the process alive solely for the ticker in tests
  globalForTicker.__proppilotDigestTicker?.unref?.();
}

export function stopDailyLeadsTicker(): void {
  if (globalForTicker.__proppilotDigestTicker) {
    clearInterval(globalForTicker.__proppilotDigestTicker);
    globalForTicker.__proppilotDigestTicker = undefined;
  }
  globalForTicker.__proppilotDigestTickerStarted = false;
}
