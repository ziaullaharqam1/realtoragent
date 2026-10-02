import { NextResponse } from "next/server";
import { getChannelAdapter } from "@/lib/ai-agent/channels";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Telegram Bot API webhook stub — always acks. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const adapter = getChannelAdapter("telegram");
  const normalized = adapter.normalizeInbound(body, defaultTenantId());
  return NextResponse.json({
    ok: true,
    stub: true,
    ack: true,
    normalized: {
      channel: normalized.channel,
      externalUserId: normalized.externalUserId,
      textPreview: normalized.text.slice(0, 120),
    },
  });
}
