"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Theme = { id: string; name: string; primary: string; surface: string; ink: string };
type Property = { id: string; title: string; district: string | null; priceAmount: string | null };

export default function PresentationStudioPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [themeId, setThemeId] = useState("marina");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [themeRes, propRes] = await Promise.all([
        fetch("/api/presentations/studio"),
        fetch("/api/properties/search?city=Dubai"),
      ]);
      const themeData = (await themeRes.json()) as { themes: Theme[] };
      const propData = (await propRes.json()) as { results: Property[] };
      setThemes(themeData.themes ?? []);
      setProperties(propData.results ?? []);
    })();
  }, []);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  }

  async function createDeck() {
    if (selected.length === 0) return;
    setBusy(true);
    setError(null);
    setCreatedId(null);
    try {
      const res = await fetch("/api/presentations/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyIds: selected, themeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "create failed");
      setCreatedId(data.presentation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <p className="pp-kicker">PropPilot</p>
      <h1 className="pp-display pp-page-title">Presentation Studio</h1>
      <p className="pp-page-lead">
        Build fact-based decks or compare up to three listings. Themes change look — never invent
        facts.
      </p>

      <div style={{ marginTop: "1.75rem", display: "grid", gap: "1.25rem" }}>
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
            <span>Select one for a deck, or 2–3 for a comparison.</span>
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
        {createdId ? (
          <p>
            Deck ready —{" "}
            <Link href={`/presentations/${createdId}`} style={{ color: "var(--accent)", fontWeight: 650 }}>
              open presentation
            </Link>
          </p>
        ) : null}

        <button
          type="button"
          className="pp-btn pp-btn-primary"
          disabled={busy || selected.length === 0}
          onClick={() => void createDeck()}
          style={{ width: "fit-content" }}
        >
          {busy ? "Building…" : selected.length > 1 ? "Build comparison" : "Build presentation"}
        </button>
      </div>
    </AppShell>
  );
}
