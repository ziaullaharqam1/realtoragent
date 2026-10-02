import { NextResponse } from "next/server";
import { featureFlagService } from "@/lib/ai-agent/feature-flags/service";
import { defaultTenantId, isDemoMode } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") ?? defaultTenantId();
  const flags = await featureFlagService.listForTenant(tenantId);
  return NextResponse.json({ flags, demoMode: isDemoMode() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const tenantId = String(body.tenantId ?? defaultTenantId());
  if (!body.flagKey || typeof body.isEnabled !== "boolean") {
    return NextResponse.json({ error: "flagKey and isEnabled required" }, { status: 400 });
  }
  try {
    const flag = await featureFlagService.upsertFlag(tenantId, {
      flagKey: String(body.flagKey),
      isEnabled: Boolean(body.isEnabled),
      shadowMode: body.shadowMode != null ? Boolean(body.shadowMode) : undefined,
      description: body.description != null ? String(body.description) : undefined,
    });
    return NextResponse.json({ flag });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "upsert failed" },
      { status: 400 },
    );
  }
}
