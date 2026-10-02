"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

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

  const rows = stats
    ? ([
        ["Leads", stats.leads],
        ["Properties", stats.properties],
        ["Conversations", stats.conversations],
        ["Messages", stats.messages],
        ["Pending approvals", stats.approvalsPending],
        ["Approved sends", stats.approvalsApproved],
        ["Presentations", stats.presentations],
        ["Viewings", stats.viewings],
        ["Outbox", stats.outbox],
        ["Tool audits", stats.audits],
      ] as const)
    : [];

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Analytics</h1>
      <p className="pp-page-lead">Lightweight counters from the PropPilot store.</p>
      {error ? <p className="pp-chat-error" style={{ marginTop: "1rem" }}>{error}</p> : null}
      <div
        style={{
          marginTop: "1.75rem",
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        }}
      >
        {rows.map(([label, value]) => (
          <div
            key={label}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "14px",
              padding: "1.1rem 1.15rem",
              boxShadow: "var(--shadow)",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {label}
            </div>
            <div className="pp-display" style={{ fontSize: "2rem", marginTop: "0.35rem" }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
