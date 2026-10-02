import { NextResponse } from "next/server";
import { processOutbox } from "@/lib/ai-agent/outbox/processor";
import { getDemoStore } from "@/lib/ai-agent/demo/store";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") ?? defaultTenantId();
  const items = getDemoStore()
    .outbox.filter((o) => o.tenantId === tenantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { limit?: number };
  const result = await processOutbox(body.limit ?? 25);
  return NextResponse.json(result);
}
