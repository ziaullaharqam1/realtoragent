import { createHash } from "node:crypto";
import { createGateways } from "@/lib/ai-agent/gateways";
import { getDemoStore, newId, type DemoEmbedding } from "@/lib/ai-agent/demo/store";
import { isDemoMode } from "@/lib/ai-agent/demo/mode";
import { toolCallAuditService } from "@/lib/ai-agent/audit/service";

export const EMBEDDING_DIMS = 32;

/** Deterministic mock embedding from text tokens (dim 32). Similar phrases cluster. */
export function mockEmbed(text: string, dims = EMBEDDING_DIMS): number[] {
  const vector = new Array<number>(dims).fill(0);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
  if (tokens.length === 0) {
    const hash = createHash("sha256").update(text).digest();
    for (let i = 0; i < dims; i++) vector[i] = (hash[i % hash.length]! / 255) * 2 - 1;
  } else {
    for (const token of tokens) {
      const hash = createHash("sha256").update(token).digest();
      for (let i = 0; i < dims; i++) {
        const byte = hash[i % hash.length]!;
        vector[i] = vector[i]! + ((byte / 255) * 2 - 1);
      }
    }
  }
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function propertyEmbedText(p: {
  title: string;
  description: string | null;
  city: string | null;
  district: string | null;
  propertyType: string;
  bedrooms: number | null;
  amenities: unknown;
  facts: unknown;
}): string {
  return [
    p.title,
    p.description ?? "",
    p.city ?? "",
    p.district ?? "",
    p.propertyType,
    p.bedrooms != null ? `${p.bedrooms} bedrooms` : "",
    JSON.stringify(p.amenities ?? {}),
    JSON.stringify(p.facts ?? {}),
  ].join(" ");
}

export class EmbeddingService {
  async embedText(text: string): Promise<number[]> {
    // Real embedding API can plug in later when LLM_EMBEDDING_URL is set.
    const baseUrl = process.env.LLM_EMBEDDING_URL;
    const apiKey = process.env.LLM_API_KEY;
    if (baseUrl && apiKey && (process.env.LLM_ENABLED ?? "").toLowerCase() === "true") {
      try {
        const res = await fetch(baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ input: text, model: process.env.LLM_EMBEDDING_MODEL ?? "text-embedding-3-small" }),
        });
        if (res.ok) {
          const data = (await res.json()) as { data?: Array<{ embedding: number[] }> };
          const vec = data.data?.[0]?.embedding;
          if (vec?.length) return vec;
        }
      } catch {
        // fall through to mock
      }
    }
    return mockEmbed(text);
  }

  async refreshPropertyEmbeddings(tenantId: string): Promise<{ refreshed: number }> {
    const started = Date.now();
    const gateways = createGateways();
    const properties = await gateways.properties.search(tenantId, {});
    const store = getDemoStore();
    let refreshed = 0;

    for (const p of properties) {
      const text = propertyEmbedText(p);
      const vector = await this.embedText(text);
      const textHash = createHash("sha256").update(text).digest("hex").slice(0, 16);
      const existing = store.embeddings.find(
        (e) => e.tenantId === tenantId && e.propertyId === p.id,
      );
      if (existing) {
        existing.vector = vector;
        existing.dims = vector.length;
        existing.textHash = textHash;
        existing.updatedAt = new Date().toISOString();
      } else {
        const row: DemoEmbedding = {
          id: newId(),
          tenantId,
          propertyId: p.id,
          model: "mock-hash-v1",
          dims: vector.length,
          vector,
          textHash,
          updatedAt: new Date().toISOString(),
        };
        store.embeddings.push(row);
      }
      refreshed += 1;
    }

    await toolCallAuditService.record({
      tenantId,
      agentName: "EmbeddingService",
      toolName: "embeddings.refresh",
      status: "ok",
      input: { count: properties.length },
      output: { refreshed },
      latencyMs: Date.now() - started,
    });

    return { refreshed };
  }

  getPropertyVector(tenantId: string, propertyId: string): number[] | null {
    const row = getDemoStore().embeddings.find(
      (e) => e.tenantId === tenantId && e.propertyId === propertyId,
    );
    return row?.vector ?? null;
  }

  listEmbeddings(tenantId: string): DemoEmbedding[] {
    return getDemoStore().embeddings.filter((e) => e.tenantId === tenantId);
  }
}

export const embeddingService = new EmbeddingService();

/** Ensure demo embeddings exist (lazy seed). */
export async function ensureDemoEmbeddings(tenantId: string): Promise<void> {
  if (!isDemoMode() && getDemoStore().embeddings.some((e) => e.tenantId === tenantId)) {
    return;
  }
  if (getDemoStore().embeddings.some((e) => e.tenantId === tenantId)) return;
  await embeddingService.refreshPropertyEmbeddings(tenantId);
}
