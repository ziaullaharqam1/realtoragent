import type { PropertyDetails } from "@/lib/ai-agent/gateways/property-gateway";
import { buildPresentationSpec, type PresentationSpec, type PresentationSlide } from "./spec";

export type PresentationTheme = {
  id: string;
  name: string;
  primary: string;
  surface: string;
  ink: string;
};

export const PRESENTATION_THEMES: PresentationTheme[] = [
  { id: "marina", name: "Marina Teal", primary: "#0f6e6a", surface: "#f7f8fb", ink: "#0b1220" },
  { id: "desert", name: "Desert Slate", primary: "#8a6a3d", surface: "#faf7f2", ink: "#1c160e" },
  { id: "night", name: "Night Harbor", primary: "#1f4b7a", surface: "#0b1220", ink: "#f4f7fb" },
];

export function getTheme(themeId?: string | null): PresentationTheme {
  return PRESENTATION_THEMES.find((t) => t.id === themeId) ?? PRESENTATION_THEMES[0];
}

export type ComparePresentationSpec = {
  version: 1;
  title: string;
  tenantId: string;
  themeId: string;
  propertyIds: string[];
  slides: PresentationSlide[];
  generatedAt: string;
  source: "property_gateway_compare";
};

export function buildComparePresentation(
  properties: PropertyDetails[],
  themeId?: string,
): ComparePresentationSpec {
  const theme = getTheme(themeId);
  const titles = properties.map((p) => p.title).join(" vs ");
  const rows: Array<{ label: string; value: string }> = [];
  for (const p of properties) {
    rows.push({
      label: p.title,
      value: `${p.bedrooms ?? "—"} BR · ${p.district ?? p.city ?? "—"} · ${p.priceCurrency} ${p.priceAmount ?? "—"}`,
    });
  }

  const slides: PresentationSlide[] = [
    {
      type: "cover",
      title: "Property comparison",
      subtitle: titles.slice(0, 120),
      location: theme.name,
    },
    {
      type: "facts",
      title: "Side-by-side facts",
      rows,
    },
    {
      type: "narrative",
      title: "Notes",
      body: "All figures and amenities below are sourced from PropertyGateway — no invented claims.",
    },
  ];

  for (const p of properties.slice(0, 3)) {
    const single = buildPresentationSpec(p);
    slides.push(...single.slides.filter((s) => s.type !== "cover" && s.type !== "spatial"));
  }

  slides.push({
    type: "spatial",
    title: "Compare layouts",
    caption: properties
      .map((p) => `${p.title.split("—")[0]?.trim() ?? p.title}: ${p.bedrooms ?? "—"} BR / ${p.areaSqm ?? "—"} sqm`)
      .join(" · "),
    layoutHint: "compare",
    renderer: "placeholder-3d",
  });

  return {
    version: 1,
    title: `Compare: ${titles.slice(0, 80)}`,
    tenantId: properties[0]?.tenantId ?? "default",
    themeId: theme.id,
    propertyIds: properties.map((p) => p.id),
    slides,
    generatedAt: new Date().toISOString(),
    source: "property_gateway_compare",
  };
}

export function applyThemeToSpec(
  spec: PresentationSpec,
  themeId?: string,
): PresentationSpec & { theme: PresentationTheme } {
  const theme = getTheme(themeId);
  return { ...spec, theme };
}
