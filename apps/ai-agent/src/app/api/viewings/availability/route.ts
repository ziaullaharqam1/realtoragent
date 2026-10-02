import { NextResponse } from "next/server";
import { createGateways } from "@/lib/ai-agent/gateways";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  if (!propertyId) {
    return NextResponse.json({ error: "propertyId required" }, { status: 400 });
  }
  const tenantId = searchParams.get("tenantId") ?? defaultTenantId();
  const brokerId = searchParams.get("brokerId") ?? undefined;
  const days = searchParams.get("days") ? Number(searchParams.get("days")) : 5;
  const gateways = await createGateways();
  const slots = await gateways.viewings.getAvailability(tenantId, {
    propertyId,
    brokerId,
    days,
  });
  return NextResponse.json({ propertyId, tenantId, slots });
}
