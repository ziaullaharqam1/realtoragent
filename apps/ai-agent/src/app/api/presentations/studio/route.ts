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
import { getMedia } from "@/lib/ai-agent/presentations/spatial-from-image";
import { emitN8nEvent } from "@/lib/ai-agent/n8n/bridge";
import { getSettings } from "@/lib/ai-agent/config/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    themes: PRESENTATION_THEMES,
    modes: [
      { id: "standard", label: "Standard deck", detail: "Fact slides from listings" },
      { id: "2d", label: "2D floorplan", detail: "Upload plan → editable 2D rooms" },
      { id: "3d", label: "3D scene", detail: "Upload photo/plan → 3D placeholder scene" },
      { id: "canva", label: "Canva-style canvas", detail: "Slide canvas preview + PPTX export" },
    ],
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const tenantId = String(body.tenantId ?? defaultTenantId());
  const themeId = body.themeId ? String(body.themeId) : undefined;
  const mode = String(body.mode ?? "standard");
  const sceneId = body.sceneId ? String(body.sceneId) : null;
  const gateways = createGateways();
  const store = getDemoStore();

  const propertyIds = Array.isArray(body.propertyIds)
    ? body.propertyIds.map(String)
    : body.propertyId
      ? [String(body.propertyId)]
      : [];

  if (propertyIds.length === 0 && !sceneId) {
    return NextResponse.json({ error: "propertyId(s) or sceneId required" }, { status: 400 });
  }

  const properties = [];
  for (const id of propertyIds) {
    const p = await gateways.properties.getById(tenantId, id);
    if (p) properties.push(p);
  }

  const id = newId();
  let presentation;

  if (sceneId) {
    const scene = store.spatialScenes.find((s) => s.id === sceneId);
    if (!scene) {
      return NextResponse.json({ error: "scene not found" }, { status: 404 });
    }
    const media = getMedia(scene.mediaId);
    const theme = getTheme(themeId);
    const baseSpec =
      properties[0] != null
        ? applyThemeToSpec(buildPresentationSpec(properties[0]), themeId)
        : {
            version: 1 as const,
            title: scene.title,
            propertyId: "spatial",
            tenantId,
            currency: "AED",
            priceLabel: "Spatial study",
            slides: [] as ReturnType<typeof buildPresentationSpec>["slides"],
            generatedAt: new Date().toISOString(),
            source: "property_gateway" as const,
            theme,
          };

    const slides = [
      ...baseSpec.slides.filter((s) => s.type !== "spatial"),
      {
        type: "spatial" as const,
        title: scene.mode === "3d" ? "3D layout preview" : "2D floorplan",
        caption: `${scene.title} · ${scene.rooms.length} zones from upload`,
        layoutHint: scene.mode,
        renderer: "placeholder-3d" as const,
      },
      {
        type: "narrative" as const,
        title: "Source image",
        body: media
          ? `Generated from uploaded file “${media.filename}” (${media.purpose}). Room boxes are demo heuristics — wire a vision model for production tracing.`
          : "Source media missing.",
      },
    ];

    const spec: Record<string, unknown> = {
      ...baseSpec,
      id,
      slides,
      sceneId: scene.id,
      mode: mode || scene.mode,
      mediaDataUrl: media?.dataUrl ?? null,
      rooms: scene.rooms,
      camera: scene.camera,
    };

    presentation = {
      id,
      tenantId,
      leadId: body.leadId ? String(body.leadId) : null,
      title: String(spec.title ?? scene.title),
      spec,
      createdAt: new Date().toISOString(),
    };
    store.presentations.push(presentation);
  } else if (properties.length === 1) {
    const built = applyThemeToSpec(buildPresentationSpec(properties[0]!), themeId);
    built.id = id;
    const spec: Record<string, unknown> = { ...built, mode };
    presentation = {
      id,
      tenantId,
      leadId: body.leadId ? String(body.leadId) : null,
      title: built.title,
      spec,
      createdAt: new Date().toISOString(),
    };
    store.presentations.push(presentation);
  } else if (properties.length > 1) {
    const compare = buildComparePresentation(properties, themeId);
    presentation = {
      id,
      tenantId,
      leadId: body.leadId ? String(body.leadId) : null,
      title: compare.title,
      spec: { ...compare, id, mode } as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString(),
    };
    store.presentations.push(presentation);
  } else {
    return NextResponse.json({ error: "no properties found" }, { status: 404 });
  }

  const settings = getSettings();
  if (settings.triggers.find((t) => t.id === "presentation_ready")?.enabled) {
    await emitN8nEvent({
      type: "presentation.ready",
      tenantId,
      payload: { presentationId: presentation.id, mode },
    });
  }

  return NextResponse.json({ presentation, theme: getTheme(themeId) }, { status: 201 });
}
