import { NextResponse } from "next/server";
import { receiveN8nCommand, verifySignature } from "@/lib/ai-agent/n8n/bridge";
import { embeddingService } from "@/lib/ai-agent/embeddings/service";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

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
  const result = receiveN8nCommand({
    command,
    tenantId: body.tenantId ? String(body.tenantId) : undefined,
    payload: (body.payload as Record<string, unknown>) ?? undefined,
  });

  if (result.accepted && command === "refresh_embeddings") {
    const tenantId = String(body.tenantId ?? defaultTenantId());
    const refreshed = await embeddingService.refreshPropertyEmbeddings(tenantId);
    return NextResponse.json({ ...result, refreshed });
  }

  return NextResponse.json(result, { status: result.accepted ? 200 : 400 });
}
