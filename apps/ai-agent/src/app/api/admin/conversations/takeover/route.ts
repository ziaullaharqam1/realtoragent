import { NextResponse } from "next/server";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { takeoverConversation, releaseConversation } from "@/lib/ai-agent/conversations/takeover";
import { DEMO_IDS } from "@/lib/ai-agent/demo/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const tenantId = String(body.tenantId ?? defaultTenantId());
  const conversationId = String(body.conversationId ?? "");
  const action = String(body.action ?? "");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }
  if (action === "takeover") {
    const brokerId = String(body.brokerId ?? DEMO_IDS.brokerA);
    const result = takeoverConversation({ tenantId, conversationId, brokerId });
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ ok: true, owner: "human", brokerId });
  }
  if (action === "release") {
    const result = releaseConversation({ tenantId, conversationId });
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ ok: true, owner: "ai" });
  }
  return NextResponse.json({ error: "action must be takeover|release" }, { status: 400 });
}
