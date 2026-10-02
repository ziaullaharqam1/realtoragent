import { NextResponse } from "next/server";
import {
  createShadowApproval,
  listShadowApprovals,
} from "@/lib/ai-agent/shadow/approvals";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") ?? defaultTenantId();
  const status = searchParams.get("status") as "pending" | "approved" | "rejected" | null;
  const approvals = listShadowApprovals(tenantId, status ?? undefined);
  return NextResponse.json({ approvals });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const approval = createShadowApproval({
    tenantId: String(body.tenantId ?? defaultTenantId()),
    conversationId: body.conversationId ? String(body.conversationId) : null,
    leadId: body.leadId ? String(body.leadId) : null,
    channel: String(body.channel ?? "web"),
    draftPayload: (body.draftPayload as Record<string, unknown>) ?? {
      text: String(body.text ?? ""),
    },
  });
  return NextResponse.json({ approval }, { status: 201 });
}
