import { describe, expect, it } from "vitest";
import { MockLlmClient, parseQualification } from "@/lib/ai-agent/llm/client";

describe("mock LLM qualification parse", () => {
  it("extracts budget, bedrooms, district, and timeline from buyer text", () => {
    const parsed = parseQualification(
      "Looking for a 2BR in Dubai Marina under 2.5 million AED, ready this month for my family.",
    );
    expect(parsed.bedrooms).toBe(2);
    expect(parsed.district).toBe("Dubai Marina");
    expect(parsed.budgetMaxAed).toBe(2_500_000);
    expect(parsed.timeline).toBe("immediate");
    expect(parsed.buyerType).toBe("end_user");
    expect(parsed.score).toBeGreaterThanOrEqual(70);
  });

  it("returns structured JSON via MockLlmClient qualification intent", async () => {
    process.env.DEMO_MODE = "true";
    delete process.env.DATABASE_URL;
    const llm = new MockLlmClient();
    const result = await llm.complete({
      tenantId: "default",
      agentName: "QualificationAgent",
      intentHint: "qualification",
      messages: [
        {
          role: "user",
          content: "Investor seeking 1 bedroom in JLT, budget AED 1,200,000, flexible timeline.",
        },
      ],
    });
    const parsed = JSON.parse(result.content) as ReturnType<typeof parseQualification>;
    expect(parsed.bedrooms).toBe(1);
    expect(parsed.district).toBe("Jumeirah Lake Towers");
    expect(parsed.budgetMaxAed).toBe(1_200_000);
    expect(parsed.buyerType).toBe("investor");
    expect(result.modelName).toBe("mock-llm");
  });
});
