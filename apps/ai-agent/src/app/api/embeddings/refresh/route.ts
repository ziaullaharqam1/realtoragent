import { NextResponse } from "next/server";
import { embeddingService } from "@/lib/ai-agent/embeddings/service";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const tenantId = String(body.tenantId ?? defaultTenantId());
  const result = await embeddingService.refreshPropertyEmbeddings(tenantId);
  return NextResponse.json(result);
}
