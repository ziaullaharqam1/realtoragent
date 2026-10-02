import { describe, expect, it, beforeEach } from "vitest";
import {
  authenticateUser,
  encodeSession,
  decodeSession,
} from "@/lib/ai-agent/auth/session";
import { resetDemoStore, DEMO_IDS, getDemoStore } from "@/lib/ai-agent/demo/store";
import { getSettings, updateSettings } from "@/lib/ai-agent/config/settings";
import {
  saveMediaAsset,
  buildSpatialSceneFromMedia,
} from "@/lib/ai-agent/presentations/spatial-from-image";
import { buildPresentationSpec } from "@/lib/ai-agent/presentations/spec";
import { buildPptxBuffer } from "@/lib/ai-agent/presentations/pptx";
import { createDemoGateways } from "@/lib/ai-agent/gateways";

describe("login session", () => {
  it("authenticates demo admin and round-trips cookie token", () => {
    const principal = authenticateUser("admin@proppilot.demo", "proppilot");
    expect(principal?.role).toBe("admin");
    const token = encodeSession(principal!);
    expect(decodeSession(token)?.displayName).toBe("Sara Admin");
    expect(authenticateUser("admin@proppilot.demo", "wrong")).toBeNull();
  });
});

describe("configuration settings", () => {
  beforeEach(() => resetDemoStore());

  it("stores channel credentials and triggers", () => {
    const settings = getSettings();
    expect(settings.triggers.length).toBeGreaterThan(3);
    const next = updateSettings({
      whatsapp: { ...settings.whatsapp, enabled: true, accessToken: "wa-token-12345" },
    });
    expect(next.whatsapp.enabled).toBe(true);
    expect(getDemoStore().settings?.whatsapp.accessToken).toContain("wa-token");
  });
});

describe("spatial upload → 2d/3d", () => {
  beforeEach(() => resetDemoStore());

  it("builds scenes from uploaded image data URL", () => {
    const media = saveMediaAsset({
      tenantId: DEMO_IDS.tenant,
      filename: "plan.png",
      mimeType: "image/png",
      dataUrl: "data:image/png;base64,aaaa",
      purpose: "floorplan",
    });
    const scene2d = buildSpatialSceneFromMedia({
      tenantId: DEMO_IDS.tenant,
      mediaId: media.id,
      mode: "2d",
    });
    const scene3d = buildSpatialSceneFromMedia({
      tenantId: DEMO_IDS.tenant,
      mediaId: media.id,
      mode: "3d",
    });
    expect(scene2d.rooms.length).toBeGreaterThan(1);
    expect(scene3d.mode).toBe("3d");
  });
});

describe("real PPTX export", () => {
  beforeEach(() => resetDemoStore());

  it("writes a pptx buffer with ZIP signature", async () => {
    const gateways = createDemoGateways();
    const property = await gateways.properties.getById(DEMO_IDS.tenant, DEMO_IDS.propMarina);
    const spec = buildPresentationSpec(property!);
    const buf = await buildPptxBuffer(spec);
    expect(buf.length).toBeGreaterThan(1000);
    // PK zip header
    expect(buf[0]).toBe(0x50);
    expect(buf[1]).toBe(0x4b);
  });
});
