/**
 * Intentionally empty: the daily-leads ticker pulls Node modules that break
 * the instrumentation webpack graph. The ticker starts from Node route
 * handlers (`/api/cron/daily-leads`, `/api/admin/digests`, `/api/health`).
 */
export async function register() {
  // no-op
}
