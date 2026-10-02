"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Analytics = {
  leads: number;
  conversations: number;
  messages: number;
  approvalsPending: number;
  approvalsApproved: number;
  presentations: number;
  outbox: number;
  properties: number;
  viewings: number;
  audits: number;
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const data = (await res.json()) as Analytics & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "failed");
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "failed");
      }
    })();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm tracking-[0.35em] uppercase text-[color:var(--accent-2)]">PropPilot</p>
        <h1 className="text-3xl font-semibold text-white">Analytics</h1>
        <p className="text-sm text-white/60">Demo counters from the in-memory / local store.</p>
        <Link href="/admin" className="text-sm text-white/50 hover:text-white">
          ← Admin
        </Link>
      </header>
      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
      {stats ? (
        <dl className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["Leads", stats.leads],
              ["Properties", stats.properties],
              ["Conversations", stats.conversations],
              ["Messages", stats.messages],
              ["Pending approvals", stats.approvalsPending],
              ["Approved sends", stats.approvalsApproved],
              ["Presentations", stats.presentations],
              ["Viewings", stats.viewings],
              ["Outbox items", stats.outbox],
              ["Tool audits", stats.audits],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-md border border-white/10 bg-white/5 px-4 py-4"
            >
              <dt className="text-xs uppercase tracking-wide text-white/45">{label}</dt>
              <dd className="mt-2 text-3xl font-semibold text-white">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-white/50">Loading…</p>
      )}
    </main>
  );
}
