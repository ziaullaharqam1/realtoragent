import { NextResponse } from "next/server";
import { createGateways } from "@/lib/ai-agent/gateways";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { getDemoStore, newId } from "@/lib/ai-agent/demo/store";
import {
  PRESENTATION_THEMES,
  applyThemeToSpec,
  buildComparePresentation,
  getTheme,
} from "@/lib/ai-agent/presentations/studio";
import { buildPresentationSpec } from "@/lib/ai-agent/presentations/spec";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ themes: PRESENTATION_THEMES });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const tenantId = String(body.tenantId ?? defaultTenantId());
  const themeId = body.themeId ? String(body.themeId) : undefined;
  const gateways = createGateways();
  const store = getDemoStore();

  const propertyIds = Array.isArray(body.propertyIds)
    ? body.propertyIds.map(String)
    : body.propertyId
      ? [String(body.propertyId)]
      : [];

  if (propertyIds.length === 0) {
    return NextResponse.json({ error: "propertyId or propertyIds required" }, { status: 400 });
  }

  const properties = [];
  for (const id of propertyIds) {
    const p = await gateways.properties.getById(tenantId, id);
    if (p) properties.push(p);
  }
  if (properties.length === 0) {
    return NextResponse.json({ error: "no properties found" }, { status: 404 });
  }

  const id = newId();
  if (properties.length === 1) {
    const spec = applyThemeToSpec(buildPresentationSpec(properties[0]!), themeId);
    spec.id = id;
    const presentation = {
      id,
      tenantId,
      leadId: body.leadId ? String(body.leadId) : null,
      title: spec.title,
      spec: spec as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString(),
    };
    store.presentations.push(presentation);
    return NextResponse.json({ presentation, theme: getTheme(themeId) }, { status: 201 });
  }

  const compare = buildComparePresentation(properties, themeId);
  const presentation = {
    id,
    tenantId,
    leadId: body.leadId ? String(body.leadId) : null,
    title: compare.title,
    spec: { ...compare, id } as unknown as Record<string, unknown>,
    createdAt: new Date().toISOString(),
  };
  store.presentations.push(presentation);
  return NextResponse.json({ presentation, theme: getTheme(themeId) }, { status: 201 });
}
