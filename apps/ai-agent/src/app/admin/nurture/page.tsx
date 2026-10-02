"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Job = {
  id: string;
  leadId: string;
  channel: string;
  status: string;
  dueAt: string;
  template: string;
  lastError: string | null;
};

export default function AdminNurturePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/nurture");
    const data = (await res.json()) as { jobs: Job[]; error?: string };
    if (!res.ok) throw new Error(data.error ?? "failed");
    setJobs(data.jobs ?? []);
  }, []);

  useEffect(() => {
    void refresh().catch((err) => setError(err instanceof Error ? err.message : "failed"));
  }, [refresh]);

  async function schedule() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/nurture", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-PropPilot-Role": "admin" },
        body: JSON.stringify({
          action: "schedule",
          leadId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          delayMinutes: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "schedule failed");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  async function drain() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/nurture", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-PropPilot-Role": "admin" },
        body: JSON.stringify({ action: "run" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "run failed");
      setJobs(data.jobs ?? []);
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
      <h1 className="pp-display pp-page-title">Nurture cadence</h1>
      <p className="pp-page-lead">
        Schedule follow-ups for warm leads. Jobs respect marketing consent before send.
      </p>

      <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
        <button type="button" className="pp-btn pp-btn-primary" disabled={busy} onClick={() => void schedule()}>
          Schedule demo job
        </button>
        <button type="button" className="pp-btn pp-btn-secondary" disabled={busy} onClick={() => void drain()}>
          Drain due jobs
        </button>
      </div>

      {error ? (
        <p className="pp-chat-error" style={{ marginTop: "1rem" }}>
          {error}
        </p>
      ) : null}

      <div className="pp-panel" style={{ marginTop: "1.5rem" }}>
        {jobs.length === 0 ? (
          <p style={{ margin: 0, padding: "1.25rem", color: "var(--muted)" }}>No nurture jobs yet.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="pp-list-link" style={{ cursor: "default" }}>
              <strong>
                {job.status} · {job.channel}
              </strong>
              <span>
                Lead {job.leadId.slice(0, 8)} · due {new Date(job.dueAt).toLocaleString()}
                {job.lastError ? ` · ${job.lastError}` : ""}
              </span>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
