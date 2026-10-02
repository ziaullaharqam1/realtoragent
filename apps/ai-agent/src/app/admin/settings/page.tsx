"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import type { DemoSettings } from "@/lib/ai-agent/demo/store";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<DemoSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "failed");
        setSettings(data.settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "failed");
      }
    })();
  }, []);

  async function save() {
    if (!settings) return;
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-PropPilot-Role": "admin" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "save failed");
      setSettings(data.settings);
      setSaved("Configuration saved. Channel secrets apply to new webhook traffic in this demo instance.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!settings) {
    return (
      <AppShell>
        <p className="pp-page-lead">{error ?? "Loading configuration…"}</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Configuration</h1>
      <p className="pp-page-lead">
        WhatsApp, Telegram, lead portals, LLM/n8n credentials, and automation triggers — one place.
      </p>

      <section className="pp-panel" style={{ marginTop: "1.5rem", padding: "1.25rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem" }}>WhatsApp Cloud</h2>
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          <Toggle
            label="Enabled"
            checked={settings.whatsapp.enabled}
            onChange={(v) =>
              setSettings({ ...settings, whatsapp: { ...settings.whatsapp, enabled: v } })
            }
          />
          <Field
            label="Verify token"
            value={settings.whatsapp.verifyToken}
            onChange={(v) =>
              setSettings({ ...settings, whatsapp: { ...settings.whatsapp, verifyToken: v } })
            }
          />
          <Field
            label="App secret"
            value={settings.whatsapp.appSecret}
            onChange={(v) =>
              setSettings({ ...settings, whatsapp: { ...settings.whatsapp, appSecret: v } })
            }
          />
          <Field
            label="Access token"
            value={settings.whatsapp.accessToken}
            onChange={(v) =>
              setSettings({ ...settings, whatsapp: { ...settings.whatsapp, accessToken: v } })
            }
          />
          <Field
            label="Phone number ID"
            value={settings.whatsapp.phoneNumberId}
            onChange={(v) =>
              setSettings({ ...settings, whatsapp: { ...settings.whatsapp, phoneNumberId: v } })
            }
          />
          <Field label="Webhook path" value={settings.whatsapp.webhookUrlHint} onChange={() => undefined} />
        </div>
      </section>

      <section className="pp-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem" }}>Telegram Bot</h2>
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          <Toggle
            label="Enabled"
            checked={settings.telegram.enabled}
            onChange={(v) =>
              setSettings({ ...settings, telegram: { ...settings.telegram, enabled: v } })
            }
          />
          <Field
            label="Bot token"
            value={settings.telegram.botToken}
            onChange={(v) =>
              setSettings({ ...settings, telegram: { ...settings.telegram, botToken: v } })
            }
          />
          <Field
            label="Webhook secret"
            value={settings.telegram.webhookSecret}
            onChange={(v) =>
              setSettings({ ...settings, telegram: { ...settings.telegram, webhookSecret: v } })
            }
          />
          <Field label="Webhook path" value={settings.telegram.webhookUrlHint} onChange={() => undefined} />
        </div>
      </section>

      <section className="pp-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem" }}>Lead source credentials</h2>
        <div style={{ display: "grid", gap: "1rem" }}>
          {settings.leadSources.map((src, idx) => (
            <div
              key={src.id}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "1rem",
                display: "grid",
                gap: "0.65rem",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              }}
            >
              <strong style={{ gridColumn: "1 / -1" }}>{src.name}</strong>
              <Toggle
                label="Enabled"
                checked={src.enabled}
                onChange={(v) => {
                  const leadSources = settings.leadSources.slice();
                  leadSources[idx] = { ...src, enabled: v };
                  setSettings({ ...settings, leadSources });
                }}
              />
              <Field
                label="API key"
                value={src.apiKey}
                onChange={(v) => {
                  const leadSources = settings.leadSources.slice();
                  leadSources[idx] = { ...src, apiKey: v };
                  setSettings({ ...settings, leadSources });
                }}
              />
              <Field
                label="API secret"
                value={src.apiSecret}
                onChange={(v) => {
                  const leadSources = settings.leadSources.slice();
                  leadSources[idx] = { ...src, apiSecret: v };
                  setSettings({ ...settings, leadSources });
                }}
              />
              <Field
                label="Portal account"
                value={src.portalAccount}
                onChange={(v) => {
                  const leadSources = settings.leadSources.slice();
                  leadSources[idx] = { ...src, portalAccount: v };
                  setSettings({ ...settings, leadSources });
                }}
              />
              <p style={{ gridColumn: "1 / -1", margin: 0, color: "var(--muted)", fontSize: "0.85rem" }}>
                {src.notes}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="pp-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem" }}>n8n + LLM</h2>
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          <Toggle
            label="n8n enabled"
            checked={settings.n8n.enabled}
            onChange={(v) => setSettings({ ...settings, n8n: { ...settings.n8n, enabled: v } })}
          />
          <Field
            label="n8n webhook URL"
            value={settings.n8n.webhookUrl}
            onChange={(v) => setSettings({ ...settings, n8n: { ...settings.n8n, webhookUrl: v } })}
          />
          <Field
            label="n8n secret"
            value={settings.n8n.webhookSecret}
            onChange={(v) => setSettings({ ...settings, n8n: { ...settings.n8n, webhookSecret: v } })}
          />
          <Toggle
            label="LLM enabled"
            checked={settings.llm.enabled}
            onChange={(v) => setSettings({ ...settings, llm: { ...settings.llm, enabled: v } })}
          />
          <Field
            label="LLM base URL"
            value={settings.llm.baseUrl}
            onChange={(v) => setSettings({ ...settings, llm: { ...settings.llm, baseUrl: v } })}
          />
          <Field
            label="LLM API key"
            value={settings.llm.apiKey}
            onChange={(v) => setSettings({ ...settings, llm: { ...settings.llm, apiKey: v } })}
          />
        </div>
      </section>

      <section className="pp-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem" }}>Triggers</h2>
        <div style={{ display: "grid", gap: "0.55rem" }}>
          {settings.triggers.map((t, idx) => (
            <label
              key={t.id}
              style={{
                display: "flex",
                gap: "0.85rem",
                alignItems: "flex-start",
                padding: "0.75rem 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <input
                type="checkbox"
                checked={t.enabled}
                onChange={(e) => {
                  const triggers = settings.triggers.slice();
                  triggers[idx] = { ...t, enabled: e.target.checked };
                  setSettings({ ...settings, triggers });
                }}
                style={{ marginTop: 4 }}
              />
              <span>
                <strong style={{ display: "block" }}>{t.name}</strong>
                <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                  {t.description} · <code>{t.event}</code>
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {error ? <p className="pp-chat-error" style={{ marginTop: "1rem" }}>{error}</p> : null}
      {saved ? <p style={{ marginTop: "1rem", color: "var(--accent)" }}>{saved}</p> : null}

      <button
        type="button"
        className="pp-btn pp-btn-primary"
        style={{ marginTop: "1.25rem" }}
        disabled={busy}
        onClick={() => void save()}
      >
        {busy ? "Saving…" : "Save configuration"}
      </button>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.82rem", color: "var(--muted)" }}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "0.55rem 0.7rem",
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "var(--bg)",
          color: "var(--ink)",
        }}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: "flex", gap: "0.55rem", alignItems: "center", fontSize: "0.9rem" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
