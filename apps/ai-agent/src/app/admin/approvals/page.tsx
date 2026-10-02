"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Approval = {
  id: string;
  channel: string;
  status: string;
  draftPayload: { text?: string; agentName?: string };
  createdAt: string;
  decisionNote: string | null;
};

export default function AdminApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/approvals");
    const data = (await res.json()) as { approvals: Approval[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "failed to load");
      return;
    }
    setApprovals(data.approvals ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(id: string, decision: "approved" | "rejected") {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/approvals/${id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "decide failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "decide failed");
    } finally {
      setBusyId(null);
    }
  }

  const pending = approvals.filter((a) => a.status === "pending");

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Approvals</h1>
      <p className="pp-page-lead">
        Shadow-mode drafts wait here. Approve to send, or reject to keep the thread quiet.
      </p>
      {error ? <p className="pp-chat-error" style={{ marginTop: "1rem" }}>{error}</p> : null}

      <div className="pp-panel" style={{ marginTop: "1.75rem" }}>
        {pending.length === 0 ? (
          <div className="pp-empty" style={{ padding: "3rem 1.5rem" }}>
            No pending drafts. Chat in shadow mode to queue one.
          </div>
        ) : (
          pending.map((a) => (
            <div key={a.id} className="pp-list-link" style={{ cursor: "default" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <strong>{a.draftPayload.agentName ?? "Agent"} · {a.channel}</strong>
                <span className="pp-badge">{a.status}</span>
              </div>
              <span style={{ marginTop: "0.65rem", whiteSpace: "pre-wrap", color: "var(--ink-soft)" }}>
                {a.draftPayload.text ?? "—"}
              </span>
              <div style={{ marginTop: "0.9rem", display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="pp-btn pp-btn-primary"
                  disabled={busyId === a.id}
                  onClick={() => void decide(a.id, "approved")}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn-danger"
                  disabled={busyId === a.id}
                  onClick={() => void decide(a.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
