"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";

const COMMANDS = [
  "ping",
  "refresh_embeddings",
  "sync_leads",
  "drain_outbox",
  "run_nurture",
  "schedule_nurture",
] as const;

export default function AdminN8nPage() {
  const [command, setCommand] = useState<(typeof COMMANDS)[number]>("ping");
  const [leadId, setLeadId] = useState("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const payload =
        command === "schedule_nurture"
          ? { leadId, delayMinutes: 0 }
          : undefined;
      const res = await fetch("/api/n8n/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "command failed");
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">n8n bridge</h1>
      <p className="pp-page-lead">
        Run PropPilot commands the automation plane would call. Signature optional in demo.
      </p>

      <div className="pp-panel" style={{ marginTop: "1.5rem", padding: "1.25rem" }}>
        <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)" }}>
          Command
          <select
            value={command}
            onChange={(e) => setCommand(e.target.value as (typeof COMMANDS)[number])}
            style={{
              display: "block",
              marginTop: "0.4rem",
              width: "100%",
              maxWidth: 360,
              padding: "0.65rem 0.75rem",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--bg)",
            }}
          >
            {COMMANDS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {command === "schedule_nurture" ? (
          <label
            style={{ display: "block", marginTop: "1rem", fontSize: "0.85rem", color: "var(--muted)" }}
          >
            Lead ID
            <input
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              style={{
                display: "block",
                marginTop: "0.4rem",
                width: "100%",
                maxWidth: 420,
                padding: "0.65rem 0.75rem",
                borderRadius: 10,
                border: "1px solid var(--line)",
                background: "var(--bg)",
              }}
            />
          </label>
        ) : null}

        <button
          type="button"
          className="pp-btn pp-btn-primary"
          style={{ marginTop: "1.25rem" }}
          disabled={busy}
          onClick={() => void run()}
        >
          {busy ? "Running…" : "Execute"}
        </button>
      </div>

      {error ? (
        <p className="pp-chat-error" style={{ marginTop: "1rem" }}>
          {error}
        </p>
      ) : null}
      {result ? (
        <pre
          className="pp-panel"
          style={{
            marginTop: "1rem",
            padding: "1rem",
            overflow: "auto",
            fontSize: "0.85rem",
            lineHeight: 1.45,
          }}
        >
          {result}
        </pre>
      ) : null}
    </AppShell>
  );
}
