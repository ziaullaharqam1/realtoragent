"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import type { PresentationSlide } from "@/lib/ai-agent/presentations/spec";

type PresentationPayload = {
  id: string;
  title: string;
  spec: {
    title?: string;
    priceLabel?: string;
    generatedAt?: string;
    themeId?: string;
    slides: PresentationSlide[];
    mediaDataUrl?: string | null;
    mode?: string;
    rooms?: Array<{ id: string; label: string; x: number; y: number; w: number; h: number }>;
    camera?: { yaw: number; pitch: number; zoom: number };
  };
};

function SlideView({ slide }: { slide: PresentationSlide }) {
  if (slide.type === "cover") {
    return (
      <section style={{ padding: "2rem 0", borderBottom: "1px solid var(--line)" }}>
        <h2 className="pp-display" style={{ fontSize: "2rem", margin: 0 }}>
          {slide.title}
        </h2>
        <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontWeight: 600 }}>{slide.subtitle}</p>
        <p style={{ margin: "0.35rem 0 0", color: "var(--muted)", fontSize: "0.95rem" }}>{slide.location}</p>
      </section>
    );
  }
  if (slide.type === "facts") {
    return (
      <section style={{ padding: "1.5rem 0", borderBottom: "1px solid var(--line)" }}>
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>{slide.title}</h3>
        <dl style={{ display: "grid", gap: "0.45rem", gridTemplateColumns: "1fr 1fr" }}>
          {slide.rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
                fontSize: "0.92rem",
                padding: "0.35rem 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <dt style={{ color: "var(--muted)", textTransform: "capitalize" }}>{row.label}</dt>
              <dd style={{ margin: 0, fontWeight: 600 }}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }
  if (slide.type === "amenities") {
    return (
      <section style={{ padding: "1.5rem 0", borderBottom: "1px solid var(--line)" }}>
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>{slide.title}</h3>
        <ul style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", listStyle: "none", padding: 0, margin: 0 }}>
          {slide.items.map((item) => (
            <li key={item} className="pp-badge">
              {item}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (slide.type === "spatial") {
    return (
      <section style={{ padding: "1.5rem 0", borderBottom: "1px solid var(--line)" }}>
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>{slide.title}</h3>
        <div
          aria-label="3D layout placeholder"
          style={{
            position: "relative",
            height: 220,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid var(--line)",
            background:
              "linear-gradient(145deg, rgba(15,110,106,0.12), rgba(31,75,122,0.16)), radial-gradient(circle at 30% 40%, rgba(255,255,255,0.7), transparent 55%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "18% 22%",
              border: "2px solid rgba(15,110,106,0.45)",
              borderRadius: 8,
              transform: "perspective(600px) rotateX(58deg) rotateZ(-18deg)",
              background: "rgba(255,255,255,0.35)",
              boxShadow: "0 18px 40px rgba(11,18,32,0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "12%",
              bottom: "12%",
              right: "12%",
              color: "var(--ink-soft)",
              fontSize: "0.9rem",
            }}
          >
            <strong style={{ display: "block", color: "var(--ink)" }}>{slide.caption}</strong>
            <span style={{ color: "var(--muted)" }}>
              {slide.layoutHint} · {slide.renderer} (worker optional)
            </span>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section style={{ padding: "1.5rem 0" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>{slide.title}</h3>
      <p style={{ margin: 0, color: "var(--ink-soft)", lineHeight: 1.55 }}>{slide.body}</p>
    </section>
  );
}

export default function PresentationViewerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [presentation, setPresentation] = useState<PresentationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const listRes = await fetch("/api/presentations");
        const listData = (await listRes.json()) as { presentations?: PresentationPayload[] };
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

  if (error === "not_found" || error === "load_failed") {
    return (
      <AppShell>
        <h1 className="pp-display pp-page-title">Presentation not found</h1>
        <p className="pp-page-lead">
          Ask chat to build a presentation, or use Studio to create a deck.
        </p>
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

  return (
    <AppShell>
      <p className="pp-kicker">PropPilot</p>
      <h1 className="pp-display pp-page-title">Presentation</h1>
      <p className="pp-page-lead">
        Canva-style slide canvas · download as PowerPoint (.pptx)
        {spec.priceLabel ? ` · ${spec.priceLabel}` : ""}
        {spec.mode ? ` · ${spec.mode}` : ""}
        {views != null ? ` · ${views} view${views === 1 ? "" : "s"}` : ""}
      </p>

      <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <a className="pp-btn pp-btn-primary" href={`/api/presentations/${id}/export?format=pptx`}>
          Download PowerPoint (.pptx)
        </a>
        <a className="pp-btn pp-btn-secondary" href={`/api/presentations/${id}/export?format=json`}>
          Spec JSON
        </a>
      </div>

      {spec.mediaDataUrl ? (
        <div
          className="pp-panel"
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            position: "relative",
            minHeight: 260,
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
              maxHeight: 320,
              objectFit: "cover",
              borderRadius: 12,
              transform:
                spec.mode === "3d" && spec.camera
                  ? `perspective(900px) rotateX(${spec.camera.pitch * 0.3}deg) rotateY(${spec.camera.yaw}deg)`
                  : undefined,
            }}
          />
          {(spec.rooms ?? []).map((room) => (
            <div
              key={room.id}
              style={{
                position: "absolute",
                left: `${room.x}%`,
                top: `${12 + room.y * 0.7}%`,
                width: `${room.w * 0.85}%`,
                height: `${room.h * 0.55}%`,
                border: "2px solid rgba(15,110,106,0.9)",
                background: "rgba(15,110,106,0.2)",
                color: "var(--ink)",
                fontSize: 11,
                fontWeight: 650,
                padding: 4,
              }}
            >
              {room.label}
            </div>
          ))}
        </div>
      ) : null}

      <div
        className="pp-panel"
        style={{
          padding: "0",
          background:
            "linear-gradient(180deg, rgba(15,110,106,0.06), transparent 120px), var(--surface)",
        }}
      >
        {(spec.slides ?? []).map((slide, idx) => (
          <div
            key={`${slide.type}-${idx}`}
            style={{
              margin: "1rem",
              padding: "0 0.5rem 0.25rem",
              borderRadius: 16,
              border: "1px solid var(--line)",
              background: "rgba(255,255,255,0.72)",
              boxShadow: "0 10px 30px rgba(11,18,32,0.06)",
            }}
          >
            <div
              style={{
                padding: "0.55rem 1rem 0",
                fontSize: "0.75rem",
                color: "var(--muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Slide {idx + 1}
            </div>
            <div style={{ padding: "0 1rem" }}>
              <SlideView slide={slide} />
            </div>
          </div>
        ))}
      </div>
      <Link href="/studio" className="pp-btn pp-btn-secondary" style={{ marginTop: "1.25rem" }}>
        ← Back to Studio
      </Link>
    </AppShell>
  );
}
