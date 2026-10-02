"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Conversation = {
  id: string;
  channel: string;
  leadId: string | null;
  status: string;
  owner?: string;
  assignedBrokerId?: string | null;
  updatedAt: string;
};

export default function AdminConversationsPage() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/conversations");
      const data = (await res.json()) as { conversations?: Conversation[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "failed");
      setItems(data.conversations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function act(conversationId: string, action: "takeover" | "release") {
    setBusyId(conversationId);
    setError(null);
    try {
      const res = await fetch("/api/admin/conversations/takeover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "action failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Conversations</h1>
      <p className="pp-page-lead">
        Take over a thread to pause AI, or release it back to PropPilot.
      </p>
      {error ? <p className="pp-chat-error" style={{ marginTop: "1rem" }}>{error}</p> : null}
      <div className="pp-panel">
        {items.length === 0 ? (
          <div className="pp-empty" style={{ padding: "3rem 1.5rem" }}>
            No conversations yet —{" "}
            <Link href="/chat" style={{ color: "var(--accent)", fontWeight: 600 }}>
              open chat
            </Link>
            .
          </div>
        ) : (
          items.map((c) => (
            <div key={c.id} className="pp-list-link" style={{ cursor: "default" }}>
              <strong>
                {c.channel} · {c.status} · owner {c.owner ?? "ai"}
              </strong>
              <span>
                {c.id.slice(0, 8)}
                {c.leadId ? ` · lead ${c.leadId.slice(0, 8)}` : ""} ·{" "}
                {new Date(c.updatedAt).toLocaleString()}
              </span>
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="pp-btn pp-btn-secondary"
                  style={{ padding: "0.45rem 0.8rem", fontSize: "0.8rem" }}
                  disabled={busyId === c.id || c.owner === "human"}
                  onClick={() => void act(c.id, "takeover")}
                >
                  Takeover
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn-primary"
                  style={{ padding: "0.45rem 0.8rem", fontSize: "0.8rem" }}
                  disabled={busyId === c.id || c.owner !== "human"}
                  onClick={() => void act(c.id, "release")}
                >
                  Release to AI
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
