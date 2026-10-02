import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getDemoStore } from "@/lib/ai-agent/demo/store";
import type { PresentationSpec, PresentationSlide } from "@/lib/ai-agent/presentations/spec";

type Params = { params: Promise<{ id: string }> };

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
  return (
    <section style={{ padding: "1.5rem 0" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>{slide.title}</h3>
      <p style={{ margin: 0, color: "var(--ink-soft)", lineHeight: 1.55 }}>{slide.body}</p>
    </section>
  );
}

export default async function PresentationViewerPage({ params }: Params) {
  const { id } = await params;
  const presentation = getDemoStore().presentations.find((p) => p.id === id);

  if (!presentation) {
    return (
      <AppShell>
        <h1 className="pp-display pp-page-title">Presentation not found</h1>
        <p className="pp-page-lead">
          Ask chat to build a presentation, or POST /api/presentations with a propertyId.
        </p>
        <Link href="/chat" className="pp-btn pp-btn-primary" style={{ marginTop: "1.25rem" }}>
          Open chat
        </Link>
      </AppShell>
    );
  }

  const spec = presentation.spec as unknown as PresentationSpec;

  return (
    <AppShell>
      <p className="pp-kicker">PropPilot</p>
      <h1 className="pp-display pp-page-title">Presentation</h1>
      <p className="pp-page-lead">
        Fact-based deck · {spec.priceLabel} · {new Date(spec.generatedAt).toLocaleString()}
      </p>
      <div className="pp-panel" style={{ padding: "0 1.5rem" }}>
        {spec.slides.map((slide, idx) => (
          <SlideView key={`${slide.type}-${idx}`} slide={slide} />
        ))}
      </div>
      <Link href="/chat" className="pp-btn pp-btn-secondary" style={{ marginTop: "1.25rem" }}>
        ← Back to chat
      </Link>
    </AppShell>
  );
}
