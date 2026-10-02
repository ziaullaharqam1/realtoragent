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
  consentAi?: boolean;
  consentMarketing?: boolean;
};

const FLOW_STEPS = [
  {
    title: "1. Intake",
    detail:
      "Leads enter via website form webhook (POST /api/webhooks/leads), WhatsApp/Telegram when configured, or chat (auto-linked to seeded Alex Chen / new identity).",
  },
  {
    title: "2. Persist behind LeadGateway",
    detail:
      "DemoLeadGateway writes into the in-memory store (or Postgres when DATABASE_URL is set). Fields: name, email, phone, source, state, score, consents.",
  },
  {
    title: "3. Identity + consent",
    detail:
      "Channel external IDs link to the same lead. AI consent is required on WA/TG before orchestration continues.",
  },
  {
    title: "4. Orchestrator agents",
    detail:
      "Qualify → Match → Schedule / Present / Handoff / Nurture. Shadow mode parks drafts in Approvals.",
  },
  {
    title: "5. Admin list",
    detail:
      "This page calls GET /api/admin/leads → DemoLeadGateway.list(tenant). Table below is that live list.",
  },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/leads");
    const data = (await res.json()) as { leads: Lead[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "failed");
      return;
    }
    setLeads(data.leads ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createSampleLead() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/webhooks/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "New Portal Lead",
          email: `lead+${Date.now()}@example.com`,
          phone: "+971555000111",
          source: "website_form",
          consentAi: true,
          consentMarketing: true,
          autoQualify: true,
          budget: "2.5M AED",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "create failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "create failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Leads</h1>
      <p className="pp-page-lead">
        How PropPilot gets and shows leads — then the live list from LeadGateway.
      </p>

      <ol className="pp-panel" style={{ listStyle: "none", padding: 0, marginTop: "1.5rem" }}>
        {FLOW_STEPS.map((step) => (
          <li key={step.title} className="pp-list-link" style={{ cursor: "default" }}>
            <strong>{step.title}</strong>
            <span>{step.detail}</span>
          </li>
        ))}
      </ol>

      <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="pp-btn pp-btn-primary"
          disabled={creating}
          onClick={() => void createSampleLead()}
        >
          {creating ? "Creating…" : "Simulate portal lead"}
        </button>
        <Link href="/admin/settings" className="pp-btn pp-btn-secondary">
          Configure lead credentials
        </Link>
      </div>

      {error ? (
        <p className="pp-chat-error" style={{ marginTop: "1rem" }}>
          {error}
        </p>
      ) : null}

      <div className="pp-panel" style={{ overflowX: "auto", marginTop: "1.5rem" }}>
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
                <td style={{ color: "var(--muted)" }}>{lead.email ?? lead.phone ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
