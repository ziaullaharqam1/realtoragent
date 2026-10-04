"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DeckCanvas } from "@/components/presentation/DeckCanvas";
import { SlideStage } from "@/components/presentation/SlideStage";
import { resolveCanvasTheme, type CanvasTheme, type DeckSpec } from "@/components/presentation/types";
import type { PresentationSlide } from "@/lib/ai-agent/presentations/spec";

type Mode = { id: string; label: string; detail: string };
type DeckStyle = { id: string; label: string; detail: string };
type Property = {
  id: string;
  title: string;
  district: string | null;
  priceAmount: string | null;
  bedrooms?: number | null;
  areaSqm?: string | null;
};
type Scene = {
  id: string;
  mode: "2d" | "3d";
  title: string;
  rooms: Array<{ id: string; label: string; x: number; y: number; w: number; h: number }>;
  camera: { yaw: number; pitch: number; zoom: number };
  media: { id: string; filename: string; dataUrl: string } | null;
};

export default function PresentationStudioPage() {
  const [themes, setThemes] = useState<CanvasTheme[]>([]);
  const [modes, setModes] = useState<Mode[]>([]);
  const [deckStyles, setDeckStyles] = useState<DeckStyle[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [themeId, setThemeId] = useState("marina");
  const [deckStyle, setDeckStyle] = useState("executive");
  const [mode, setMode] = useState("canva");
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [deckSpec, setDeckSpec] = useState<DeckSpec | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [presentMode, setPresentMode] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  async function refreshScenes() {
    const res = await fetch("/api/studio/scenes");
    const data = (await res.json()) as { scenes: Scene[] };
    setScenes(data.scenes ?? []);
  }

  useEffect(() => {
    void (async () => {
      const [themeRes, propRes] = await Promise.all([
        fetch("/api/presentations/studio"),
        fetch("/api/properties/search?city=Dubai"),
      ]);
      const themeData = (await themeRes.json()) as {
        themes: CanvasTheme[];
        modes: Mode[];
        deckStyles?: DeckStyle[];
      };
      const propData = (await propRes.json()) as { results: Property[] };
      setThemes(themeData.themes ?? []);
      setModes(themeData.modes ?? []);
      setDeckStyles(themeData.deckStyles ?? []);
      setProperties(propData.results ?? []);
      await refreshScenes();
    })();
  }, []);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  }

  async function onUpload(file: File | null, spatialMode: "2d" | "3d") {
    if (!file) return;
    setBusy(true);
    setError(null);
    setUploadNote(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await fetch("/api/studio/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-PropPilot-Role": "admin" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || "image/png",
          dataUrl,
          mode: spatialMode,
          purpose: spatialMode === "2d" ? "floorplan" : "photo",
          title: `${spatialMode.toUpperCase()} · ${file.name}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "upload failed");
      setActiveSceneId(data.scene.id);
      setMode(spatialMode);
      setUploadNote(`Built ${spatialMode.toUpperCase()} scene from ${file.name}`);
      await refreshScenes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function createDeck() {
    if (selected.length === 0 && !activeSceneId) return;
    setBusy(true);
    setError(null);
    setCreatedId(null);
    setDeckSpec(null);
    setPreviewIndex(0);
    try {
      const res = await fetch("/api/presentations/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyIds: selected,
          themeId,
          mode: mode === "standard" ? "canva" : mode,
          deckStyle,
          sceneId: activeSceneId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "create failed");
      setCreatedId(data.presentation.id);
      setDeckSpec(data.presentation.spec as DeckSpec);
    } catch (err) {
      setError(err instanceof Error ? err.message : "create failed");
    } finally {
      setBusy(false);
    }
  }

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? null;
  const activeTheme = resolveCanvasTheme(
    { slides: [], themeId, theme: themes.find((t) => t.id === themeId) },
    themes,
  );

  const storyboard = useMemo(() => {
    if (selected.length > 1) {
      return ["cover", "compare_matrix", "highlights", "metrics", "spatial", "cta"];
    }
    if (deckStyle === "lifestyle") {
      return ["cover", "metrics", "highlights", "gallery", "neighborhood", "amenities", "floorplan", "facts", "spatial", "cta"];
    }
    if (deckStyle === "investor") {
      return ["cover", "metrics", "highlights", "facts", "amenities", "neighborhood", "gallery", "floorplan", "spatial", "cta"];
    }
    return ["cover", "metrics", "highlights", "facts", "amenities", "neighborhood", "gallery", "floorplan", "spatial", "cta"];
  }, [deckStyle, selected.length]);

  const placeholderSlides = useMemo(
    () => storyboard.map((type, i) => placeholderSlide(type, i, selected, properties, activeTheme)),
    [storyboard, selected, properties, activeTheme],
  );

  const previewSlides = deckSpec?.slides?.length ? deckSpec.slides : placeholderSlides;
  const previewTheme = deckSpec ? resolveCanvasTheme(deckSpec, themes) : activeTheme;
  const previewSlide = previewSlides[previewIndex] ?? previewSlides[0];

  return (
    <AppShell>
      <p className="pp-kicker">PropPilot · Studio</p>
      <h1 className="pp-display pp-page-title">Canva / Gamma canvas</h1>
      <p className="pp-page-lead">
        Design a visual listing deck — 16:9 slides, present mode, PowerPoint export. Not a JSON
        document.
      </p>

      {deckSpec && createdId ? (
        <section style={{ marginTop: "1.5rem" }} className="pp-animate-in">
          <DeckCanvas
            spec={deckSpec}
            themes={themes}
            presentationId={createdId}
            title={deckSpec.title}
            presentMode={presentMode}
            onPresentModeChange={setPresentMode}
          />
          {!presentMode ? (
            <p style={{ marginTop: "0.75rem" }}>
              <Link href={`/presentations/${createdId}`} style={{ color: "var(--accent)", fontWeight: 650 }}>
                Open dedicated canvas page →
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}

      <div
        style={{
          marginTop: "1.75rem",
          display: "grid",
          gap: "1.25rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <section className="pp-panel" style={{ padding: "1.25rem" }}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Deck style</h2>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {(deckStyles.length
                ? deckStyles
                : [
                    { id: "executive", label: "Executive dossier", detail: "Broker-ready board pack" },
                    { id: "lifestyle", label: "Lifestyle edit", detail: "Gallery-forward story" },
                    { id: "investor", label: "Investor brief", detail: "Numbers first" },
                  ]
              ).map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setDeckStyle(style.id)}
                  className="pp-list-link"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid var(--line)",
                    background: deckStyle === style.id ? "var(--accent-soft)" : undefined,
                  }}
                >
                  <strong>
                    {deckStyle === style.id ? "✓ " : ""}
                    {style.label}
                  </strong>
                  <span>{style.detail}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="pp-panel" style={{ padding: "1.25rem" }}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Canvas mode</h2>
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              {(modes.length
                ? modes
                : [
                    { id: "canva", label: "Gamma canvas", detail: "Visual 16:9 deck" },
                    { id: "2d", label: "2D floorplan", detail: "" },
                    { id: "3d", label: "3D scene", detail: "" },
                  ]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`pp-btn ${mode === m.id ? "pp-btn-primary" : "pp-btn-secondary"}`}
                  style={{ padding: "0.55rem 0.9rem" }}
                  onClick={() => setMode(m.id)}
                  title={m.detail}
                >
                  {m.id === "canva" || m.id === "standard" ? "Gamma canvas" : m.label}
                </button>
              ))}
            </div>
          </section>

          <section className="pp-panel" style={{ padding: "1.25rem" }}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Upload → 2D / 3D</h2>
            <p style={{ margin: "0 0 1rem", color: "var(--muted)", fontSize: "0.92rem" }}>
              Drop a floorplan or photo to enrich the spatial slides in the visual deck.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <label className="pp-btn pp-btn-secondary" style={{ cursor: "pointer" }}>
                Upload for 2D
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => void onUpload(e.target.files?.[0] ?? null, "2d")}
                />
              </label>
              <label className="pp-btn pp-btn-secondary" style={{ cursor: "pointer" }}>
                Upload for 3D
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => void onUpload(e.target.files?.[0] ?? null, "3d")}
                />
              </label>
            </div>
            {uploadNote ? (
              <p style={{ margin: "0.85rem 0 0", color: "var(--accent)" }}>{uploadNote}</p>
            ) : null}
            {scenes.length > 0 ? (
              <div style={{ marginTop: "1.1rem", display: "grid", gap: "0.55rem" }}>
                {scenes.slice(0, 6).map((scene) => (
                  <button
                    key={scene.id}
                    type="button"
                    className="pp-list-link"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: activeSceneId === scene.id ? "var(--accent-soft)" : undefined,
                      border: "none",
                      borderBottom: "1px solid var(--line)",
                    }}
                    onClick={() => {
                      setActiveSceneId(scene.id);
                      setMode(scene.mode);
                    }}
                  >
                    <strong>
                      {activeSceneId === scene.id ? "✓ " : ""}
                      {scene.title}
                    </strong>
                    <span>
                      {scene.mode.toUpperCase()} · {scene.rooms.length} zones
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
            {activeScene?.media ? (
              <div
                style={{
                  marginTop: "1rem",
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  position: "relative",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeScene.media.dataUrl}
                  alt={activeScene.media.filename}
                  style={{ width: "100%", height: 180, objectFit: "cover" }}
                />
              </div>
            ) : null}
          </section>

          <section className="pp-panel" style={{ padding: "1.25rem" }}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Theme</h2>
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`pp-btn ${themeId === t.id ? "pp-btn-primary" : "pp-btn-secondary"}`}
                  style={{ padding: "0.55rem 0.9rem" }}
                  onClick={() => setThemeId(t.id)}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 99,
                      background: t.primary,
                      display: "inline-block",
                      marginRight: 6,
                    }}
                  />
                  {t.name}
                </button>
              ))}
            </div>
          </section>

          <section className="pp-panel">
            <div className="pp-list-link" style={{ cursor: "default" }}>
              <strong>Listings</strong>
              <span>Pick one for a full visual deck, or 2–3 for a comparison board.</span>
            </div>
            {properties.map((p) => {
              const on = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  className="pp-list-link"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: on ? "var(--accent-soft)" : undefined,
                    border: "none",
                    borderBottom: "1px solid var(--line)",
                  }}
                  onClick={() => toggle(p.id)}
                >
                  <strong>
                    {on ? "✓ " : ""}
                    {p.title}
                  </strong>
                  <span>
                    {p.district ?? "Dubai"} · AED {p.priceAmount ?? "—"}
                  </span>
                </button>
              );
            })}
          </section>

          {error ? <p className="pp-chat-error">{error}</p> : null}

          <button
            type="button"
            className="pp-btn pp-btn-primary"
            disabled={busy || (selected.length === 0 && !activeSceneId)}
            onClick={() => void createDeck()}
            style={{ width: "fit-content" }}
          >
            {busy ? "Designing canvas…" : "Generate visual deck"}
          </button>
        </div>

        <aside style={{ display: "grid", gap: "0.85rem", position: "sticky", top: 88 }}>
          <div className="pp-panel" style={{ padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.65rem" }}>
              <h2 style={{ margin: 0, fontSize: "1rem" }}>
                {deckSpec ? "Live canvas" : "Storyboard preview"}
              </h2>
              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                {previewIndex + 1}/{previewSlides.length}
              </span>
            </div>
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid var(--line)",
                boxShadow: "0 16px 40px rgba(11,18,32,0.1)",
              }}
            >
              {previewSlide ? (
                <SlideStage
                  slide={previewSlide}
                  theme={previewTheme}
                  index={previewIndex}
                  total={previewSlides.length}
                  density="stage"
                />
              ) : null}
            </div>
            <div style={{ display: "flex", gap: "0.45rem", marginTop: "0.75rem" }}>
              <button
                type="button"
                className="pp-btn pp-btn-secondary"
                disabled={previewIndex === 0}
                onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
              >
                ←
              </button>
              <button
                type="button"
                className="pp-btn pp-btn-secondary"
                disabled={previewIndex >= previewSlides.length - 1}
                onClick={() => setPreviewIndex((i) => Math.min(previewSlides.length - 1, i + 1))}
              >
                →
              </button>
              <span style={{ alignSelf: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                Flip storyboard · {deckStyle} · {activeTheme.name}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: "0.45rem",
            }}
          >
            {previewSlides.slice(0, 8).map((slide, i) => (
              <button
                key={`${slide.type}-${i}`}
                type="button"
                onClick={() => setPreviewIndex(i)}
                style={{
                  padding: 0,
                  border: i === previewIndex ? `2px solid ${previewTheme.primary}` : "1px solid var(--line)",
                  borderRadius: 10,
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "transparent",
                }}
              >
                <SlideStage
                  slide={slide}
                  theme={previewTheme}
                  index={i}
                  total={previewSlides.length}
                  density="thumb"
                />
              </button>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function placeholderSlide(
  type: string,
  index: number,
  selected: string[],
  properties: Property[],
  theme: CanvasTheme,
): PresentationSlide {
  const listing = properties.find((p) => p.id === selected[0]);
  const title = listing?.title ?? (selected.length > 1 ? "Shortlist comparison" : "PropPilot listing");
  const price = listing?.priceAmount ? `AED ${Number(listing.priceAmount).toLocaleString("en-AE")}` : "Price on request";
  const location = listing?.district ?? "Dubai";

  switch (type) {
    case "metrics":
      return {
        type: "metrics",
        title: "At a glance",
        items: [
          { label: "Beds", value: String(listing?.bedrooms ?? "—") },
          { label: "Area", value: listing?.areaSqm ?? "—" },
          { label: "Ask", value: listing?.priceAmount ? `${(Number(listing.priceAmount) / 1e6).toFixed(2)}M` : "—" },
        ],
      };
    case "highlights":
      return {
        type: "highlights",
        title: "Highlights",
        items: [
          { title: location, detail: "Community from inventory" },
          { title: "Verified facts", detail: "Gateway-sourced only" },
        ],
      };
    case "facts":
      return {
        type: "facts",
        title: "Listing facts",
        rows: [
          { label: "Community", value: location },
          { label: "Ask", value: price },
        ],
      };
    case "amenities":
      return { type: "amenities", title: "Amenities", items: ["pool", "gym", "parking"] };
    case "gallery":
      return {
        type: "gallery",
        title: "Media board",
        caption: "Visual frames",
        frames: [
          { label: "Exterior", note: location },
          { label: "Living", note: "Reception" },
          { label: "Kitchen", note: "Dining" },
          { label: "View", note: "Outlook" },
        ],
      };
    case "neighborhood":
      return {
        type: "neighborhood",
        title: "Location",
        district: location,
        city: "Dubai",
        points: [`Community: ${location}`, "Market: AE"],
        body: "Neighborhood context from listing facts.",
      };
    case "floorplan":
      return {
        type: "floorplan",
        title: "Layout zones",
        caption: "Indicative schematic",
        rooms: [
          { id: "l", label: "Living", x: 10, y: 20, w: 45, h: 40 },
          { id: "k", label: "Kitchen", x: 58, y: 20, w: 32, h: 25 },
          { id: "b", label: "Bed", x: 10, y: 65, w: 35, h: 25 },
        ],
      };
    case "compare_matrix":
      return {
        type: "compare_matrix",
        title: "Decision matrix",
        columns: selected.map((id) => properties.find((p) => p.id === id)?.title.split("—")[0]?.trim() ?? id.slice(0, 6)),
        rows: [
          { label: "Ask", values: selected.map((id) => properties.find((p) => p.id === id)?.priceAmount ?? "—") },
        ],
      };
    case "spatial":
      return {
        type: "spatial",
        title: "Spatial preview",
        caption: `${listing?.bedrooms ?? "—"} BR · ${location}`,
        layoutHint: "apartment",
        renderer: "placeholder-3d",
      };
    case "cta":
      return {
        type: "cta",
        title: "Next steps",
        body: "Present this canvas or export PowerPoint for the client.",
        actions: ["Present", "Download PPTX", "Book viewing"],
        contactHint: `Theme ${theme.name}`,
      };
    case "cover":
    default:
      return {
        type: "cover",
        title,
        subtitle: price,
        location: `${location}, Dubai`,
        eyebrow: "PropPilot",
        badge: "Gamma canvas",
        kicker: "Storyboard",
      };
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("could not read file"));
    reader.readAsDataURL(file);
  });
}
