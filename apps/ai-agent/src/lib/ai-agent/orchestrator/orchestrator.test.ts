import { beforeEach, describe, expect, it } from "vitest";
import { resetDemoStore, getDemoStore, DEMO_IDS } from "@/lib/ai-agent/demo/store";
import { processInboundMessage } from "@/lib/ai-agent/orchestrator";

describe("orchestrator shadow mode", () => {
  beforeEach(() => {
    process.env.DEMO_MODE = "true";
    delete process.env.DATABASE_URL;
    resetDemoStore();
  });

  it("writes ShadowApproval instead of sending when shadowMode is on", async () => {
    const store = getDemoStore();
    const orch = store.flags.find((f) => f.flagKey === "ai.orchestrator")!;
    orch.shadowMode = true;
    orch.isEnabled = true;

    const beforeOutbox = store.outbox.length;
    const result = await processInboundMessage({
      tenantId: DEMO_IDS.tenant,
      channel: "web",
      leadId: DEMO_IDS.leadA,
      text: "Looking for a 2BR in Dubai Marina under 2.5M",
    });

    expect(result.allowed).toBe(true);
    expect(result.shadowMode).toBe(true);
    expect(result.approvalId).toBeTruthy();
    expect(result.replyText).toBeTruthy();
    expect(store.approvals.some((a) => a.id === result.approvalId && a.status === "pending")).toBe(
      true,
    );
    expect(store.outbox.length).toBe(beforeOutbox);
  });

  it("sends via outbox when shadow mode is off", async () => {
    const store = getDemoStore();
    const orch = store.flags.find((f) => f.flagKey === "ai.orchestrator")!;
    orch.shadowMode = false;
    orch.isEnabled = true;

    const before = store.outbox.length;
    const result = await processInboundMessage({
      tenantId: DEMO_IDS.tenant,
      channel: "web",
      leadId: DEMO_IDS.leadA,
      text: "Show me Marina apartments",
    });

    expect(result.shadowMode).toBe(false);
    expect(result.approvalId).toBeUndefined();
    expect(result.outboxId).toBeTruthy();
    expect(store.outbox.length).toBeGreaterThan(before);
  });
});
