import { NextResponse } from "next/server";
import { getChannelAdapter } from "@/lib/ai-agent/channels";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { processInboundMessage } from "@/lib/ai-agent/orchestrator";
import { getIdempotentResponse, hashBody, rememberIdempotentResponse } from "@/lib/ai-agent/security/idempotency";
import { checkRateLimit } from "@/lib/ai-agent/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** WhatsApp Cloud API webhook — verify + process inbound when channel enabled. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN ?? "proppilot-demo";
  if (mode === "subscribe" && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ ok: true, channel: "whatsapp" });
}

export async function POST(request: Request) {
  const tenantId = defaultTenantId();
  const rate = checkRateLimit({
    key: `wa:${tenantId}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const idemKey =
    request.headers.get("x-idempotency-key") ?? `wa:${hashBody(body)}`;
  const cached = getIdempotentResponse(tenantId, "whatsapp_webhook", idemKey);
  if (cached) {
    return NextResponse.json({ ...(cached as object), idempotentReplay: true });
  }

  const adapter = getChannelAdapter("whatsapp");
  const normalized = adapter.normalizeInbound(body, tenantId);
  const result = await processInboundMessage({
    tenantId,
    channel: "whatsapp",
    text: normalized.text,
    externalUserId: normalized.externalUserId,
    leadId: normalized.leadId,
  });

  const response = {
    ok: true,
    channel: "whatsapp",
    conversationId: result.conversationId,
    agentName: result.agentName,
    shadowMode: result.shadowMode,
    approvalId: result.approvalId,
    replyPreview: result.replyText?.slice(0, 160) ?? null,
  };
  rememberIdempotentResponse({
    tenantId,
    scope: "whatsapp_webhook",
    key: idemKey,
    response,
  });
  return NextResponse.json(response);
}
