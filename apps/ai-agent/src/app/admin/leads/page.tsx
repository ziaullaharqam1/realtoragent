"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Lead = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  state: string;
  score: number;
  assignedBrokerId: string | null;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/leads");
      const data = (await res.json()) as { leads: Lead[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "failed");
        return;
      }
      setLeads(data.leads ?? []);
    })();
  }, []);

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Leads</h1>
      <p className="pp-page-lead">Seeded and webhook-created leads in the PropPilot store.</p>
      {error ? <p className="pp-chat-error" style={{ marginTop: "1rem" }}>{error}</p> : null}
      <div className="pp-panel" style={{ overflowX: "auto" }}>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Source</th>
              <th>State</th>
              <th>Score</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.fullName ?? "—"}</td>
                <td>
                  <span className="pp-badge">{lead.source}</span>
                </td>
                <td>{lead.state}</td>
                <td>{lead.score}</td>
                <td style={{ color: "var(--muted)" }}>
                  {lead.email ?? lead.phone ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
