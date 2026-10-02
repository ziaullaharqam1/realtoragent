export type ProbeStatus = "up" | "down" | "degraded" | "not_configured";

export type ComponentProbe = {
  name: string;
  status: ProbeStatus;
  latencyMs?: number;
  detail?: string;
};

export type HealthReport = {
  status: "ok" | "degraded" | "down";
  checks: ComponentProbe[];
  timestamp: string;
};

export async function checkDatabase(): Promise<ComponentProbe> {
  const started = Date.now();
  const url = process.env.DATABASE_URL;
  if (!url) {
    return { name: "db", status: "not_configured", detail: "DATABASE_URL missing" };
  }
  try {
    const postgres = (await import("postgres")).default;
    const sql = postgres(url, { max: 1, connect_timeout: 5, idle_timeout: 5 });
    try {
      await sql`select 1`;
      return { name: "db", status: "up", latencyMs: Date.now() - started };
    } finally {
      await sql.end({ timeout: 1 });
    }
  } catch (err) {
    return {
      name: "db",
      status: "down",
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message : "db check failed",
    };
  }
}

export async function checkRedis(): Promise<ComponentProbe> {
  const started = Date.now();
  const provider = (process.env.REDIS_PROVIDER ?? "ioredis").toLowerCase();

  if (provider === "upstash") {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!restUrl || !token) {
      return {
        name: "redis",
        status: "not_configured",
        detail: "UPSTASH_REDIS_REST_URL/TOKEN missing",
      };
    }
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url: restUrl, token });
      const pong = await redis.ping();
      return {
        name: "redis",
        status: pong === "PONG" ? "up" : "degraded",
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      return {
        name: "redis",
        status: "down",
        latencyMs: Date.now() - started,
        detail: err instanceof Error ? err.message : "upstash check failed",
      };
    }
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return { name: "redis", status: "not_configured", detail: "REDIS_URL missing" };
  }
  try {
    const Redis = (await import("ioredis")).default;
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
    });
    try {
      await redis.connect();
      const pong = await redis.ping();
      return {
        name: "redis",
        status: pong === "PONG" ? "up" : "degraded",
        latencyMs: Date.now() - started,
      };
    } finally {
      redis.disconnect();
    }
  } catch (err) {
    return {
      name: "redis",
      status: "down",
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message : "redis check failed",
    };
  }
}

/**
 * LLM reachability is intentionally separate from readiness.
 * Missing config => not_configured (degraded app, still ready).
 */
export async function checkLlm(): Promise<ComponentProbe> {
  const started = Date.now();
  const { resolveLlmConfig } = await import("@/lib/ai-agent/llm/providers");
  let settingsLlm = null;
  try {
    const { getSettings } = await import("@/lib/ai-agent/config/settings");
    settingsLlm = getSettings().llm;
  } catch {
    settingsLlm = null;
  }
  const config = resolveLlmConfig(settingsLlm);

  if (config.provider === "mock") {
    return {
      name: "llm",
      status: "up",
      latencyMs: Date.now() - started,
      detail: "mock provider",
    };
  }
  if (!config.enabled) {
    return {
      name: "llm",
      status: "not_configured",
      detail: "LLM disabled in settings",
    };
  }
  if (!config.apiKey || !config.baseUrl) {
    return {
      name: "llm",
      status: "not_configured",
      detail: `${config.provider} selected (default Grok) — set XAI_API_KEY or Config → LLM API key`,
    };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(config.baseUrl, { method: "GET", signal: controller.signal });
    clearTimeout(timer);
    return {
      name: "llm",
      status: res.ok || res.status < 500 ? "up" : "degraded",
      latencyMs: Date.now() - started,
      detail: `${config.provider}:${config.model} HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      name: "llm",
      status: config.fallbackToMock ? "degraded" : "down",
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message : "llm unreachable",
    };
  }
}

export function aggregateStatus(checks: ComponentProbe[]): HealthReport["status"] {
  if (checks.some((c) => c.status === "down")) return "down";
  if (checks.some((c) => c.status === "degraded" || c.status === "not_configured")) {
    return "degraded";
  }
  return "ok";
}

export async function liveness(): Promise<HealthReport> {
  return {
    status: "ok",
    checks: [{ name: "process", status: "up" }],
    timestamp: new Date().toISOString(),
  };
}

function isDemoModeEnv(): boolean {
  if ((process.env.DEMO_MODE ?? "").toLowerCase() === "true") return true;
  if (!process.env.DATABASE_URL) return true;
  return false;
}

export async function readiness(): Promise<HealthReport> {
  if (isDemoModeEnv()) {
    return {
      status: "ok",
      checks: [
        { name: "demo", status: "up", detail: "in-memory demo mode" },
        { name: "db", status: "not_configured", detail: "optional in demo mode" },
        { name: "redis", status: "not_configured", detail: "optional in demo mode" },
      ],
      timestamp: new Date().toISOString(),
    };
  }
  const checks = await Promise.all([checkDatabase(), checkRedis()]);
  return {
    status: aggregateStatus(checks.map((c) => (c.status === "not_configured" ? { ...c, status: "down" as const } : c))),
    checks,
    timestamp: new Date().toISOString(),
  };
}

export async function startup(): Promise<HealthReport> {
  if (isDemoModeEnv()) {
    return {
      status: "ok",
      checks: [{ name: "demo", status: "up", detail: "in-memory demo mode" }],
      timestamp: new Date().toISOString(),
    };
  }
  const db = await checkDatabase();
  const normalized =
    db.status === "not_configured" ? { ...db, status: "down" as const } : db;
  return {
    status: normalized.status === "up" ? "ok" : "down",
    checks: [normalized],
    timestamp: new Date().toISOString(),
  };
}

export async function fullHealth(): Promise<HealthReport> {
  if (isDemoModeEnv()) {
    const llm = await checkLlm();
    return {
      status: llm.status === "up" ? "ok" : "degraded",
      checks: [
        { name: "demo", status: "up", detail: "in-memory demo mode" },
        { name: "db", status: "not_configured", detail: "optional in demo mode" },
        { name: "redis", status: "not_configured", detail: "optional in demo mode" },
        llm,
      ],
      timestamp: new Date().toISOString(),
    };
  }
  const checks = await Promise.all([checkDatabase(), checkRedis(), checkLlm()]);
  // LLM not_configured does not fail overall readiness semantics in full view —
  // report degraded when LLM missing/disabled, down only for db/redis hard fail.
  const critical = checks.filter((c) => c.name !== "llm");
  const criticalStatus = aggregateStatus(
    critical.map((c) => (c.status === "not_configured" ? { ...c, status: "down" as const } : c)),
  );
  const llm = checks.find((c) => c.name === "llm");
  let status: HealthReport["status"] = criticalStatus;
  if (criticalStatus === "ok" && llm && llm.status !== "up") {
    status = "degraded";
  }
  return { status, checks, timestamp: new Date().toISOString() };
}
