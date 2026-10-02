"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Conversation = {
  id: string;
  channel: string;
  leadId: string | null;
  status: string;
  updatedAt: string;
};

export default function AdminConversationsPage() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/conversations");
        const data = (await res.json()) as { conversations?: Conversation[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "failed");
        setItems(data.conversations ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "failed");
      }
    })();
  }, []);

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Conversations</h1>
      <p className="pp-page-lead">Recent channel threads in the demo store.</p>
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
                {c.channel} · {c.status}
              </strong>
              <span>
                {c.id.slice(0, 8)}
                {c.leadId ? ` · lead ${c.leadId.slice(0, 8)}` : ""} ·{" "}
                {new Date(c.updatedAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
