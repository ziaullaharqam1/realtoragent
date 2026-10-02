import { createGateways } from "@/lib/ai-agent/gateways";
import type { PropertyDetails, PropertySearchFilters } from "@/lib/ai-agent/gateways/property-gateway";
import {
  cosineSimilarity,
  embeddingService,
  ensureDemoEmbeddings,
} from "@/lib/ai-agent/embeddings/service";

export type HybridSearchInput = PropertySearchFilters & {
  query?: string;
  limit?: number;
};

export type HybridSearchHit = PropertyDetails & {
  score: number;
  hardMatch: boolean;
  semanticScore: number;
};

/**
 * Hybrid search: hard filters via PropertyGateway, then cosine rank on embeddings.
 */
export async function hybridSearch(
  tenantId: string,
  input: HybridSearchInput,
): Promise<HybridSearchHit[]> {
  await ensureDemoEmbeddings(tenantId);
  const gateways = createGateways();
  const { query, limit = 20, ...filters } = input;
  const hard = await gateways.properties.search(tenantId, filters);

  if (!query || query.trim().length === 0) {
    return hard.slice(0, limit).map((p) => ({
      ...p,
      score: 1,
      hardMatch: true,
      semanticScore: 0,
    }));
  }

  const queryVec = await embeddingService.embedText(query);
  const scored: HybridSearchHit[] = hard.map((p) => {
    const vec = embeddingService.getPropertyVector(tenantId, p.id);
    const semanticScore = vec ? cosineSimilarity(queryVec, vec) : 0;
    // Boost lexical title/district overlap
    const hay = `${p.title} ${p.district ?? ""} ${p.city ?? ""} ${p.description ?? ""}`.toLowerCase();
    const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const hits = tokens.filter((t) => hay.includes(t)).length;
    const lexical = tokens.length ? hits / tokens.length : 0;
    const score = semanticScore * 0.7 + lexical * 0.3;
    return { ...p, score, hardMatch: true, semanticScore };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
