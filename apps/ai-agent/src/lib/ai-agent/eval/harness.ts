import { processInboundMessage } from "@/lib/ai-agent/orchestrator";
import { resetDemoStore, DEMO_IDS } from "@/lib/ai-agent/demo/store";
import { hybridSearch } from "@/lib/ai-agent/search/hybrid";

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

export const DEFAULT_EVAL_CASES: EvalCase[] = [
  { id: "qualify-budget", name: "Qualify budget/timeline intent", run: caseQualify },
  { id: "hybrid-marina", name: "Hybrid search ranks Marina listing", run: caseMatch },
  { id: "handoff", name: "Handoff agent routes on request", run: caseHandoff },
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
