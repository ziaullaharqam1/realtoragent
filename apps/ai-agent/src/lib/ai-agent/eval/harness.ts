import { processInboundMessage } from "@/lib/ai-agent/orchestrator";
import { resetDemoStore, DEMO_IDS, getDemoStore } from "@/lib/ai-agent/demo/store";
import { hybridSearch } from "@/lib/ai-agent/search/hybrid";
import { createGateways } from "@/lib/ai-agent/gateways";
import { pickNextSlot } from "@/lib/ai-agent/calendar/availability";
import { executeN8nCommand } from "@/lib/ai-agent/n8n/bridge";
import { buildPresentationSpec } from "@/lib/ai-agent/presentations/spec";
import { exportPresentation } from "@/lib/ai-agent/presentations/export";
import { can, parseRole } from "@/lib/ai-agent/auth/rbac";

export type EvalCase = {
  id: string;
  name: string;
  run: () => Promise<{ pass: boolean; detail: string }>;
};

async function caseQualify(): Promise<{ pass: boolean; detail: string }> {
  const result = await processInboundMessage({
    text: "My budget is 2.2M AED for a 2 bedroom in Marina, moving in 4 weeks",
    channel: "web",
    leadId: DEMO_IDS.leadA,
  });
  const ok =
    Boolean(result.agentName) &&
    (result.agentName === "QualificationAgent" || result.agentName === "MatchingAgent");
  return {
    pass: ok,
    detail: `agent=${result.agentName} shadow=${result.shadowMode}`,
  };
}

async function caseMatch(): Promise<{ pass: boolean; detail: string }> {
  const hits = await hybridSearch(DEMO_IDS.tenant, {
    query: "marina sea view apartment",
    city: "Dubai",
  });
  const top = hits[0];
  const pass = Boolean(top && top.id === DEMO_IDS.propMarina);
  return {
    pass,
    detail: top ? `top=${top.title} score=${top.score.toFixed(2)}` : "no hits",
  };
}

async function caseHandoff(): Promise<{ pass: boolean; detail: string }> {
  const result = await processInboundMessage({
    text: "Please handoff to a human broker now",
    channel: "web",
    leadId: DEMO_IDS.leadA,
  });
  return {
    pass: result.agentName === "HandoffAgent",
    detail: `agent=${result.agentName}`,
  };
}

async function caseAvailability(): Promise<{ pass: boolean; detail: string }> {
  const gateways = await createGateways();
  const slots = await gateways.viewings.getAvailability(DEMO_IDS.tenant, {
    propertyId: DEMO_IDS.propMarina,
    brokerId: DEMO_IDS.brokerA,
    days: 5,
  });
  const next = pickNextSlot(slots);
  return {
    pass: Boolean(next && slots.length > 0),
    detail: next ? `next=${next.start} count=${slots.length}` : "no slots",
  };
}

async function caseN8nPing(): Promise<{ pass: boolean; detail: string }> {
  const result = await executeN8nCommand({ command: "ping" });
  return { pass: result.accepted && result.detail === "pong", detail: result.detail };
}

async function caseExport(): Promise<{ pass: boolean; detail: string }> {
  const gateways = await createGateways();
  const property = await gateways.properties.getById(DEMO_IDS.tenant, DEMO_IDS.propMarina);
  if (!property) return { pass: false, detail: "property missing" };
  const spec = buildPresentationSpec(property);
  const hasSpatial = spec.slides.some((s) => s.type === "spatial");
  const md = exportPresentation(spec, "md");
  return {
    pass: hasSpatial && md.body.includes(property.title),
    detail: `slides=${spec.slides.length} spatial=${hasSpatial}`,
  };
}

async function caseRbac(): Promise<{ pass: boolean; detail: string }> {
  const viewer = parseRole("viewer");
  const broker = parseRole("broker");
  const pass = !can(viewer, "flags:write") && can(broker, "takeover") && can(parseRole("admin"), "eval:run");
  return { pass, detail: `viewer/broker/admin matrix ok=${pass}` };
}

async function caseNurtureSchedule(): Promise<{ pass: boolean; detail: string }> {
  const result = await executeN8nCommand({
    command: "schedule_nurture",
    payload: { leadId: DEMO_IDS.leadA, delayMinutes: 0 },
  });
  const run = await executeN8nCommand({ command: "run_nurture" });
  const sent = getDemoStore().nurtureJobs.some((j) => j.status === "sent");
  return {
    pass: Boolean(result.accepted && run.accepted && sent),
    detail: `schedule=${result.detail}; run=${run.detail}`,
  };
}

export const DEFAULT_EVAL_CASES: EvalCase[] = [
  { id: "qualify-budget", name: "Qualify budget/timeline intent", run: caseQualify },
  { id: "hybrid-marina", name: "Hybrid search ranks Marina listing", run: caseMatch },
  { id: "handoff", name: "Handoff agent routes on request", run: caseHandoff },
  { id: "availability", name: "Viewing calendar returns open slots", run: caseAvailability },
  { id: "n8n-ping", name: "n8n command bridge responds", run: caseN8nPing },
  { id: "export-spatial", name: "Presentation export + spatial slide", run: caseExport },
  { id: "rbac", name: "Demo RBAC permission matrix", run: caseRbac },
  { id: "nurture", name: "Nurture schedule + drain", run: caseNurtureSchedule },
];

export async function runEvalSuite(options?: { reset?: boolean }) {
  if (options?.reset !== false) {
    resetDemoStore();
  }
  const results = [];
  for (const c of DEFAULT_EVAL_CASES) {
    try {
      const outcome = await c.run();
      results.push({ id: c.id, name: c.name, ...outcome });
    } catch (err) {
      results.push({
        id: c.id,
        name: c.name,
        pass: false,
        detail: err instanceof Error ? err.message : "eval error",
      });
    }
  }
  const passed = results.filter((r) => r.pass).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    ok: passed === results.length,
    results,
    ranAt: new Date().toISOString(),
  };
}
