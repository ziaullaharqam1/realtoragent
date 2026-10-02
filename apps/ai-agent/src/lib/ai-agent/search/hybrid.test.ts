import { beforeEach, describe, expect, it } from "vitest";
import { resetDemoStore, DEMO_IDS } from "@/lib/ai-agent/demo/store";
import { embeddingService, cosineSimilarity, mockEmbed } from "@/lib/ai-agent/embeddings/service";
import { hybridSearch } from "@/lib/ai-agent/search/hybrid";

describe("hybrid search ranking", () => {
  beforeEach(() => {
    process.env.DEMO_MODE = "true";
    delete process.env.DATABASE_URL;
    resetDemoStore();
  });

  it("ranks marina query above unrelated inventory under Dubai hard filter", async () => {
    await embeddingService.refreshPropertyEmbeddings(DEMO_IDS.tenant);
    const hits = await hybridSearch(DEMO_IDS.tenant, {
      query: "sea view marina apartment 2 bedroom",
      city: "Dubai",
      limit: 10,
    });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.city === "Dubai")).toBe(true);
    const top = hits[0]!;
    expect(top.id).toBe(DEMO_IDS.propMarina);
    expect(top.score).toBeGreaterThan(hits[hits.length - 1]!.score - 0.0001);
  });

  it("applies hard filters before semantic ranking", async () => {
    await embeddingService.refreshPropertyEmbeddings(DEMO_IDS.tenant);
    const hits = await hybridSearch(DEMO_IDS.tenant, {
      query: "family home",
      city: "Dubai",
      minBedrooms: 4,
    });
    expect(hits.length).toBe(1);
    expect(hits[0]!.id).toBe(DEMO_IDS.propHills);
  });
});

describe("embedding cosine similarity", () => {
  it("is 1 for identical vectors", () => {
    const a = mockEmbed("dubai marina apartment");
    expect(cosineSimilarity(a, a)).toBeCloseTo(1, 5);
  });

  it("is deterministic for the same text", () => {
    expect(mockEmbed("hello")).toEqual(mockEmbed("hello"));
  });

  it("scores related property text higher than unrelated", () => {
    const q = mockEmbed("dubai marina sea view apartment");
    const marina = mockEmbed(
      "Marina Gate Tower 2 — 2BR with sea view Dubai Marina apartment pool gym",
    );
    const hills = mockEmbed("Damac Hills 4BR townhouse garden golf family");
    expect(cosineSimilarity(q, marina)).toBeGreaterThan(cosineSimilarity(q, hills));
  });
});
