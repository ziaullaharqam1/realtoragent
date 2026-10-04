"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import type { PresentationSlide } from "@/lib/ai-agent/presentations/spec";

type Theme = {
  id: string;
  name: string;
  primary: string;
  secondary?: string;
  surface: string;
  ink: string;
  muted?: string;
  accentSoft?: string;
};

type PresentationPayload = {
  id: string;
  title: string;
  spec: {
    title?: string;
    priceLabel?: string;
    generatedAt?: string;
    themeId?: string;
    deckStyle?: string;
    theme?: Theme;
    slides: PresentationSlide[];
    mediaDataUrl?: string | null;
    mode?: string;
    rooms?: Array<{ id: string; label: string; x: number; y: number; w: number; h: number }>;
    camera?: { yaw: number; pitch: number; zoom: number };
  };
};

const FALLBACK_THEME: Theme = {
  id: "marina",
  name: "Marina Teal",
  primary: "#0f6e6a",
  secondary: "#1a9b94",
  surface: "#f4f7f7",
  ink: "#0b1220",
  muted: "#5b667a",
  accentSoft: "#d8efed",
};

function slideTitle(slide: PresentationSlide): string {
  if ("title" in slide && typeof slide.title === "string") return slide.title;
  return slide.type;
}

function SlideCanvas({
  slide,
  theme,
  index,
  total,
}: {
  slide: PresentationSlide;
  theme: Theme;
  index: number;
  total: number;
}) {
  const muted = theme.muted ?? "#5b667a";
  const soft = theme.accentSoft ?? "#d8efed";
  const secondary = theme.secondary ?? theme.primary;

  if (slide.type === "cover") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(180px,32%) 1fr", minHeight: 420 }}>
        <aside
          style={{
            background: theme.primary,
            color: "#fff",
            padding: "2rem 1.4rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <span style={{ opacity: 0.85, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            {(slide.eyebrow ?? "PropPilot").toUpperCase()}
          </span>
          <strong style={{ fontSize: "1rem", color: secondary }}>{slide.badge ?? "Listing dossier"}</strong>
          <span style={{ marginTop: "auto", fontSize: "0.8rem", opacity: 0.75 }}>
            Slide {index + 1} / {total}
          </span>
        </aside>
        <div style={{ padding: "2.25rem 2rem", background: theme.surface, color: theme.ink }}>
          {slide.kicker ? (
            <p style={{ margin: 0, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.75rem" }}>
              {slide.kicker}
            </p>
          ) : null}
          <h2 className="pp-display" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", margin: "0.6rem 0 0", lineHeight: 1.15 }}>
            {slide.title}
          </h2>
          <p style={{ margin: "1.1rem 0 0", color: theme.primary, fontWeight: 700, fontSize: "1.25rem" }}>{slide.subtitle}</p>
          <p style={{ margin: "0.45rem 0 0", color: muted }}>{slide.location}</p>
        </div>
      </div>
    );
  }

  if (slide.type === "metrics") {
    return (
      <div style={{ padding: "1.75rem", background: theme.surface, color: theme.ink, minHeight: 420 }}>
        <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.35rem" }}>{slide.title}</h3>
        <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))" }}>
          {slide.items.map((item) => (
            <div
              key={item.label}
              style={{
                background: soft,
                borderRadius: 16,
                padding: "1.1rem 1rem",
                minHeight: 140,
              }}
            >
              <div style={{ fontSize: "0.72rem", color: muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 700, marginTop: "0.55rem" }}>{item.value}</div>
              {item.hint ? <div style={{ marginTop: "0.45rem", color: theme.primary, fontSize: "0.85rem" }}>{item.hint}</div> : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "highlights") {
    return (
      <div style={{ padding: "1.75rem", background: theme.surface, color: theme.ink, minHeight: 420 }}>
        <h3 style={{ margin: "0 0 1.1rem", fontSize: "1.35rem" }}>{slide.title}</h3>
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          {slide.items.map((item) => (
            <div
              key={item.title}
              style={{
                background: soft,
                borderRadius: 14,
                padding: "1rem 1rem 1rem 1.1rem",
                borderLeft: `4px solid ${theme.primary}`,
              }}
            >
              <strong style={{ display: "block" }}>{item.title}</strong>
              <span style={{ color: muted, fontSize: "0.92rem" }}>{item.detail}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "facts") {
    return (
      <div style={{ padding: "1.75rem", background: theme.surface, color: theme.ink, minHeight: 420 }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1.35rem" }}>{slide.title}</h3>
        <div style={{ display: "grid", gap: "0.35rem" }}>
          {slide.rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                gap: "0.75rem",
                padding: "0.55rem 0.65rem",
                borderBottom: `1px solid ${soft}`,
              }}
            >
              <span style={{ color: muted, textTransform: "capitalize" }}>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "amenities") {
    return (
      <div style={{ padding: "1.75rem", background: theme.surface, color: theme.ink, minHeight: 420 }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1.35rem" }}>{slide.title}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
          {slide.items.map((item) => (
            <span
              key={item}
              style={{
                background: soft,
                color: theme.ink,
                borderRadius: 999,
                padding: "0.45rem 0.9rem",
                fontWeight: 650,
                fontSize: "0.92rem",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "gallery") {
    return (
      <div style={{ padding: "1.75rem", background: theme.surface, color: theme.ink, minHeight: 420 }}>
        <h3 style={{ margin: "0 0 0.4rem", fontSize: "1.35rem" }}>{slide.title}</h3>
        <p style={{ margin: "0 0 1rem", color: muted, fontSize: "0.92rem" }}>{slide.caption}</p>
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
          {slide.frames.map((frame) => (
            <div key={frame.label} style={{ background: soft, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ height: 110, background: `linear-gradient(135deg, ${theme.primary}, ${secondary})` }} />
              <div style={{ padding: "0.75rem" }}>
                <strong style={{ display: "block" }}>{frame.label}</strong>
                <span style={{ color: muted, fontSize: "0.85rem" }}>{frame.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "neighborhood") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,42%) 1fr", minHeight: 420, background: theme.surface }}>
        <div style={{ background: theme.primary, color: "#fff", padding: "1.75rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.35rem" }}>{slide.title}</h3>
          <p style={{ margin: "1rem 0 0", fontSize: "1.6rem", fontWeight: 700 }}>{slide.district}</p>
          <p style={{ margin: "0.25rem 0 0", opacity: 0.85 }}>{slide.city}</p>
          <p style={{ margin: "1.25rem 0 0", lineHeight: 1.55, opacity: 0.92 }}>{slide.body}</p>
        </div>
        <div style={{ padding: "1.75rem", color: theme.ink }}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "0.75rem" }}>
            {slide.points.map((point) => (
              <li
                key={point}
                style={{
                  padding: "0.85rem 1rem",
                  background: soft,
                  borderRadius: 12,
                  borderLeft: `3px solid ${theme.primary}`,
                }}
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (slide.type === "floorplan") {
    return (
      <div style={{ padding: "1.5rem", background: theme.surface, color: theme.ink, minHeight: 420 }}>
        <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.35rem" }}>{slide.title}</h3>
        <p style={{ margin: "0 0 1rem", color: muted, fontSize: "0.88rem" }}>{slide.caption}</p>
        <div
          style={{
            position: "relative",
            height: 300,
            borderRadius: 16,
            border: `1px solid ${theme.primary}`,
            background: soft,
            overflow: "hidden",
          }}
        >
          {slide.rooms.map((room) => (
            <div
              key={room.id}
              style={{
                position: "absolute",
                left: `${room.x}%`,
                top: `${room.y}%`,
                width: `${room.w}%`,
                height: `${room.h}%`,
                border: `2px solid ${theme.primary}`,
                background: "rgba(255,255,255,0.72)",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                padding: 6,
                boxSizing: "border-box",
              }}
            >
              {room.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "compare_matrix") {
    return (
      <div style={{ padding: "1.5rem", background: theme.surface, color: theme.ink, minHeight: 420, overflowX: "auto" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1.35rem" }}>{slide.title}</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
          <thead>
            <tr style={{ background: theme.primary, color: "#fff" }}>
              <th style={{ textAlign: "left", padding: "0.65rem" }}>Attribute</th>
              {slide.columns.map((c) => (
                <th key={c} style={{ textAlign: "left", padding: "0.65rem" }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slide.rows.map((row) => (
              <tr key={row.label} style={{ borderBottom: `1px solid ${soft}` }}>
                <td style={{ padding: "0.65rem", fontWeight: 650 }}>{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={`${row.label}-${i}`} style={{ padding: "0.65rem" }}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (slide.type === "spatial") {
    return (
      <div style={{ padding: "1.5rem", background: theme.surface, color: theme.ink, minHeight: 420 }}>
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.35rem" }}>{slide.title}</h3>
        <div
          style={{
            position: "relative",
            height: 280,
            borderRadius: 18,
            overflow: "hidden",
            border: `1px solid ${soft}`,
            background: `linear-gradient(145deg, ${soft}, ${theme.surface}), radial-gradient(circle at 30% 40%, rgba(255,255,255,0.7), transparent 55%)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "16% 20%",
              border: `2px solid ${theme.primary}88`,
              borderRadius: 10,
              transform: "perspective(700px) rotateX(56deg) rotateZ(-16deg)",
              background: "rgba(255,255,255,0.4)",
              boxShadow: "0 18px 40px rgba(11,18,32,0.12)",
            }}
          />
          {(slide.rooms ?? []).slice(0, 4).map((room, i) => (
            <div
              key={room.id}
              style={{
                position: "absolute",
                left: `${18 + i * 16}%`,
                top: `${28 + (i % 2) * 10}%`,
                padding: "0.25rem 0.45rem",
                background: theme.primary,
                color: "#fff",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 650,
              }}
            >
              {room.label}
            </div>
          ))}
          <div style={{ position: "absolute", left: "10%", right: "10%", bottom: "10%" }}>
            <strong style={{ display: "block" }}>{slide.caption}</strong>
            <span style={{ color: muted, fontSize: "0.9rem" }}>
              {slide.layoutHint} · {slide.renderer}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (slide.type === "cta") {
    return (
      <div
        style={{
          minHeight: 420,
          padding: "2.25rem",
          background: theme.primary,
          color: "#fff",
          display: "grid",
          alignContent: "center",
          gap: "1rem",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.8rem" }}>{slide.title}</h3>
        <p style={{ margin: 0, opacity: 0.92, maxWidth: 640, lineHeight: 1.55 }}>{slide.body}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "0.5rem" }}>
          {slide.actions.map((action) => (
            <span
              key={action}
              style={{
                background: "#fff",
                color: theme.primary,
                borderRadius: 999,
                padding: "0.55rem 1rem",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {action}
            </span>
          ))}
        </div>
        <p style={{ margin: "0.75rem 0 0", opacity: 0.8, fontSize: "0.88rem" }}>{slide.contactHint}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.75rem", background: theme.surface, color: theme.ink, minHeight: 420 }}>
      <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.35rem" }}>{slide.title}</h3>
      <p style={{ margin: 0, lineHeight: 1.65, color: muted }}>{slide.body}</p>
    </div>
  );
}

export default function PresentationViewerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [presentation, setPresentation] = useState<PresentationPayload | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [views, setViews] = useState<number | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const [listRes, studioRes] = await Promise.all([
          fetch("/api/presentations"),
          fetch("/api/presentations/studio"),
        ]);
        const listData = (await listRes.json()) as { presentations?: PresentationPayload[] };
        const studioData = (await studioRes.json()) as { themes?: Theme[] };
        setThemes(studioData.themes ?? []);
        const found = (listData.presentations ?? []).find((p) => p.id === id) ?? null;
        if (!found) {
          setError("not_found");
          return;
        }
        setPresentation(found);
        const viewRes = await fetch(`/api/presentations/${id}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "viewer" }),
        });
        const viewData = (await viewRes.json()) as { totalViews?: number };
        setViews(viewData.totalViews ?? null);
      } catch {
        setError("load_failed");
      }
    })();
  }, [id]);

  const slides = presentation?.spec.slides ?? [];
  const theme = useMemo(() => {
    const fromSpec = presentation?.spec.theme;
    if (fromSpec?.primary) return { ...FALLBACK_THEME, ...fromSpec };
    const byId = themes.find((t) => t.id === presentation?.spec.themeId);
    return byId ? { ...FALLBACK_THEME, ...byId } : FALLBACK_THEME;
  }, [presentation, themes]);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => Math.max(0, Math.min(slides.length - 1, i + dir)));
    },
    [slides.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
      if (e.key === "Home") setIndex(0);
      if (e.key === "End") setIndex(Math.max(0, slides.length - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, slides.length]);

  useEffect(() => {
    setIndex(0);
  }, [id]);

  if (error === "not_found" || error === "load_failed") {
    return (
      <AppShell>
        <h1 className="pp-display pp-page-title">Presentation not found</h1>
        <p className="pp-page-lead">Ask chat to build a presentation, or use Studio to create a deck.</p>
        <Link href="/studio" className="pp-btn pp-btn-primary" style={{ marginTop: "1.25rem" }}>
          Open Studio
        </Link>
      </AppShell>
    );
  }

  if (!presentation) {
    return (
      <AppShell>
        <p className="pp-page-lead">Loading presentation…</p>
      </AppShell>
    );
  }

  const spec = presentation.spec;
  const current = slides[index];

  return (
    <AppShell>
      <p className="pp-kicker">PropPilot Studio</p>
      <h1 className="pp-display pp-page-title">{presentation.title}</h1>
      <p className="pp-page-lead">
        Advanced slide canvas · {spec.deckStyle ?? "executive"} · {theme.name}
        {spec.priceLabel ? ` · ${spec.priceLabel}` : ""}
        {views != null ? ` · ${views} view${views === 1 ? "" : "s"}` : ""}
      </p>

      <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <a className="pp-btn pp-btn-primary" href={`/api/presentations/${id}/export?format=pptx`}>
          Download PowerPoint (.pptx)
        </a>
        <a className="pp-btn pp-btn-secondary" href={`/api/presentations/${id}/export?format=json`}>
          Spec JSON
        </a>
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
      </div>

      {spec.mediaDataUrl ? (
        <div
          className="pp-panel"
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            position: "relative",
            minHeight: 220,
            overflow: "hidden",
          }}
        >
          <p style={{ margin: "0 0 0.75rem", fontWeight: 650 }}>
            {spec.mode === "3d" ? "3D scene from upload" : "2D floorplan from upload"}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={spec.mediaDataUrl}
            alt="Uploaded spatial source"
            style={{
              width: "100%",
              maxHeight: 260,
              objectFit: "cover",
              borderRadius: 12,
              transform:
                spec.mode === "3d" && spec.camera
                  ? `perspective(900px) rotateX(${spec.camera.pitch * 0.3}deg) rotateY(${spec.camera.yaw}deg)`
                  : undefined,
            }}
          />
        </div>
      ) : null}

      <div
        className="pp-animate-in"
        style={{
          borderRadius: 22,
          overflow: "hidden",
          border: `1px solid ${theme.accentSoft ?? "var(--line)"}`,
          boxShadow: "0 24px 60px rgba(11,18,32,0.12)",
        }}
      >
        {current ? <SlideCanvas slide={current} theme={theme} index={index} total={slides.length} /> : null}
      </div>

      <div
        style={{
          marginTop: "1rem",
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "minmax(120px, 1fr)",
          gap: "0.55rem",
          overflowX: "auto",
          paddingBottom: "0.35rem",
        }}
      >
        {slides.map((slide, i) => (
          <button
            key={`${slide.type}-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            style={{
              textAlign: "left",
              borderRadius: 12,
              border: i === index ? `2px solid ${theme.primary}` : "1px solid var(--line)",
              background: i === index ? theme.accentSoft ?? "var(--accent-soft)" : "var(--surface)",
              padding: "0.65rem 0.75rem",
              cursor: "pointer",
              minHeight: 72,
            }}
          >
            <span style={{ display: "block", fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "0.05em" }}>
              {String(i + 1).padStart(2, "0")} · {slide.type}
            </span>
            <strong style={{ display: "block", marginTop: 4, fontSize: "0.85rem", color: "var(--ink)" }}>
              {slideTitle(slide)}
            </strong>
          </button>
        ))}
      </div>

      <p style={{ marginTop: "0.85rem", color: "var(--muted)", fontSize: "0.85rem" }}>
        Tip: use ← → keys to move through the deck.
      </p>

      <Link href="/studio" className="pp-btn pp-btn-secondary" style={{ marginTop: "1.25rem" }}>
        ← Back to Studio
      </Link>
    </AppShell>
  );
}
