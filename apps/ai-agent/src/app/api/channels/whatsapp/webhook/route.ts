import { NextResponse } from "next/server";
import { getChannelAdapter } from "@/lib/ai-agent/channels";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** WhatsApp Cloud API webhook stub — always acks. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN ?? "proppilot-demo";
  if (mode === "subscribe" && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ ok: true, channel: "whatsapp", stub: true });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const adapter = getChannelAdapter("whatsapp");
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
