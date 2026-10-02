import { NextResponse } from "next/server";
import { getChannelAdapter } from "@/lib/ai-agent/channels";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { processInboundMessage } from "@/lib/ai-agent/orchestrator";
import {
  getIdempotentResponse,
  hashBody,
  rememberIdempotentResponse,
} from "@/lib/ai-agent/security/idempotency";
import { checkRateLimit } from "@/lib/ai-agent/security/rate-limit";
import { verifyTelegramSecret } from "@/lib/ai-agent/channels/signatures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const tenantId = defaultTenantId();
  const rate = checkRateLimit({
    key: `tg:${tenantId}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (
    !verifyTelegramSecret(
      request.headers.get("x-telegram-bot-api-secret-token"),
      process.env.TELEGRAM_WEBHOOK_SECRET,
    )
  ) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const idemKey = request.headers.get("x-idempotency-key") ?? `tg:${hashBody(body)}`;
  const cached = getIdempotentResponse(tenantId, "telegram_webhook", idemKey);
  if (cached) {
    return NextResponse.json({ ...(cached as object), idempotentReplay: true });
  }

  const adapter = getChannelAdapter("telegram");
  const normalized = adapter.normalizeInbound(body, tenantId);
  const result = await processInboundMessage({
    tenantId,
    channel: "telegram",
    text: normalized.text,
    externalUserId: normalized.externalUserId,
  });

  const response = {
    ok: true,
    channel: "telegram",
    conversationId: result.conversationId,
    agentName: result.agentName,
    shadowMode: result.shadowMode,
    approvalId: result.approvalId,
    replyPreview: result.replyText?.slice(0, 160) ?? null,
  };
  rememberIdempotentResponse({
    tenantId,
    scope: "telegram_webhook",
    key: idemKey,
    response,
  });
  return NextResponse.json(response);
}
