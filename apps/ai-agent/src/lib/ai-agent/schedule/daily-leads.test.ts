import { beforeEach, describe, expect, it } from "vitest";
import { resetDemoStore, DEMO_IDS } from "@/lib/ai-agent/demo/store";
import { getSettings, updateSettings } from "@/lib/ai-agent/config/settings";
import {
  getZonedClock,
  listLeadDigests,
  parseTimeLocal,
  runDailyLeadsDigest,
  shouldRunDailyDigest,
} from "./daily-leads";
import { stopDailyLeadsTicker } from "./ticker";

describe("daily leads schedule helpers", () => {
  it("defaults parseTimeLocal to 10:00 on bad input", () => {
    expect(parseTimeLocal("10:00")).toEqual({ hour: 10, minute: 0 });
    expect(parseTimeLocal("bad")).toEqual({ hour: 10, minute: 0 });
  });

  it("reads Dubai wall clock via Intl", () => {
    // 2026-03-15T06:00:00Z = 10:00 Asia/Dubai (UTC+4)
    const clock = getZonedClock(new Date("2026-03-15T06:00:00.000Z"), "Asia/Dubai");
    expect(clock.dateKey).toBe("2026-03-15");
    expect(clock.hour).toBe(10);
    expect(clock.minute).toBe(0);
  });
});

describe("daily leads digest job", () => {
  beforeEach(() => {
    stopDailyLeadsTicker();
    resetDemoStore();
  });

  it("defaults schedule to 10:00 Asia/Dubai", () => {
    const s = getSettings().schedule;
    expect(s.enabled).toBe(true);
    expect(s.timeLocal).toBe("10:00");
    expect(s.timezone).toBe("Asia/Dubai");
  });

  it("is not due before configured local time", () => {
    // 05:00 Dubai = 01:00 UTC
    const check = shouldRunDailyDigest(new Date("2026-03-15T01:00:00.000Z"));
    expect(check.due).toBe(false);
    expect(check.reason).toContain("before");
  });

  it("runs with configured LLM (mock) and stores digest with leads", async () => {
    const atTen = new Date("2026-03-15T06:00:00.000Z");
    const result = await runDailyLeadsDigest({
      now: atTen,
      force: true,
      triggeredBy: "manual",
      tenantId: DEMO_IDS.tenant,
    });
    expect(result.ran).toBe(true);
    expect(result.digest).toBeTruthy();
    expect(result.digest!.leadCount).toBeGreaterThan(0);
    expect(result.digest!.highlights.length).toBeGreaterThan(0);
    expect(result.digest!.headline.length).toBeGreaterThan(5);
    expect(listLeadDigests()[0]?.id).toBe(result.digest!.id);
    expect(getSettings().schedule.lastRunDateKey).toBe("2026-03-15");
  });

  it("skips second run same calendar day unless forced", async () => {
    const atTen = new Date("2026-03-15T06:05:00.000Z");
    await runDailyLeadsDigest({ now: atTen, triggeredBy: "schedule" });
    const again = await runDailyLeadsDigest({ now: atTen, triggeredBy: "schedule" });
    expect(again.skipped).toBe(true);
    expect(again.reason).toMatch(/already ran/);

    const forced = await runDailyLeadsDigest({
      now: atTen,
      force: true,
      triggeredBy: "manual",
    });
    expect(forced.ran).toBe(true);
    expect(listLeadDigests().length).toBe(2);
  });

  it("respects configurable timeLocal", () => {
    updateSettings({
      schedule: {
        ...getSettings().schedule,
        timeLocal: "14:30",
        timezone: "Asia/Dubai",
      },
    });
    // 10:00 Dubai — before 14:30
    const morning = shouldRunDailyDigest(new Date("2026-03-15T06:00:00.000Z"));
    expect(morning.due).toBe(false);
    // 14:30 Dubai = 10:30 UTC
    const afternoon = shouldRunDailyDigest(new Date("2026-03-15T10:30:00.000Z"));
    expect(afternoon.due).toBe(true);
  });
});
