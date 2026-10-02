import { and, eq } from "drizzle-orm";
import type { AppDb } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import type { LeadGateway, LeadProfile, LeadUpdate } from "../lead-gateway";

function mapLead(row: typeof leads.$inferSelect): LeadProfile {
  return {
    id: row.id,
    tenantId: row.tenantId,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    source: row.source,
    state: row.state,
    score: row.score,
    scoreBreakdown: (row.scoreBreakdownJson as Record<string, unknown> | null) ?? null,
    consentMarketing: row.consentMarketing,
    consentAi: row.consentAi,
    preferredLocale: row.preferredLocale,
    assignedBrokerId: row.assignedBrokerId,
  };
}

export class LocalLeadGateway implements LeadGateway {
  constructor(private readonly db: AppDb) {}

  async getById(tenantId: string, leadId: string): Promise<LeadProfile | null> {
    const rows = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), eq(leads.id, leadId)))
      .limit(1);
    return rows[0] ? mapLead(rows[0]) : null;
  }

  async updateProfile(tenantId: string, leadId: string, patch: LeadUpdate): Promise<LeadProfile> {
    const existing = await this.getById(tenantId, leadId);
    if (!existing) {
      throw new Error(`Lead not found: ${leadId}`);
    }
    const [updated] = await this.db
      .update(leads)
      .set({
        fullName: patch.fullName ?? existing.fullName,
        email: patch.email ?? existing.email,
        phone: patch.phone ?? existing.phone,
        state: patch.state ?? existing.state,
        score: patch.score ?? existing.score,
        scoreBreakdownJson: patch.scoreBreakdown ?? existing.scoreBreakdown,
        consentMarketing: patch.consentMarketing ?? existing.consentMarketing,
        consentAi: patch.consentAi ?? existing.consentAi,
        preferredLocale: patch.preferredLocale ?? existing.preferredLocale,
        assignedBrokerId:
          patch.assignedBrokerId === undefined
            ? existing.assignedBrokerId
            : patch.assignedBrokerId,
        updatedAt: new Date(),
      })
      .where(and(eq(leads.tenantId, tenantId), eq(leads.id, leadId)))
      .returning();
    return mapLead(updated);
  }
}
