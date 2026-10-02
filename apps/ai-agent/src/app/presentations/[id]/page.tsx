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
        Fact-based deck
        {spec.priceLabel ? ` · ${spec.priceLabel}` : ""}
        {spec.generatedAt ? ` · ${new Date(spec.generatedAt).toLocaleString()}` : ""}
        {views != null ? ` · ${views} view${views === 1 ? "" : "s"}` : ""}
      </p>

      <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <a className="pp-btn pp-btn-secondary" href={`/api/presentations/${id}/export?format=md`}>
          Export Markdown
        </a>
        <a className="pp-btn pp-btn-secondary" href={`/api/presentations/${id}/export?format=pptx-json`}>
          Export PPTX-JSON
        </a>
        <a className="pp-btn pp-btn-ghost" href={`/api/presentations/${id}/export?format=json`}>
          Raw JSON
        </a>
      </div>

      <div className="pp-panel" style={{ padding: "0 1.5rem" }}>
        {(spec.slides ?? []).map((slide, idx) => (
          <SlideView key={`${slide.type}-${idx}`} slide={slide} />
        ))}
      </div>
      <Link href="/studio" className="pp-btn pp-btn-secondary" style={{ marginTop: "1.25rem" }}>
        ← Back to Studio
      </Link>
    </AppShell>
  );
}
