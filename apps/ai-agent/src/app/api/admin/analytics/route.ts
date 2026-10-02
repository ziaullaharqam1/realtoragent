import { NextResponse } from "next/server";
import { getDemoStore } from "@/lib/ai-agent/demo/store";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") ?? defaultTenantId();
  const store = getDemoStore();

  const leads = store.leads.filter((l) => l.tenantId === tenantId).length;
  const properties = store.properties.filter((p) => p.tenantId === tenantId).length;
  const conversations = store.conversations.filter((c) => c.tenantId === tenantId).length;
  const messages = store.messages.filter((m) => m.tenantId === tenantId).length;
  const approvalsPending = store.approvals.filter(
    (a) => a.tenantId === tenantId && a.status === "pending",
  ).length;
  const approvalsApproved = store.approvals.filter(
    (a) => a.tenantId === tenantId && a.status === "approved",
  ).length;
  const presentations = store.presentations.filter((p) => p.tenantId === tenantId).length;
  const viewings = store.viewings.filter((v) => v.tenantId === tenantId).length;
  const outbox = store.outbox.filter((o) => o.tenantId === tenantId).length;
  const audits = store.audits.filter((a) => a.tenantId === tenantId).length;

  return NextResponse.json({
    leads,
    properties,
    conversations,
    messages,
    approvalsPending,
    approvalsApproved,
    presentations,
    viewings,
    outbox,
    audits,
  });
}
