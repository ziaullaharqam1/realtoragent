import { getDemoStore, newId, type DemoConsentRecord } from "@/lib/ai-agent/demo/store";

export function recordConsent(input: {
  tenantId: string;
  leadId: string;
  consentType: DemoConsentRecord["consentType"];
  granted: boolean;
  source?: string;
}): DemoConsentRecord {
  const store = getDemoStore();
  const row: DemoConsentRecord = {
    id: newId(),
    tenantId: input.tenantId,
    leadId: input.leadId,
    consentType: input.consentType,
    granted: input.granted,
    source: input.source ?? "api",
    createdAt: new Date().toISOString(),
  };
  store.consents.push(row);

  const lead = store.leads.find((l) => l.id === input.leadId && l.tenantId === input.tenantId);
  if (lead) {
    if (input.consentType === "marketing") lead.consentMarketing = input.granted;
    if (input.consentType === "ai") lead.consentAi = input.granted;
    lead.updatedAt = new Date().toISOString();
  }
  return row;
}

export function latestConsent(
  tenantId: string,
  leadId: string,
  consentType: DemoConsentRecord["consentType"],
): DemoConsentRecord | null {
  const rows = getDemoStore()
    .consents.filter(
      (c) => c.tenantId === tenantId && c.leadId === leadId && c.consentType === consentType,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return rows[0] ?? null;
}

export function hasConsent(
  tenantId: string,
  leadId: string,
  consentType: DemoConsentRecord["consentType"],
): boolean {
  return latestConsent(tenantId, leadId, consentType)?.granted === true;
}
