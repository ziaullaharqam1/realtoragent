import { describe, expect, it } from "vitest";
import { evaluateFlags, FLAG_KEYS } from "@/lib/ai-agent/feature-flags/evaluate";

describe("evaluateFlags", () => {
  const baseRows = [
    {
      flagKey: FLAG_KEYS.killSwitch,
      scopeType: "global",
      scopeValue: null,
      isEnabled: false,
      shadowMode: true,
    },
    {
      flagKey: FLAG_KEYS.orchestrator,
      scopeType: "global",
      scopeValue: null,
      isEnabled: true,
      shadowMode: true,
    },
  ];

  it("allows AI when orchestrator enabled and kill switch off", () => {
    const decision = evaluateFlags(baseRows, { tenantId: "default" });
    expect(decision.aiAllowed).toBe(true);
    expect(decision.shadowMode).toBe(true);
    expect(decision.killSwitchActive).toBe(false);
  });

  it("short-circuits when kill switch is on", () => {
    const rows = baseRows.map((r) =>
      r.flagKey === FLAG_KEYS.killSwitch ? { ...r, isEnabled: true } : r,
    );
    const decision = evaluateFlags(rows, { tenantId: "default" });
    expect(decision.aiAllowed).toBe(false);
    expect(decision.killSwitchActive).toBe(true);
  });

  it("prefers broker scope over global", () => {
    const rows = [
      ...baseRows,
      {
        flagKey: FLAG_KEYS.orchestrator,
        scopeType: "broker",
        scopeValue: "broker-1",
        isEnabled: false,
        shadowMode: true,
      },
    ];
    const decision = evaluateFlags(rows, { tenantId: "default", brokerId: "broker-1" });
    expect(decision.enabled).toBe(false);
    expect(decision.matchedScope).toBe("broker");
    expect(decision.aiAllowed).toBe(false);
  });

  it("defaults to disabled + shadow when flag missing", () => {
    const decision = evaluateFlags([], { tenantId: "default" });
    expect(decision.enabled).toBe(false);
    expect(decision.shadowMode).toBe(true);
    expect(decision.aiAllowed).toBe(false);
  });
});
