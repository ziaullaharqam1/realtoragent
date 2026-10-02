import { describe, expect, it } from "vitest";
import { aggregateStatus, liveness } from "@/lib/ai-agent/health/probes";

describe("health probes", () => {
  it("liveness is always ok", async () => {
    const report = await liveness();
    expect(report.status).toBe("ok");
    expect(report.checks[0]?.name).toBe("process");
  });

  it("aggregateStatus prefers down then degraded", () => {
    expect(aggregateStatus([{ name: "a", status: "up" }])).toBe("ok");
    expect(
      aggregateStatus([
        { name: "a", status: "up" },
        { name: "b", status: "degraded" },
      ]),
    ).toBe("degraded");
    expect(
      aggregateStatus([
        { name: "a", status: "degraded" },
        { name: "b", status: "down" },
      ]),
    ).toBe("down");
  });
});
