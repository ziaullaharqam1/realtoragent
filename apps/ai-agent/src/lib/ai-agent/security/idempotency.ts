import { createHash } from "node:crypto";
import { getDemoStore } from "@/lib/ai-agent/demo/store";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export function rememberIdempotentResponse(input: {
  tenantId: string;
  scope: string;
  key: string;
  response: unknown;
  ttlMs?: number;
}): void {
  const store = getDemoStore();
  const now = Date.now();
  store.idempotency = store.idempotency.filter((r) => Date.parse(r.expiresAt) > now);
  const expiresAt = new Date(now + (input.ttlMs ?? DEFAULT_TTL_MS)).toISOString();
  const existing = store.idempotency.find(
    (r) => r.tenantId === input.tenantId && r.scope === input.scope && r.key === input.key,
  );
  if (existing) {
    existing.responseJson = JSON.stringify(input.response);
    existing.expiresAt = expiresAt;
    return;
  }
  store.idempotency.push({
    key: input.key,
    tenantId: input.tenantId,
    scope: input.scope,
    responseJson: JSON.stringify(input.response),
    createdAt: new Date().toISOString(),
    expiresAt,
  });
}

export function getIdempotentResponse<T = unknown>(
  tenantId: string,
  scope: string,
  key: string,
): T | null {
  const store = getDemoStore();
  const now = Date.now();
  const hit = store.idempotency.find(
    (r) =>
      r.tenantId === tenantId &&
      r.scope === scope &&
      r.key === key &&
      Date.parse(r.expiresAt) > now,
  );
  if (!hit) return null;
  return JSON.parse(hit.responseJson) as T;
}

export function hashBody(body: unknown): string {
  return createHash("sha256").update(JSON.stringify(body ?? {})).digest("hex").slice(0, 32);
}
