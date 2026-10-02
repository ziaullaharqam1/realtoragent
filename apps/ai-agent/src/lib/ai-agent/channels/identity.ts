import { getDemoStore, newId, type DemoChannelIdentity } from "@/lib/ai-agent/demo/store";

export function linkChannelIdentity(input: {
  tenantId: string;
  leadId: string;
  channel: string;
  externalUserId: string;
  verified?: boolean;
}): DemoChannelIdentity {
  const store = getDemoStore();
  const existing = store.identities.find(
    (i) =>
      i.tenantId === input.tenantId &&
      i.channel === input.channel &&
      i.externalUserId === input.externalUserId,
  );
  if (existing) {
    existing.leadId = input.leadId;
    existing.verified = input.verified ?? existing.verified;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }
  const row: DemoChannelIdentity = {
    id: newId(),
    tenantId: input.tenantId,
    leadId: input.leadId,
    channel: input.channel,
    externalUserId: input.externalUserId,
    verified: input.verified ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.identities.push(row);
  return row;
}

export function resolveLeadByIdentity(
  tenantId: string,
  channel: string,
  externalUserId: string,
): string | null {
  const hit = getDemoStore().identities.find(
    (i) =>
      i.tenantId === tenantId &&
      i.channel === channel &&
      i.externalUserId === externalUserId,
  );
  return hit?.leadId ?? null;
}

export function listIdentitiesForLead(tenantId: string, leadId: string) {
  return getDemoStore().identities.filter((i) => i.tenantId === tenantId && i.leadId === leadId);
}
