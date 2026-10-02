import { NextResponse } from "next/server";
import { getDemoStore } from "@/lib/ai-agent/demo/store";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { DemoLeadGateway } from "@/lib/ai-agent/gateways/demo/demo-lead-gateway";
import { isDemoMode } from "@/lib/ai-agent/demo/mode";
import { createGateways } from "@/lib/ai-agent/gateways";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") ?? defaultTenantId();

  if (isDemoMode()) {
    const leads = new DemoLeadGateway().list(tenantId);
    return NextResponse.json({ leads, mode: "demo" });
  }

  // Local DB path still uses demo list helper when no list API on LeadGateway —
  // fall back to demo store mirror for admin UI in this slice.
  const store = getDemoStore();
  const leads = store.leads.filter((l) => l.tenantId === tenantId);
  void createGateways();
  return NextResponse.json({ leads, mode: "local-or-demo" });
}
