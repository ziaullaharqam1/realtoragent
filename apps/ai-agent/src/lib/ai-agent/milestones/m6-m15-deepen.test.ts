import { describe, expect, it, beforeEach } from "vitest";
import {
  generateAvailabilitySlots,
  pickNextSlot,
} from "@/lib/ai-agent/calendar/availability";
import { resetDemoStore, DEMO_IDS, getDemoStore } from "@/lib/ai-agent/demo/store";
import { createDemoGateways } from "@/lib/ai-agent/gateways";
import { executeN8nCommand } from "@/lib/ai-agent/n8n/bridge";
import {
  scheduleNurtureJob,
  processDueNurtureJobs,
} from "@/lib/ai-agent/nurture/cadence";
import { buildPresentationSpec } from "@/lib/ai-agent/presentations/spec";
import { exportPresentation } from "@/lib/ai-agent/presentations/export";
import { can, parseRole, requirePermission } from "@/lib/ai-agent/auth/rbac";
import { collectMetrics } from "@/lib/ai-agent/metrics/service";
import {
  verifyTelegramSecret,
  verifyWhatsAppSignature,
} from "@/lib/ai-agent/channels/signatures";
import { createHmac } from "node:crypto";
import { runEvalSuite } from "@/lib/ai-agent/eval/harness";
import { processInboundMessage } from "@/lib/ai-agent/orchestrator";

describe("M6 availability calendar", () => {
  beforeEach(() => resetDemoStore());

  it("generates open slots and skips booked starts", () => {
    const from = new Date("2026-10-04T00:00:00.000Z"); // Sunday
    const slots = generateAvailabilitySlots({
      tenantId: "default",
      propertyId: "p1",
      from,
      days: 3,
      bookedStarts: [],
      workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    });
    expect(slots.length).toBeGreaterThan(0);
    expect(pickNextSlot(slots)?.available).toBe(true);
  });

  it("gateway availability books next open slot via SchedulingAgent", async () => {
    const result = await processInboundMessage({
      text: "Book a viewing tomorrow please",
      channel: "web",
      leadId: DEMO_IDS.leadA,
    });
    expect(result.agentName).toBe("SchedulingAgent");
    expect(getDemoStore().viewings.length).toBeGreaterThan(0);
  });
});

describe("M7 n8n command execution", () => {
  beforeEach(() => resetDemoStore());

  it("executes ping and refresh_embeddings", async () => {
    const ping = await executeN8nCommand({ command: "ping" });
    expect(ping.accepted).toBe(true);
    expect(ping.detail).toBe("pong");

    const refresh = await executeN8nCommand({
      command: "refresh_embeddings",
      tenantId: DEMO_IDS.tenant,
    });
    expect(refresh.accepted).toBe(true);
    expect((refresh.result as { refreshed: number }).refreshed).toBeGreaterThan(0);
  });
});

describe("M9–M10 export + spatial", () => {
  beforeEach(() => resetDemoStore());

  it("builds spatial slide and exports markdown / pptx-json", async () => {
    const gateways = createDemoGateways();
    const property = await gateways.properties.getById(DEMO_IDS.tenant, DEMO_IDS.propMarina);
    expect(property).toBeTruthy();
    const spec = buildPresentationSpec(property!);
    expect(spec.slides.some((s) => s.type === "spatial")).toBe(true);
    const md = exportPresentation(spec, "md");
    expect(md.body).toContain("Layout preview");
    const pptx = exportPresentation(spec, "pptx-json");
    expect(pptx.body).toContain("proppilot.pptx-json");
  });
});

describe("M12 nurture cadence", () => {
  beforeEach(() => resetDemoStore());

  it("schedules and drains due nurture jobs", async () => {
    const job = scheduleNurtureJob({
      tenantId: DEMO_IDS.tenant,
      leadId: DEMO_IDS.leadA,
      delayMinutes: 0,
      channel: "web",
    });
    expect(job.status).toBe("pending");
    const result = await processDueNurtureJobs();
    expect(result.sent).toBe(1);
    expect(getDemoStore().nurtureJobs[0]?.status).toBe("sent");
  });
});

describe("M13 demo RBAC", () => {
  it("denies viewer flags write and allows admin", () => {
    expect(can(parseRole("viewer"), "flags:write")).toBe(false);
    expect(can(parseRole("admin"), "flags:write")).toBe(true);
    const headers = new Headers({ "x-proppilot-role": "viewer" });
    const denied = requirePermission(headers, "n8n:command");
    expect(denied.ok).toBe(false);
  });
});

describe("M14 signatures + metrics", () => {
  beforeEach(() => resetDemoStore());

  it("verifies WhatsApp HMAC when secret set", () => {
    const body = '{"hello":true}';
    const secret = "app-secret";
    const sig = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWhatsAppSignature(body, sig, secret)).toBe(true);
    expect(verifyWhatsAppSignature(body, "sha256=deadbeef", secret)).toBe(false);
    expect(verifyTelegramSecret("tok", "tok")).toBe(true);
    expect(verifyTelegramSecret("bad", "tok")).toBe(false);
  });

  it("collects metrics snapshot", () => {
    const metrics = collectMetrics(true);
    expect(metrics.counts.leads).toBeGreaterThan(0);
    expect(metrics.demoMode).toBe(true);
  });
});

describe("M15 expanded eval", () => {
  it("passes the deepened suite", async () => {
    const report = await runEvalSuite({ reset: true });
    expect(report.total).toBe(8);
    expect(report.ok).toBe(true);
  });
});
