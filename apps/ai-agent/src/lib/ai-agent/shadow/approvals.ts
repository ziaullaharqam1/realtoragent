import { getDemoStore, newId, type DemoShadowApproval } from "@/lib/ai-agent/demo/store";

export type CreateShadowApprovalInput = {
  tenantId: string;
  conversationId?: string | null;
  leadId?: string | null;
  channel: string;
  draftPayload: Record<string, unknown>;
};

export function createShadowApproval(input: CreateShadowApprovalInput): DemoShadowApproval {
  const row: DemoShadowApproval = {
    id: newId(),
    tenantId: input.tenantId,
    conversationId: input.conversationId ?? null,
    leadId: input.leadId ?? null,
    channel: input.channel,
    draftPayload: input.draftPayload,
    status: "pending",
    decisionNote: null,
    createdAt: new Date().toISOString(),
    decidedAt: null,
  };
  getDemoStore().approvals.push(row);
  return row;
}

export function listShadowApprovals(
  tenantId: string,
  status?: DemoShadowApproval["status"],
): DemoShadowApproval[] {
  return getDemoStore()
    .approvals.filter((a) => a.tenantId === tenantId && (!status || a.status === status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getShadowApproval(
  tenantId: string,
  id: string,
): DemoShadowApproval | null {
  return getDemoStore().approvals.find((a) => a.tenantId === tenantId && a.id === id) ?? null;
}

export function decideShadowApproval(
  tenantId: string,
  id: string,
  decision: "approved" | "rejected",
  note?: string,
): DemoShadowApproval {
  const row = getShadowApproval(tenantId, id);
  if (!row) throw new Error(`Approval not found: ${id}`);
  if (row.status !== "pending") throw new Error(`Approval already ${row.status}`);
  row.status = decision;
  row.decisionNote = note ?? null;
  row.decidedAt = new Date().toISOString();
  return row;
}
