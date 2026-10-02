"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Highlight = {
  leadId: string;
  name: string;
  state: string;
  score: number;
  source: string;
  note: string;
};

type Digest = {
  id: string;
  dateKey: string;
  timezone: string;
  timeLocal: string;
  headline: string;
  summary: string;
  leadCount: number;
  highlights: Highlight[];
  modelName: string;
  provider: string;
  status: "ok" | "error";
  errorMessage: string | null;
  triggeredBy: string;
  createdAt: string;
};

type Schedule = {
  enabled: boolean;
  timeLocal: string;
  timezone: string;
  lastRunDateKey: string | null;
};

type Clock = { dateKey: string; hour: number; minute: number; timeLocal: string };

export default function AdminDigestsPage() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [clock, setClock] = useState<Clock | null>(null);
  const [digests, setDigests] = useState<Digest[]>([]);
  const [latest, setLatest] = useState<Digest | null>(null);
  const [due, setDue] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/digests");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "failed");
      return;
    }
    setSchedule(data.schedule);
    setClock(data.clock);
    setDigests(data.digests ?? []);
    setLatest(data.latest ?? null);
    setDue(Boolean(data.due));
    setReason(data.reason ?? null);
    setError(null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runNow() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/digests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-PropPilot-Role": "admin" },
        body: JSON.stringify({ force: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "run failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "run failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Daily lead digests</h1>
      <p className="pp-page-lead">
        Scheduled task runs once a day with your configured LLM (Grok by default) and surfaces the
        pipeline at a configurable local time — default 10:00.
      </p>

      <section className="pp-panel" style={{ marginTop: "1.5rem", padding: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>Schedule</h2>
            {schedule ? (
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.55 }}>
                {schedule.enabled ? "Enabled" : "Disabled"} · every day at{" "}
                <strong style={{ color: "var(--ink)" }}>{schedule.timeLocal}</strong>{" "}
                ({schedule.timezone})
                <br />
                Last run date: {schedule.lastRunDateKey ?? "never"}
                {clock ? (
                  <>
                    <br />
                    Local clock now: {clock.dateKey} {clock.timeLocal}
                    {due ? " · due now" : reason ? ` · ${reason}` : null}
                  </>
                ) : null}
              </p>
            ) : (
              <p style={{ margin: 0, color: "var(--muted)" }}>Loading…</p>
            )}
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.88rem" }}>
              <Link href="/admin/settings" style={{ color: "var(--accent)" }}>
                Change time in Configuration →
              </Link>
            </p>
          </div>
          <button
            type="button"
            className="pp-btn pp-btn-primary"
            disabled={busy}
            onClick={() => void runNow()}
          >
            {busy ? "Running…" : "Run digest now"}
          </button>
        </div>
      </section>

      {error ? (
        <p className="pp-chat-error" style={{ marginTop: "1rem" }}>
          {error}
        </p>
      ) : null}

      {latest ? (
        <section className="pp-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
          <p className="pp-kicker" style={{ marginBottom: "0.35rem" }}>
            Latest · {latest.dateKey} · {latest.provider}/{latest.modelName}
          </p>
          <h2 style={{ margin: "0 0 0.65rem", fontSize: "1.25rem" }}>{latest.headline}</h2>
          <p style={{ margin: "0 0 1rem", color: "var(--muted)", lineHeight: 1.55 }}>{latest.summary}</p>
          {latest.status === "error" && latest.errorMessage ? (
            <p className="pp-chat-error" style={{ marginBottom: "1rem" }}>
              {latest.errorMessage}
            </p>
          ) : null}
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {latest.highlights.map((h) => (
              <div
                key={`${latest.id}-${h.leadId}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) auto",
                  gap: "0.35rem 1rem",
                  padding: "0.75rem 0",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <div>
                  <strong>{h.name}</strong>
                  <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                    {" "}
                    · {h.state} · {h.source}
                  </span>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>{h.note}</p>
                </div>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{h.score}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: "1rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
            {latest.leadCount} leads in pipeline · triggered by {latest.triggeredBy}
          </p>
        </section>
      ) : (
        <section className="pp-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            No digests yet. Wait for {schedule?.timeLocal ?? "10:00"} or run one now.
          </p>
        </section>
      )}

      {digests.length > 1 ? (
        <section style={{ marginTop: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>History</h2>
          <div className="pp-panel">
            {digests.slice(1).map((d) => (
              <div key={d.id} className="pp-list-link" style={{ cursor: "default" }}>
                <strong>
                  {d.dateKey} — {d.headline}
                </strong>
                <span>
                  {d.leadCount} leads · {d.provider} · {d.triggeredBy}
                  {d.status === "error" ? " · error" : ""}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
