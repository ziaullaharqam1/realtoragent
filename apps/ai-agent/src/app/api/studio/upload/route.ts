import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/ai-agent/auth/rbac";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import {
  buildSpatialSceneFromMedia,
  saveMediaAsset,
} from "@/lib/ai-agent/presentations/spatial-from-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = requirePermission(request.headers, "studio:spatial");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => ({}))) as {
    filename?: string;
    mimeType?: string;
    dataUrl?: string;
    mode?: "2d" | "3d";
    purpose?: "floorplan" | "photo" | "other";
    title?: string;
    tenantId?: string;
  };

  if (!body.dataUrl || !body.filename) {
    return NextResponse.json({ error: "filename and dataUrl required" }, { status: 400 });
  }
  if (!body.dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "only image uploads supported" }, { status: 400 });
  }
  // Guard demo memory size (~2.5MB data URL)
  if (body.dataUrl.length > 3_500_000) {
    return NextResponse.json({ error: "image too large (max ~2.5MB)" }, { status: 413 });
  }

  const tenantId = body.tenantId ?? defaultTenantId();
  const media = saveMediaAsset({
    tenantId,
    filename: body.filename,
    mimeType: body.mimeType ?? "image/png",
    dataUrl: body.dataUrl,
    purpose: body.purpose ?? "floorplan",
  });
  const mode = body.mode === "3d" ? "3d" : "2d";
  const scene = buildSpatialSceneFromMedia({
    tenantId,
    mediaId: media.id,
    mode,
    title: body.title,
  });

  return NextResponse.json({ media, scene }, { status: 201 });
}
