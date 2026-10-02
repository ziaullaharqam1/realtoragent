import { NextResponse } from "next/server";
import { getDemoStore, newId } from "@/lib/ai-agent/demo/store";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { createGateways } from "@/lib/ai-agent/gateways";
import { buildPresentationSpec } from "@/lib/ai-agent/presentations/spec";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") ?? defaultTenantId();
  const id = searchParams.get("id");
  const store = getDemoStore();
  if (id) {
    const presentation = store.presentations.find((p) => p.id === id && p.tenantId === tenantId);
    if (!presentation) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ presentation });
  }
  const presentations = store.presentations
    .filter((p) => p.tenantId === tenantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ presentations });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const tenantId = String(body.tenantId ?? defaultTenantId());
  const propertyId = String(body.propertyId ?? "");
  if (!propertyId) {
    return NextResponse.json({ error: "propertyId required" }, { status: 400 });
  }
  const gateways = createGateways();
  const property = await gateways.properties.getById(tenantId, propertyId);
  if (!property) {
    return NextResponse.json({ error: "property not found" }, { status: 404 });
  }
  const spec = buildPresentationSpec(property);
  const id = newId();
  spec.id = id;
  const presentation = {
    id,
    tenantId,
    leadId: body.leadId ? String(body.leadId) : null,
    title: spec.title,
    spec: spec as unknown as Record<string, unknown>,
    createdAt: new Date().toISOString(),
  };
  getDemoStore().presentations.push(presentation);
  return NextResponse.json({ presentation }, { status: 201 });
}
