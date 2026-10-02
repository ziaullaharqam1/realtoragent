import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { featureFlags } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/ai-agent/demo/mode";
import { getDemoStore } from "@/lib/ai-agent/demo/store";
import {
  channelFlagKey,
  evaluateFlags,
  type FlagDecision,
  type FlagEvaluationContext,
  FLAG_KEYS,
} from "./evaluate";

export class FeatureFlagService {
  async listForTenant(tenantId: string) {
    if (isDemoMode()) {
      return getDemoStore().flags.filter((f) => f.tenantId === tenantId);
    }
    try {
      const db = getDb();
      return db.select().from(featureFlags).where(eq(featureFlags.tenantId, tenantId));
    } catch {
      return getDemoStore().flags.filter((f) => f.tenantId === tenantId);
    }
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

  async upsertFlag(
    tenantId: string,
    input: {
      flagKey: string;
      isEnabled: boolean;
      shadowMode?: boolean;
      scopeType?: string;
      scopeValue?: string | null;
      description?: string | null;
    },
  ) {
    if (isDemoMode()) {
      const store = getDemoStore();
      const existing = store.flags.find(
        (f) =>
          f.tenantId === tenantId &&
          f.flagKey === input.flagKey &&
          f.scopeType === (input.scopeType ?? "global") &&
          (f.scopeValue ?? null) === (input.scopeValue ?? null),
      );
      if (existing) {
        existing.isEnabled = input.isEnabled;
        if (input.shadowMode != null) existing.shadowMode = input.shadowMode;
        if (input.description != null) existing.description = input.description;
        return existing;
      }
      const created = {
        id: crypto.randomUUID(),
        tenantId,
        flagKey: input.flagKey,
        scopeType: input.scopeType ?? "global",
        scopeValue: input.scopeValue ?? null,
        isEnabled: input.isEnabled,
        shadowMode: input.shadowMode ?? true,
        description: input.description ?? null,
      };
      store.flags.push(created);
      return created;
    }
    throw new Error("Flag upsert via API is demo-mode only in this slice");
  }
}

export const featureFlagService = new FeatureFlagService();
