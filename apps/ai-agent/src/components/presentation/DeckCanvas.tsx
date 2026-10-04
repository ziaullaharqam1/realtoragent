"use client";

import { useCallback, useEffect, useState } from "react";
import type { PresentationSlide } from "@/lib/ai-agent/presentations/spec";
import { SlideStage } from "./SlideStage";
import { resolveCanvasTheme, slideLabel, type CanvasTheme, type DeckSpec } from "./types";

type Props = {
  spec: DeckSpec;
  themes?: CanvasTheme[];
  presentationId?: string;
  title?: string;
  views?: number | null;
  /** When true, hide chrome and fill viewport (present mode) */
  presentMode?: boolean;
  onPresentModeChange?: (on: boolean) => void;
};

/**
 * Canva / Gamma-style deck shell: 16:9 stage, filmstrip, present mode.
 * No JSON surface — visual canvas + PPTX export only.
 */
export function DeckCanvas({
  spec,
  themes = [],
  presentationId,
  title,
  views,
  presentMode = false,
  onPresentModeChange,
}: Props) {
  const slides = spec.slides ?? [];
  const theme = resolveCanvasTheme(spec, themes);
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => Math.max(0, Math.min(slides.length - 1, i + dir)));
    },
    [slides.length],
  );

  useEffect(() => {
    setIndex(0);
  }, [spec.slides]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
      if (e.key === "Escape" && presentMode) onPresentModeChange?.(false);
      if (e.key === "f" || e.key === "F") onPresentModeChange?.(!presentMode);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, presentMode, onPresentModeChange]);

  const current = slides[index];

  const stage = current ? (
    <div
      className="pp-deck-stage"
      style={{
        borderRadius: presentMode ? 0 : 22,
        overflow: "hidden",
        boxShadow: presentMode ? "none" : "0 28px 80px rgba(11,18,32,0.16)",
        border: presentMode ? "none" : `1px solid ${theme.accentSoft ?? "#e6ebf2"}`,
        background: "#0b1220",
      }}
    >
      <SlideStage slide={current} theme={theme} index={index} total={slides.length} density="stage" />
    </div>
  ) : null;

  if (presentMode) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 80,
          background: "#0b1220",
          display: "grid",
          gridTemplateRows: "1fr auto",
          padding: "1.5vh 2vw 1vh",
          gap: "1vh",
        }}
      >
        <div style={{ display: "grid", placeItems: "center", minHeight: 0 }}>{stage}</div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#fff",
            opacity: 0.85,
            fontSize: "0.85rem",
            padding: "0 0.25rem",
          }}
        >
          <span>
            {title ?? spec.title} · {index + 1}/{slides.length}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="pp-btn pp-btn-ghost" style={{ color: "#fff" }} onClick={() => go(-1)}>
              ←
            </button>
            <button type="button" className="pp-btn pp-btn-ghost" style={{ color: "#fff" }} onClick={() => go(1)}>
              →
            </button>
            <button
              type="button"
              className="pp-btn pp-btn-secondary"
              onClick={() => onPresentModeChange?.(false)}
            >
              Exit present
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pp-deck-canvas">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.55rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button type="button" className="pp-btn pp-btn-primary" onClick={() => onPresentModeChange?.(true)}>
          Present
        </button>
        {presentationId ? (
          <a className="pp-btn pp-btn-secondary" href={`/api/presentations/${presentationId}/export?format=pptx`}>
            Download PowerPoint
          </a>
        ) : null}
        <button type="button" className="pp-btn pp-btn-secondary" disabled={index === 0} onClick={() => go(-1)}>
          ← Prev
        </button>
        <button
          type="button"
          className="pp-btn pp-btn-secondary"
          disabled={index >= slides.length - 1}
          onClick={() => go(1)}
        >
          Next →
        </button>
        <span style={{ color: "var(--muted)", fontSize: "0.88rem", marginLeft: "auto" }}>
          {spec.deckStyle ?? "executive"} · {theme.name}
          {spec.priceLabel ? ` · ${spec.priceLabel}` : ""}
          {views != null ? ` · ${views} views` : ""}
        </span>
      </div>

      {stage}

      <div
        style={{
          marginTop: "1rem",
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "minmax(148px, 18%)",
          gap: "0.65rem",
          overflowX: "auto",
          paddingBottom: "0.4rem",
        }}
      >
        {slides.map((slide, i) => (
          <FilmstripThumb
            key={`${slide.type}-${i}`}
            slide={slide}
            theme={theme}
            index={i}
            total={slides.length}
            active={i === index}
            onSelect={() => setIndex(i)}
          />
        ))}
      </div>

      <p style={{ marginTop: "0.75rem", color: "var(--muted)", fontSize: "0.85rem" }}>
        Canva-style canvas · arrow keys to flip · <kbd>F</kbd> to present · export as PowerPoint
      </p>
    </div>
  );
}

function FilmstripThumb({
  slide,
  theme,
  index,
  total,
  active,
  onSelect,
}: {
  slide: PresentationSlide;
  theme: CanvasTheme;
  index: number;
  total: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        padding: 0,
        border: active ? `2px solid ${theme.primary}` : "1px solid var(--line)",
        borderRadius: 12,
        overflow: "hidden",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
        boxShadow: active ? `0 0 0 3px ${theme.accentSoft ?? "#e6f4f3"}` : "none",
      }}
      title={slideLabel(slide)}
    >
      <SlideStage slide={slide} theme={theme} index={index} total={total} density="thumb" />
      <div
        style={{
          padding: "0.4rem 0.5rem",
          background: active ? theme.accentSoft ?? "var(--accent-soft)" : "var(--surface)",
          fontSize: "0.72rem",
          color: "var(--muted)",
        }}
      >
        {String(index + 1).padStart(2, "0")} · {slide.type}
      </div>
    </button>
  );
}
