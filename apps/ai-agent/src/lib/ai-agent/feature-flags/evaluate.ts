export type FlagScopeType = "global" | "channel" | "lead_source" | "broker";

export type FlagEvaluationContext = {
  tenantId: string;
  channel?: string;
  leadSource?: string;
  brokerId?: string;
};

export type FlagDecision = {
  flagKey: string;
  enabled: boolean;
  shadowMode: boolean;
  matchedScope: FlagScopeType | "default";
  killSwitchActive: boolean;
  /** True when AI orchestration must not run (kill switch or master off). */
  aiAllowed: boolean;
};

export const FLAG_KEYS = {
  killSwitch: "ai.kill_switch",
  orchestrator: "ai.orchestrator",
  channelPrefix: "channel.",
  leadSourcePrefix: "lead_source.",
  brokerPrefix: "broker.",
} as const;

/**
 * Pure evaluation: kill switch wins; more specific scopes override global;
 * missing flags default to disabled + shadowMode true.
 */
export function evaluateFlags(
  rows: Array<{
    flagKey: string;
    scopeType: string;
    scopeValue: string | null;
    isEnabled: boolean;
    shadowMode: boolean;
  }>,
  ctx: FlagEvaluationContext,
  flagKey: string = FLAG_KEYS.orchestrator,
): FlagDecision {
  const kill = pickBest(rows, FLAG_KEYS.killSwitch, ctx);
  const killSwitchActive = kill?.isEnabled === true;
  const target = pickBest(rows, flagKey, ctx);

  const enabled = target?.isEnabled === true;
  const shadowMode = target?.shadowMode ?? true;
  const matchedScope = (target?.scopeType as FlagScopeType | undefined) ?? "default";

  return {
    flagKey,
    enabled,
    shadowMode,
    matchedScope,
    killSwitchActive,
    aiAllowed: !killSwitchActive && enabled,
  };
}

function pickBest(
  rows: Array<{
    flagKey: string;
    scopeType: string;
    scopeValue: string | null;
    isEnabled: boolean;
    shadowMode: boolean;
  }>,
  flagKey: string,
  ctx: FlagEvaluationContext,
) {
  const candidates = rows.filter((r) => r.flagKey === flagKey);
  const order: Array<{ type: FlagScopeType; value?: string }> = [
    { type: "broker", value: ctx.brokerId },
    { type: "lead_source", value: ctx.leadSource },
    { type: "channel", value: ctx.channel },
    { type: "global" },
  ];
  for (const pref of order) {
    if (pref.type !== "global" && !pref.value) continue;
    const hit = candidates.find(
      (c) =>
        c.scopeType === pref.type &&
        (pref.type === "global"
          ? c.scopeValue == null || c.scopeValue === ""
          : c.scopeValue === pref.value),
    );
    if (hit) return hit;
  }
  return undefined;
}

export function channelFlagKey(channel: string): string {
  return `${FLAG_KEYS.channelPrefix}${channel}`;
}
