"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Theme = {
  id: string;
  name: string;
  primary: string;
  secondary?: string;
  surface: string;
  ink: string;
};
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
  const [themes, setThemes] = useState<Theme[]>([]);
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
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [slideCountHint, setSlideCountHint] = useState<number | null>(null);

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
        themes: Theme[];
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
    setSlideCountHint(null);
    try {
      const res = await fetch("/api/presentations/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyIds: selected,
          themeId,
          mode,
          deckStyle,
          sceneId: activeSceneId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "create failed");
      setCreatedId(data.presentation.id);
      const slides = data.presentation?.spec?.slides;
      setSlideCountHint(Array.isArray(slides) ? slides.length : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "create failed");
    } finally {
      setBusy(false);
    }
  }

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? null;
  const activeTheme = themes.find((t) => t.id === themeId) ?? themes[0];
  const outline = useMemo(() => {
    if (selected.length > 1) {
      return ["Cover", "Decision matrix", "Highlights", "Per-listing metrics", "Layout footprints", "CTA"];
    }
    if (deckStyle === "lifestyle") {
      return ["Cover", "Metrics", "Highlights", "Gallery", "Neighborhood", "Amenities", "Floorplan", "Facts", "Narrative", "Spatial", "CTA"];
    }
    if (deckStyle === "investor") {
      return ["Cover", "Metrics", "Highlights", "Facts", "Amenities", "Neighborhood", "Narrative", "Gallery", "Floorplan", "Spatial", "CTA"];
    }
    return ["Cover", "Metrics", "Highlights", "Facts", "Amenities", "Neighborhood", "Gallery", "Floorplan", "Narrative", "Spatial", "CTA"];
  }, [deckStyle, selected.length]);

  return (
    <AppShell>
      <p className="pp-kicker">PropPilot</p>
      <h1 className="pp-display pp-page-title">Presentation Studio</h1>
      <p className="pp-page-lead">
        Advanced Canva-style dossiers — metric boards, neighborhood splits, floorplan zones, and
        investor/lifestyle edits — with real PowerPoint export.
      </p>

      <div
        style={{
          marginTop: "1.75rem",
          display: "grid",
          gap: "1.25rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Studio mode</h2>
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`pp-btn ${mode === m.id ? "pp-btn-primary" : "pp-btn-secondary"}`}
                  style={{ padding: "0.55rem 0.9rem" }}
                  onClick={() => setMode(m.id)}
                  title={m.detail}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </section>

          <section className="pp-panel" style={{ padding: "1.25rem" }}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Upload → 2D / 3D</h2>
            <p style={{ margin: "0 0 1rem", color: "var(--muted)", fontSize: "0.92rem" }}>
              Drop a floorplan PNG/JPG for a 2D room map, or a property photo for a 3D scene shell.
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
                      {scene.mode.toUpperCase()} · {scene.rooms.length} zones ·{" "}
                      {scene.media?.filename ?? "no media"}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {activeScene ? (
              <div
                style={{
                  marginTop: "1.1rem",
                  position: "relative",
                  minHeight: 240,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  background: "#0b1220",
                }}
              >
                {activeScene.media ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeScene.media.dataUrl}
                    alt={activeScene.media.filename}
                    style={{
                      width: "100%",
                      height: 260,
                      objectFit: "cover",
                      opacity: activeScene.mode === "3d" ? 0.55 : 0.85,
                      transform:
                        activeScene.mode === "3d"
                          ? `perspective(900px) rotateX(${activeScene.camera.pitch * 0.35}deg) rotateY(${activeScene.camera.yaw}deg) scale(${activeScene.camera.zoom})`
                          : "none",
                      transformOrigin: "center center",
                    }}
                  />
                ) : null}
                {activeScene.rooms.map((room) => (
                  <div
                    key={room.id}
                    style={{
                      position: "absolute",
                      left: `${room.x}%`,
                      top: `${room.y}%`,
                      width: `${room.w}%`,
                      height: `${room.h}%`,
                      border: "2px solid rgba(15,110,106,0.85)",
                      background: "rgba(15,110,106,0.18)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 650,
                      padding: 4,
                      boxSizing: "border-box",
                    }}
                  >
                    {room.label}
                  </div>
                ))}
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
              <span>Select one for a full dossier, or 2–3 for a comparison matrix.</span>
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
                    {p.bedrooms != null ? ` · ${p.bedrooms} BR` : ""}
                  </span>
                </button>
              );
            })}
          </section>

          {error ? <p className="pp-chat-error">{error}</p> : null}
          {createdId ? (
            <p>
              Advanced deck ready
              {slideCountHint ? ` · ${slideCountHint} slides` : ""} —{" "}
              <Link href={`/presentations/${createdId}`} style={{ color: "var(--accent)", fontWeight: 650 }}>
                open slide canvas / download PPTX
              </Link>
            </p>
          ) : null}

          <button
            type="button"
            className="pp-btn pp-btn-primary"
            disabled={busy || (selected.length === 0 && !activeSceneId)}
            onClick={() => void createDeck()}
            style={{ width: "fit-content" }}
          >
            {busy
              ? "Building advanced deck…"
              : selected.length > 1
                ? "Build comparison dossier"
                : "Build advanced PowerPoint deck"}
          </button>
        </div>

        <aside className="pp-panel" style={{ padding: "1.25rem", alignSelf: "start", position: "sticky", top: 88 }}>
          <h2 style={{ margin: "0 0 0.35rem", fontSize: "1rem" }}>Deck outline</h2>
          <p style={{ margin: "0 0 1rem", color: "var(--muted)", fontSize: "0.88rem" }}>
            {deckStyle} · {activeTheme?.name ?? "theme"} ·{" "}
            {selected.length > 1 ? "compare" : selected.length === 1 ? "single listing" : "scene-only"}
          </p>
          <ol style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.45rem" }}>
            {outline.map((step) => (
              <li key={step} style={{ color: "var(--ink)", fontSize: "0.92rem" }}>
                {step}
              </li>
            ))}
          </ol>
          <div
            style={{
              marginTop: "1.25rem",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid var(--line)",
              minHeight: 160,
              background: activeTheme
                ? `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary ?? activeTheme.primary})`
                : "var(--accent)",
              color: "#fff",
              padding: "1.1rem",
              display: "grid",
              alignContent: "end",
            }}
          >
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.08em", opacity: 0.85 }}>PREVIEW COVER</span>
            <strong style={{ fontSize: "1.05rem", marginTop: 6 }}>
              {selected.length === 1
                ? properties.find((p) => p.id === selected[0])?.title ?? "Listing dossier"
                : selected.length > 1
                  ? "Shortlist comparison"
                  : activeScene?.title ?? "Spatial study"}
            </strong>
          </div>
        </aside>
      </div>

    </AppShell>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("could not read file"));
    reader.readAsDataURL(file);
  });
}
