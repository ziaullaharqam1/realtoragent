"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DeckCanvas } from "@/components/presentation/DeckCanvas";
import type { CanvasTheme, DeckSpec } from "@/components/presentation/types";

type PresentationPayload = {
  id: string;
  title: string;
  spec: DeckSpec;
};

export default function PresentationViewerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [presentation, setPresentation] = useState<PresentationPayload | null>(null);
  const [themes, setThemes] = useState<CanvasTheme[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [views, setViews] = useState<number | null>(null);
  const [presentMode, setPresentMode] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [listRes, studioRes] = await Promise.all([
          fetch("/api/presentations"),
          fetch("/api/presentations/studio"),
        ]);
        const listData = (await listRes.json()) as { presentations?: PresentationPayload[] };
        const studioData = (await studioRes.json()) as { themes?: CanvasTheme[] };
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

  if (error === "not_found" || error === "load_failed") {
    return (
      <AppShell>
        <h1 className="pp-display pp-page-title">Presentation not found</h1>
        <p className="pp-page-lead">Build a visual deck in Studio — Canva / Gamma style, not a data dump.</p>
        <Link href="/studio" className="pp-btn pp-btn-primary" style={{ marginTop: "1.25rem" }}>
          Open Studio
        </Link>
      </AppShell>
    );
  }

  if (!presentation) {
    return (
      <AppShell>
        <p className="pp-page-lead">Loading canvas…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {!presentMode ? (
        <>
          <p className="pp-kicker">PropPilot · Gamma canvas</p>
          <h1 className="pp-display pp-page-title">{presentation.title}</h1>
          <p className="pp-page-lead">
            Visual slide deck — present full-screen or download as PowerPoint. No JSON view.
          </p>
        </>
      ) : null}

      <DeckCanvas
        spec={presentation.spec}
        themes={themes}
        presentationId={presentation.id}
        title={presentation.title}
        views={views}
        presentMode={presentMode}
        onPresentModeChange={setPresentMode}
      />

      {!presentMode ? (
        <Link href="/studio" className="pp-btn pp-btn-secondary" style={{ marginTop: "1.25rem" }}>
          ← Back to Studio
        </Link>
      ) : null}
    </AppShell>
  );
}
