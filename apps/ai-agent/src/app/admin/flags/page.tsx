"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Flag = {
  id: string;
  flagKey: string;
  scopeType: string;
  isEnabled: boolean;
  shadowMode: boolean;
  description: string | null;
};

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/flags");
    const data = (await res.json()) as { flags: Flag[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "failed");
      return;
    }
    setFlags(data.flags ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(flag: Flag, field: "isEnabled" | "shadowMode") {
    setBusy(flag.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flagKey: flag.flagKey,
          isEnabled: field === "isEnabled" ? !flag.isEnabled : flag.isEnabled,
          shadowMode: field === "shadowMode" ? !flag.shadowMode : flag.shadowMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "update failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "update failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Flags</h1>
      <p className="pp-page-lead">
        Kill switch, orchestrator, and channel controls. Shadow mode keeps drafts in approvals.
      </p>
      {error ? <p className="pp-chat-error" style={{ marginTop: "1rem" }}>{error}</p> : null}
      <div className="pp-panel">
        {flags.map((f) => (
          <div key={f.id} className="pp-list-link" style={{ cursor: "default" }}>
            <strong style={{ fontFamily: "var(--font-body)" }}>{f.flagKey}</strong>
            <span>{f.description}</span>
            <div style={{ marginTop: "0.85rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                disabled={busy === f.id}
                onClick={() => void toggle(f, "isEnabled")}
                className={`pp-btn ${f.isEnabled ? "pp-btn-primary" : "pp-btn-secondary"}`}
                style={{ padding: "0.45rem 0.8rem", fontSize: "0.8rem" }}
              >
                Enabled: {f.isEnabled ? "yes" : "no"}
              </button>
              <button
                type="button"
                disabled={busy === f.id}
                onClick={() => void toggle(f, "shadowMode")}
                className={`pp-btn ${f.shadowMode ? "pp-btn-secondary" : "pp-btn-ghost"}`}
                style={{ padding: "0.45rem 0.8rem", fontSize: "0.8rem", border: "1px solid var(--line)" }}
              >
                Shadow: {f.shadowMode ? "on" : "off"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
