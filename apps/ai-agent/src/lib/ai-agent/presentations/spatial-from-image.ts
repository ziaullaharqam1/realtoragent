import { getDemoStore, newId, type DemoMediaAsset, type DemoSpatialScene } from "@/lib/ai-agent/demo/store";

export type UploadInput = {
  tenantId: string;
  filename: string;
  mimeType: string;
  dataUrl: string;
  purpose?: "floorplan" | "photo" | "other";
};

/** Persist uploaded image in demo store (data URL). */
export function saveMediaAsset(input: UploadInput): DemoMediaAsset {
  const asset: DemoMediaAsset = {
    id: newId(),
    tenantId: input.tenantId,
    filename: input.filename,
    mimeType: input.mimeType,
    dataUrl: input.dataUrl,
    widthHint: 1024,
    heightHint: 768,
    purpose: input.purpose ?? "floorplan",
    createdAt: new Date().toISOString(),
  };
  getDemoStore().mediaAssets.push(asset);
  return asset;
}

/**
 * Derive a demo 2D floorplan / 3D scene from an uploaded image.
 * Heuristic room boxes — production would call a vision / floorplan model.
 */
export function buildSpatialSceneFromMedia(options: {
  tenantId: string;
  mediaId: string;
  mode: "2d" | "3d";
  title?: string;
}): DemoSpatialScene {
  const media = getDemoStore().mediaAssets.find((m) => m.id === options.mediaId);
  if (!media) throw new Error("media not found");

  const rooms =
    options.mode === "2d"
      ? [
          { id: "living", label: "Living", x: 8, y: 12, w: 42, h: 38 },
          { id: "kitchen", label: "Kitchen", x: 52, y: 12, w: 38, h: 22 },
          { id: "bedroom", label: "Bedroom", x: 52, y: 38, w: 38, h: 32 },
          { id: "bath", label: "Bath", x: 8, y: 54, w: 22, h: 18 },
        ]
      : [
          { id: "shell", label: "Volume", x: 20, y: 20, w: 60, h: 55 },
          { id: "opening", label: "View plane", x: 35, y: 28, w: 30, h: 24 },
        ];

  const scene: DemoSpatialScene = {
    id: newId(),
    tenantId: options.tenantId,
    mediaId: options.mediaId,
    mode: options.mode,
    title: options.title ?? `${options.mode.toUpperCase()} from ${media.filename}`,
    rooms,
    camera: options.mode === "3d" ? { yaw: -24, pitch: 52, zoom: 1.15 } : { yaw: 0, pitch: 90, zoom: 1 },
    createdAt: new Date().toISOString(),
  };
  getDemoStore().spatialScenes.push(scene);
  return scene;
}

export function listSpatialScenes(tenantId: string): DemoSpatialScene[] {
  return getDemoStore()
    .spatialScenes.filter((s) => s.tenantId === tenantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMedia(mediaId: string): DemoMediaAsset | null {
  return getDemoStore().mediaAssets.find((m) => m.id === mediaId) ?? null;
}
