"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <Link href="/admin" className="text-sm text-white/50 hover:text-white">
          ← Admin
        </Link>
        <h1 className="text-3xl font-semibold text-white">Shadow approvals</h1>
        <p className="text-sm text-white/60">
          Drafts captured while shadow mode is on. Approve to release to the channel outbox.
        </p>
      </header>
      {error && <p className="text-sm text-[color:var(--danger)]">{error}</p>}
      <ul className="space-y-3">
        {approvals.length === 0 && (
          <li className="text-sm text-white/45">No approvals yet. Enable shadow mode and send a chat message.</li>
        )}
        {approvals.map((a) => (
          <li key={a.id} className="rounded-md border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/45">
              <span>
                {a.status} · {a.channel} · {a.draftPayload.agentName ?? "agent"}
              </span>
              <span>{new Date(a.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-white/85">
              {a.draftPayload.text ?? JSON.stringify(a.draftPayload)}
            </p>
            {a.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => void decide(a.id, "approved")}
                  className="rounded-md bg-[color:var(--ok)]/80 px-3 py-1.5 text-xs font-medium text-[#04140f]"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => void decide(a.id, "rejected")}
                  className="rounded-md bg-[color:var(--danger)]/80 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Reject
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
