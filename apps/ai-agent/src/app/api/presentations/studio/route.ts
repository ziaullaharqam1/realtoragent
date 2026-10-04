import { NextResponse } from "next/server";
import { createGateways } from "@/lib/ai-agent/gateways";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { getDemoStore, newId } from "@/lib/ai-agent/demo/store";
import {
  DECK_STYLES,
  PRESENTATION_THEMES,
  applyThemeToSpec,
  buildComparePresentation,
  getTheme,
} from "@/lib/ai-agent/presentations/studio";
import { buildPresentationSpec, type DeckStyle } from "@/lib/ai-agent/presentations/spec";
import { getMedia } from "@/lib/ai-agent/presentations/spatial-from-image";
import { emitN8nEvent } from "@/lib/ai-agent/n8n/bridge";
import { getSettings } from "@/lib/ai-agent/config/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDeckStyle(raw: unknown): DeckStyle {
  const value = String(raw ?? "executive");
  if (value === "lifestyle" || value === "investor" || value === "executive") return value;
  return "executive";
}

export async function GET() {
  return NextResponse.json({
    themes: PRESENTATION_THEMES,
    deckStyles: DECK_STYLES,
    modes: [
      { id: "standard", label: "Standard deck", detail: "Full advanced dossier from listings" },
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
  const deckStyle = parseDeckStyle(body.deckStyle);
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
        ? applyThemeToSpec(buildPresentationSpec(properties[0], { deckStyle, themeId }), themeId)
        : {
            version: 2 as const,
            title: scene.title,
            propertyId: "spatial",
            tenantId,
            currency: "AED",
            priceLabel: "Spatial study",
            deckStyle,
            slides: [] as ReturnType<typeof buildPresentationSpec>["slides"],
            generatedAt: new Date().toISOString(),
            source: "property_gateway" as const,
            theme,
          };

    const slides = [
      ...baseSpec.slides.filter((s) => s.type !== "spatial" && s.type !== "floorplan"),
      {
        type: "floorplan" as const,
        title: scene.mode === "3d" ? "3D zone map from upload" : "2D floorplan from upload",
        caption: `${scene.title} · ${scene.rooms.length} zones traced from upload`,
        rooms: scene.rooms,
      },
      {
        type: "spatial" as const,
        title: scene.mode === "3d" ? "3D layout preview" : "2D spatial preview",
        caption: `${scene.title} · ${scene.rooms.length} zones from upload`,
        layoutHint: scene.mode,
        renderer: scene.mode === "3d" ? ("scene-3d" as const) : ("scene-2d" as const),
        rooms: scene.rooms,
      },
      {
        type: "narrative" as const,
        title: "Source image",
        body: media
          ? `Generated from uploaded file “${media.filename}” (${media.purpose}). Room boxes are demo heuristics — wire a vision model for production tracing.`
          : "Source media missing.",
      },
      {
        type: "cta" as const,
        title: "Share this spatial study",
        body: "Export the PowerPoint, attach updated photography, or bind a listing for a full dossier.",
        actions: ["Download PPTX", "Bind a listing", "Book a viewing"],
        contactHint: "PropPilot Presentation Studio",
      },
    ];

    const spec: Record<string, unknown> = {
      ...baseSpec,
      id,
      slides,
      sceneId: scene.id,
      mode: mode || scene.mode,
      deckStyle,
      mediaDataUrl: media?.dataUrl ?? null,
      rooms: scene.rooms,
      camera: scene.camera,
      theme,
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
    const built = applyThemeToSpec(
      buildPresentationSpec(properties[0]!, { deckStyle, themeId }),
      themeId,
    );
    built.id = id;
    const spec: Record<string, unknown> = { ...built, mode, deckStyle };
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
    const compare = buildComparePresentation(properties, themeId, deckStyle);
    presentation = {
      id,
      tenantId,
      leadId: body.leadId ? String(body.leadId) : null,
      title: compare.title,
      spec: { ...compare, id, mode, theme: getTheme(themeId) } as unknown as Record<string, unknown>,
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
      payload: { presentationId: presentation.id, mode, deckStyle },
    });
  }

  return NextResponse.json({ presentation, theme: getTheme(themeId), deckStyle }, { status: 201 });
}
