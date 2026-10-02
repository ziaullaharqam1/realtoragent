import type { LeadGateway, LeadProfile, LeadUpdate } from "../lead-gateway";

/**
 * Stub for future host real-estate API. Selected when GATEWAY_MODE=http.
 * Not used in M1 Local mode.
 */
export class HttpLeadGateway implements LeadGateway {
  constructor(private readonly baseUrl: string) {}

  async getById(tenantId: string, leadId: string): Promise<LeadProfile | null> {
    const res = await fetch(`${this.baseUrl}/tenants/${tenantId}/leads/${leadId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HttpLeadGateway getById failed: ${res.status}`);
    return (await res.json()) as LeadProfile;
  }

  async updateProfile(tenantId: string, leadId: string, patch: LeadUpdate): Promise<LeadProfile> {
    const res = await fetch(`${this.baseUrl}/tenants/${tenantId}/leads/${leadId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`HttpLeadGateway updateProfile failed: ${res.status}`);
    return (await res.json()) as LeadProfile;
  }
}
