/**
 * Demo / in-memory mode: used when DATABASE_URL is missing OR DEMO_MODE=true.
 * Enables Vercel deploys without Postgres/Redis/LLM.
 */
export function isDemoMode(): boolean {
  if ((process.env.DEMO_MODE ?? "").toLowerCase() === "true") return true;
  if (!process.env.DATABASE_URL) return true;
  return false;
}

export function defaultTenantId(): string {
  return process.env.TENANT_DEFAULT ?? "default";
}
