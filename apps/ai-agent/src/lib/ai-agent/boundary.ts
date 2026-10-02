/**
 * ai-agent boundary entry. All orchestration (M3+) must go through this gate.
 * M1 only exposes the kill-switch / shadow decision — no LLM loop.
 */
import { featureFlagService } from "@/lib/ai-agent/feature-flags/service";
import type { FlagDecision, FlagEvaluationContext } from "@/lib/ai-agent/feature-flags/evaluate";

export type AiAgentGateResult = {
  allowed: boolean;
  shadowMode: boolean;
  decision: FlagDecision;
  reason?: string;
};

export async function gateAiAgent(ctx: FlagEvaluationContext): Promise<AiAgentGateResult> {
  const decision = await featureFlagService.assertAiAllowed(ctx);
  if (decision.killSwitchActive) {
    return {
      allowed: false,
      shadowMode: true,
      decision,
      reason: "ai.kill_switch is enabled — orchestration short-circuited",
    };
  }
  if (!decision.enabled) {
    return {
      allowed: false,
      shadowMode: decision.shadowMode,
      decision,
      reason: "ai.orchestrator is disabled",
    };
  }
  return {
    allowed: true,
    shadowMode: decision.shadowMode,
    decision,
  };
}
