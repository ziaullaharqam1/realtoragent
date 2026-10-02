import { NextResponse } from "next/server";
import { processInboundMessage } from "@/lib/ai-agent/orchestrator";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const text = String(body.text ?? body.message ?? "");
  const result = await processInboundMessage({
    tenantId: String(body.tenantId ?? defaultTenantId()),
    channel: "web",
    text,
    conversationId: body.conversationId ? String(body.conversationId) : undefined,
    leadId: body.leadId ? String(body.leadId) : undefined,
    externalUserId: body.externalUserId ? String(body.externalUserId) : undefined,
  });
  return NextResponse.json(result);
}
