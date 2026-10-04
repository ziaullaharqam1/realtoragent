import type { PresentationSlide } from "@/lib/ai-agent/presentations/spec";

export type CanvasTheme = {
  id: string;
  name: string;
  primary: string;
  secondary?: string;
  surface: string;
  ink: string;
  muted?: string;
  accentSoft?: string;
};

export type DeckSpec = {
  title?: string;
  priceLabel?: string;
  themeId?: string;
  deckStyle?: string;
  theme?: CanvasTheme;
  slides: PresentationSlide[];
  mediaDataUrl?: string | null;
  mode?: string;
};

export const DEFAULT_CANVAS_THEME: CanvasTheme = {
  id: "marina",
  name: "Marina Teal",
  primary: "#0f6e6a",
  secondary: "#1a9b94",
  surface: "#f4f7f7",
  ink: "#0b1220",
  muted: "#5b667a",
  accentSoft: "#d8efed",
};

export function resolveCanvasTheme(
  spec: DeckSpec | null | undefined,
  themes: CanvasTheme[] = [],
): CanvasTheme {
  if (spec?.theme?.primary) return { ...DEFAULT_CANVAS_THEME, ...spec.theme };
  const byId = themes.find((t) => t.id === spec?.themeId);
  return byId ? { ...DEFAULT_CANVAS_THEME, ...byId } : DEFAULT_CANVAS_THEME;
}

export function slideLabel(slide: PresentationSlide): string {
  if ("title" in slide && typeof slide.title === "string") return slide.title;
  return slide.type;
}
