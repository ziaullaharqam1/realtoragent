import { describe, expect, it, vi } from "vitest";
import type { LeadGateway, LeadProfile } from "@/lib/ai-agent/gateways/lead-gateway";
import { HttpLeadGateway } from "@/lib/ai-agent/gateways/http/http-lead-gateway";

describe("HttpLeadGateway stub", () => {
  it("returns null on 404", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 404, ok: false });
    vi.stubGlobal("fetch", fetchMock);
    const gw: LeadGateway = new HttpLeadGateway("https://host.example");
    await expect(gw.getById("default", "missing")).resolves.toBeNull();
    vi.unstubAllGlobals();
  });

  it("parses lead JSON on success", async () => {
    const lead: LeadProfile = {
      id: "1",
      tenantId: "default",
      fullName: "Test",
      email: null,
      phone: null,
      source: "web",
      state: "new",
      score: 1,
      scoreBreakdown: null,
      consentMarketing: false,
      consentAi: false,
      preferredLocale: "en",
      assignedBrokerId: null,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => lead,
      }),
    );
    const gw = new HttpLeadGateway("https://host.example");
    await expect(gw.getById("default", "1")).resolves.toEqual(lead);
    vi.unstubAllGlobals();
  });
});
