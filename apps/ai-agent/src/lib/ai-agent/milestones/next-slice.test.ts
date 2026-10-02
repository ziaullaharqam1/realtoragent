import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/ai-agent/security/rate-limit";
import { linkChannelIdentity, resolveLeadByIdentity } from "@/lib/ai-agent/channels/identity";
import { processOutbox } from "@/lib/ai-agent/outbox/processor";
import { resetDemoStore, DEMO_IDS, getDemoStore } from "@/lib/ai-agent/demo/store";
import { buildComparePresentation, getTheme } from "@/lib/ai-agent/presentations/studio";
import { runEvalSuite } from "@/lib/ai-agent/eval/harness";
import { processInboundMessage } from "@/lib/ai-agent/orchestrator";
import { takeoverConversation, releaseConversation } from "@/lib/ai-agent/conversations/takeover";

describe("rate limit", () => {
  beforeEach(() => resetRateLimits());

  it("allows under limit and blocks after", () => {
    expect(checkRateLimit({ key: "t", limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit({ key: "t", limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit({ key: "t", limit: 2, windowMs: 60_000 }).allowed).toBe(false);
  });
});

describe("channel identity", () => {
  beforeEach(() => resetDemoStore());

  it("links and resolves lead across channels", () => {
    linkChannelIdentity({
      tenantId: DEMO_IDS.tenant,
      leadId: DEMO_IDS.leadA,
      channel: "whatsapp",
      externalUserId: "+971555010101",
      verified: true,
    });
    expect(resolveLeadByIdentity(DEMO_IDS.tenant, "whatsapp", "+971555010101")).toBe(
      DEMO_IDS.leadA,
    );
  });
});

describe("outbox processor", () => {
  beforeEach(() => resetDemoStore());

  it("drains pending items", async () => {
    const store = getDemoStore();
    store.outbox.push({
      id: "out-1",
      tenantId: DEMO_IDS.tenant,
      channel: "whatsapp",
      destination: "+9715",
      payload: { text: "hi" },
      status: "pending",
      attempts: 0,
      lastError: null,
      createdAt: new Date().toISOString(),
      sentAt: null,
    });
    const result = await processOutbox();
    expect(result.sent).toBe(1);
    expect(store.outbox[0]?.status).toBe("sent");
  });
});

describe("presentation studio", () => {
  it("builds compare decks with theme", () => {
    const theme = getTheme("night");
    expect(theme.id).toBe("night");
    const compare = buildComparePresentation(
      [
        {
          id: "1",
          tenantId: "default",
          title: "A",
          description: null,
          propertyType: "apartment",
          listingType: "sale",
          status: "available",
          city: "Dubai",
          district: "Marina",
          countryCode: "AE",
          bedrooms: 2,
          bathrooms: 2,
          areaSqm: "100",
          priceAmount: "2000000",
          priceCurrency: "AED",
          amenities: ["pool"],
          facts: {},
        },
        {
          id: "2",
          tenantId: "default",
          title: "B",
          description: null,
          propertyType: "apartment",
          listingType: "sale",
          status: "available",
          city: "Dubai",
          district: "JLT",
          countryCode: "AE",
          bedrooms: 1,
          bathrooms: 1,
          areaSqm: "70",
          priceAmount: "1200000",
          priceCurrency: "AED",
          amenities: [],
          facts: {},
        },
      ],
      "night",
    );
    expect(compare.propertyIds).toHaveLength(2);
    expect(compare.themeId).toBe("night");
    expect(compare.slides.length).toBeGreaterThan(2);
  });
});

describe("takeover", () => {
  beforeEach(() => resetDemoStore());

  it("pauses AI while human owns the conversation", async () => {
    const first = await processInboundMessage({
      text: "Show me Marina apartments",
      channel: "web",
      leadId: DEMO_IDS.leadA,
    });
    takeoverConversation({
      tenantId: DEMO_IDS.tenant,
      conversationId: first.conversationId,
      brokerId: DEMO_IDS.brokerA,
    });
    const paused = await processInboundMessage({
      text: "Still interested",
      channel: "web",
      conversationId: first.conversationId,
      leadId: DEMO_IDS.leadA,
    });
    expect(paused.allowed).toBe(false);
    expect(paused.reason).toMatch(/takeover/i);
    releaseConversation({
      tenantId: DEMO_IDS.tenant,
      conversationId: first.conversationId,
    });
    const resumed = await processInboundMessage({
      text: "Match me again in Marina",
      channel: "web",
      conversationId: first.conversationId,
      leadId: DEMO_IDS.leadA,
    });
    expect(resumed.agentName).toBeTruthy();
  });
});

describe("eval harness", () => {
  it("runs the default suite", async () => {
    const report = await runEvalSuite({ reset: true });
    expect(report.total).toBe(3);
    expect(report.passed).toBeGreaterThanOrEqual(2);
  });
});
