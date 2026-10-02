import { NextResponse } from "next/server";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { getMedia, listSpatialScenes } from "@/lib/ai-agent/presentations/spatial-from-image";
import { getDemoStore } from "@/lib/ai-agent/demo/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const tenantId = new URL(request.url).searchParams.get("tenantId") ?? defaultTenantId();
  const scenes = listSpatialScenes(tenantId).map((scene) => {
    const media = getMedia(scene.mediaId);
    return {
      ...scene,
      media: media
        ? {
            id: media.id,
            filename: media.filename,
            mimeType: media.mimeType,
            dataUrl: media.dataUrl,
            purpose: media.purpose,
          }
        : null,
    };
  });
  return NextResponse.json({
    scenes,
    mediaCount: getDemoStore().mediaAssets.filter((m) => m.tenantId === tenantId).length,
  });
}
