import { beforeEach, describe, expect, it } from "vitest";
import { createDemoGateways } from "@/lib/ai-agent/gateways";
import { DEMO_IDS, resetDemoStore } from "@/lib/ai-agent/demo/store";
import { buildPresentationSpec } from "./spec";
import { buildComparePresentation, getTheme } from "./studio";
import { buildPptxBuffer } from "./pptx";
import { exportPresentation } from "./export";

describe("advanced presentation decks", () => {
  beforeEach(() => resetDemoStore());

  it("builds a multi-slide executive dossier with advanced slide types", async () => {
    const gateways = createDemoGateways();
    const property = await gateways.properties.getById(DEMO_IDS.tenant, DEMO_IDS.propMarina);
    expect(property).toBeTruthy();
    const spec = buildPresentationSpec(property!, { deckStyle: "executive", themeId: "marina" });
    expect(spec.version).toBe(2);
    expect(spec.deckStyle).toBe("executive");
    expect(spec.slides.length).toBeGreaterThanOrEqual(8);
    expect(spec.slides.some((s) => s.type === "metrics")).toBe(true);
    expect(spec.slides.some((s) => s.type === "highlights")).toBe(true);
    expect(spec.slides.some((s) => s.type === "gallery")).toBe(true);
    expect(spec.slides.some((s) => s.type === "floorplan")).toBe(true);
    expect(spec.slides.some((s) => s.type === "neighborhood")).toBe(true);
    expect(spec.slides.some((s) => s.type === "cta")).toBe(true);
    const floor = spec.slides.find((s) => s.type === "floorplan");
    expect(floor && floor.type === "floorplan" && floor.rooms.length).toBeGreaterThan(1);
  });

  it("orders lifestyle decks gallery-forward", async () => {
    const gateways = createDemoGateways();
    const property = await gateways.properties.getById(DEMO_IDS.tenant, DEMO_IDS.propMarina);
    const spec = buildPresentationSpec(property!, { deckStyle: "lifestyle" });
    const types = spec.slides.map((s) => s.type);
    expect(types.indexOf("gallery")).toBeLessThan(types.indexOf("facts"));
  });

  it("builds a comparison matrix board", async () => {
    const gateways = createDemoGateways();
    const a = await gateways.properties.getById(DEMO_IDS.tenant, DEMO_IDS.propMarina);
    const b = await gateways.properties.getById(DEMO_IDS.tenant, DEMO_IDS.propJlt);
    const compare = buildComparePresentation([a!, b!], "atelier", "executive");
    expect(compare.slides.some((s) => s.type === "compare_matrix")).toBe(true);
    expect(compare.themeId).toBe("atelier");
    expect(getTheme("atelier").secondary).toBeTruthy();
  });

  it("exports advanced pptx and markdown", async () => {
    const gateways = createDemoGateways();
    const property = await gateways.properties.getById(DEMO_IDS.tenant, DEMO_IDS.propHills);
    const spec = buildPresentationSpec(property!, { deckStyle: "investor", themeId: "night" });
    const buf = await buildPptxBuffer({ ...spec, themeId: "night" });
    expect(buf[0]).toBe(0x50);
    expect(buf[1]).toBe(0x4b);
    expect(buf.length).toBeGreaterThan(3000);
    const md = exportPresentation(spec, "md");
    expect(md.body).toContain("At a glance");
    expect(md.body).toContain("Next steps");
    const json = exportPresentation(spec, "pptx-json");
    expect(json.body).toContain("metric_cards");
    expect(json.body).toContain("floorplan_zones");
  });
});
