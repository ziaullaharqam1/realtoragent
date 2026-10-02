import type { LeadGateway, LeadProfile, LeadUpdate } from "../lead-gateway";
import { getDemoStore, type DemoLead } from "../../demo/store";

function mapLead(row: DemoLead): LeadProfile {
  return {
    id: row.id,
    tenantId: row.tenantId,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    source: row.source,
    state: row.state,
    score: row.score,
    scoreBreakdown: row.scoreBreakdown,
    consentMarketing: row.consentMarketing,
    consentAi: row.consentAi,
    preferredLocale: row.preferredLocale,
    assignedBrokerId: row.assignedBrokerId,
  };
}

export class DemoLeadGateway implements LeadGateway {
  async getById(tenantId: string, leadId: string): Promise<LeadProfile | null> {
    const row = getDemoStore().leads.find((l) => l.tenantId === tenantId && l.id === leadId);
    return row ? mapLead(row) : null;
  }

  async updateProfile(tenantId: string, leadId: string, patch: LeadUpdate): Promise<LeadProfile> {
    const store = getDemoStore();
    const idx = store.leads.findIndex((l) => l.tenantId === tenantId && l.id === leadId);
    if (idx < 0) throw new Error(`Lead not found: ${leadId}`);
    const existing = store.leads[idx]!;
    const updated: DemoLead = {
      ...existing,
      fullName: patch.fullName ?? existing.fullName,
      email: patch.email ?? existing.email,
      phone: patch.phone ?? existing.phone,
      state: patch.state ?? existing.state,
      score: patch.score ?? existing.score,
      scoreBreakdown: patch.scoreBreakdown ?? existing.scoreBreakdown,
      consentMarketing: patch.consentMarketing ?? existing.consentMarketing,
      consentAi: patch.consentAi ?? existing.consentAi,
      preferredLocale: patch.preferredLocale ?? existing.preferredLocale,
      assignedBrokerId:
        patch.assignedBrokerId === undefined ? existing.assignedBrokerId : patch.assignedBrokerId,
      updatedAt: new Date().toISOString(),
    };
    store.leads[idx] = updated;
    return mapLead(updated);
  }

  list(tenantId: string): LeadProfile[] {
    return getDemoStore()
      .leads.filter((l) => l.tenantId === tenantId)
      .map(mapLead);
  }

  create(
    tenantId: string,
    input: Partial<DemoLead> & { source?: string },
  ): LeadProfile {
    const store = getDemoStore();
    const now = new Date().toISOString();
    const lead: DemoLead = {
      id: input.id ?? crypto.randomUUID(),
      tenantId,
      fullName: input.fullName ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      source: input.source ?? "unknown",
      state: input.state ?? "new",
      score: input.score ?? 0,
      scoreBreakdown: input.scoreBreakdown ?? null,
      consentMarketing: input.consentMarketing ?? false,
      consentAi: input.consentAi ?? true,
      preferredLocale: input.preferredLocale ?? "en",
      assignedBrokerId: input.assignedBrokerId ?? null,
      metadata: input.metadata ?? null,
      createdAt: now,
      updatedAt: now,
    };
    store.leads.push(lead);
    return mapLead(lead);
  }
}
