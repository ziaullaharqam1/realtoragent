import type { PropertyDetails } from "@/lib/ai-agent/gateways/property-gateway";
import {
  buildPresentationSpec,
  type DeckStyle,
  type PresentationSpec,
  type PresentationSlide,
} from "./spec";

export type PresentationTheme = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  surface: string;
  ink: string;
  muted: string;
  accentSoft: string;
  fontDisplay: string;
  fontBody: string;
};

export const PRESENTATION_THEMES: PresentationTheme[] = [
  {
    id: "marina",
    name: "Marina Teal",
    primary: "#0f6e6a",
    secondary: "#1a9b94",
    surface: "#f4f7f7",
    ink: "#0b1220",
    muted: "#5b667a",
    accentSoft: "#d8efed",
    fontDisplay: "Georgia",
    fontBody: "Calibri",
  },
  {
    id: "desert",
    name: "Desert Slate",
    primary: "#8a6a3d",
    secondary: "#c4a574",
    surface: "#faf7f2",
    ink: "#1c160e",
    muted: "#6b5b4a",
    accentSoft: "#f0e6d6",
    fontDisplay: "Georgia",
    fontBody: "Calibri",
  },
  {
    id: "night",
    name: "Night Harbor",
    primary: "#3d7ec9",
    secondary: "#7eb6ff",
    surface: "#0b1220",
    ink: "#f4f7fb",
    muted: "#9aa7bd",
    accentSoft: "#1a2740",
    fontDisplay: "Georgia",
    fontBody: "Calibri",
  },
  {
    id: "atelier",
    name: "Atelier Ink",
    primary: "#1f2937",
    secondary: "#b45309",
    surface: "#f8f5f0",
    ink: "#111827",
    muted: "#6b7280",
    accentSoft: "#efe8dc",
    fontDisplay: "Georgia",
    fontBody: "Calibri",
  },
];

export const DECK_STYLES: Array<{ id: DeckStyle; label: string; detail: string }> = [
  {
    id: "executive",
    label: "Executive dossier",
    detail: "Metrics → facts → location → media → CTA — broker-ready board pack",
  },
  {
    id: "lifestyle",
    label: "Lifestyle edit",
    detail: "Gallery-forward story with neighborhood mood before dense facts",
  },
  {
    id: "investor",
    label: "Investor brief",
    detail: "Lead with verified numbers and listing copy; still zero invented yield",
  },
];

export function getTheme(themeId?: string | null): PresentationTheme {
  return PRESENTATION_THEMES.find((t) => t.id === themeId) ?? PRESENTATION_THEMES[0]!;
}

export type ComparePresentationSpec = {
  version: 2;
  title: string;
  tenantId: string;
  themeId: string;
  deckStyle: DeckStyle;
  propertyIds: string[];
  slides: PresentationSlide[];
  generatedAt: string;
  source: "property_gateway_compare";
};

function money(amount: string | null, currency: string): string {
  if (!amount) return "POR";
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  return `${currency} ${n.toLocaleString("en-AE")}`;
}

export function buildComparePresentation(
  properties: PropertyDetails[],
  themeId?: string,
  deckStyle: DeckStyle = "executive",
): ComparePresentationSpec {
  const theme = getTheme(themeId);
  const titles = properties.map((p) => p.title).join(" vs ");
  const columns = properties.map((p) => p.title.split("—")[0]?.trim() ?? p.title);

  const matrixRows: Array<{ label: string; values: string[] }> = [
    {
      label: "Ask",
      values: properties.map((p) => money(p.priceAmount, p.priceCurrency)),
    },
    {
      label: "Beds / baths",
      values: properties.map((p) => `${p.bedrooms ?? "—"} / ${p.bathrooms ?? "—"}`),
    },
    {
      label: "Area (sqm)",
      values: properties.map((p) => p.areaSqm ?? "—"),
    },
    {
      label: "Community",
      values: properties.map((p) => p.district ?? p.city ?? "—"),
    },
    {
      label: "Type",
      values: properties.map((p) => p.propertyType),
    },
    {
      label: "Status",
      values: properties.map((p) => p.status),
    },
  ];

  const slides: PresentationSlide[] = [
    {
      type: "cover",
      title: "Shortlist comparison",
      subtitle: `${properties.length} listings · ${theme.name}`,
      location: columns.join(" · ").slice(0, 120),
      eyebrow: "PropPilot · Compare board",
      badge: "Side-by-side",
      kicker: deckStyle,
    },
    {
      type: "compare_matrix",
      title: "Decision matrix",
      columns,
      rows: matrixRows,
    },
    {
      type: "highlights",
      title: "How to read this board",
      items: properties.slice(0, 3).map((p) => ({
        title: p.title.split("—")[0]?.trim() ?? p.title,
        detail: `${p.bedrooms ?? "—"} BR · ${p.district ?? p.city ?? "—"} · ${money(p.priceAmount, p.priceCurrency)}`,
      })),
    },
  ];

  for (const p of properties.slice(0, 3)) {
    const single = buildPresentationSpec(p, { deckStyle, themeId: theme.id });
    slides.push(
      ...single.slides.filter(
        (s) =>
          s.type === "metrics" ||
          s.type === "highlights" ||
          s.type === "amenities" ||
          s.type === "neighborhood",
      ),
    );
  }

  slides.push({
    type: "spatial",
    title: "Layout footprints",
    caption: properties
      .map((p) => `${p.title.split("—")[0]?.trim() ?? p.title}: ${p.bedrooms ?? "—"} BR / ${p.areaSqm ?? "—"} sqm`)
      .join(" · "),
    layoutHint: "compare",
    renderer: "placeholder-3d",
  });

  slides.push({
    type: "cta",
    title: "Close the shortlist",
    body: "Pick a preferred unit, schedule paired viewings, or drop one listing from the matrix.",
    actions: ["Book paired viewings", "Export PPTX for the client", "Open preferred unit dossier"],
    contactHint: "All cells sourced from PropertyGateway — no invented yields or measurements.",
  });

  return {
    version: 2,
    title: `Compare: ${titles.slice(0, 80)}`,
    tenantId: properties[0]?.tenantId ?? "default",
    themeId: theme.id,
    deckStyle,
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
  const theme = getTheme(themeId ?? spec.themeId);
  return { ...spec, themeId: theme.id, theme };
}

export type { DeckStyle };
