import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { featureFlags } from "@/lib/db/schema";
import {
  channelFlagKey,
  evaluateFlags,
  type FlagDecision,
  type FlagEvaluationContext,
  FLAG_KEYS,
} from "./evaluate";

export class FeatureFlagService {
  async listForTenant(tenantId: string) {
    const db = getDb();
    return db.select().from(featureFlags).where(eq(featureFlags.tenantId, tenantId));
  }

  async evaluate(ctx: FlagEvaluationContext, flagKey: string = FLAG_KEYS.orchestrator): Promise<FlagDecision> {
    const rows = await this.listForTenant(ctx.tenantId);
    return evaluateFlags(rows, ctx, flagKey);
  }

  async isChannelEnabled(ctx: FlagEvaluationContext & { channel: string }): Promise<FlagDecision> {
    return this.evaluate(ctx, channelFlagKey(ctx.channel));
  }

  /**
   * Kill-switch gate for the ai-agent boundary. When active, callers must
   * short-circuit orchestration without touching LLM/tools.
   */
  async assertAiAllowed(ctx: FlagEvaluationContext): Promise<FlagDecision> {
    const decision = await this.evaluate(ctx);
    return decision;
  }
}

export const featureFlagService = new FeatureFlagService();
