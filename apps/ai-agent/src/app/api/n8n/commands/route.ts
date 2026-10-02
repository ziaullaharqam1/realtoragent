import { NextResponse } from "next/server";
import { executeN8nCommand, verifySignature } from "@/lib/ai-agent/n8n/bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-proppilot-signature");
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!verifySignature(raw, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const command = String(body.command ?? "");
  const result = await executeN8nCommand({
    command,
    tenantId: body.tenantId ? String(body.tenantId) : undefined,
    payload: (body.payload as Record<string, unknown>) ?? undefined,
  });

  return NextResponse.json(result, { status: result.accepted ? 200 : 400 });
}
