"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm tracking-[0.35em] uppercase text-[color:var(--accent-2)]">PropPilot</p>
        <h1 className="text-3xl font-semibold text-white">Conversations</h1>
        <Link href="/admin" className="text-sm text-white/50 hover:text-white">
          ← Admin
        </Link>
      </header>
      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-white/50">No conversations yet — try the chat.</li>
        ) : (
          items.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-white/50">{c.id.slice(0, 8)}</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs uppercase">{c.channel}</span>
              </div>
              <p className="mt-1">
                Status <strong className="text-white">{c.status}</strong>
                {c.leadId ? ` · lead ${c.leadId.slice(0, 8)}` : ""}
              </p>
              <p className="text-xs text-white/40">{new Date(c.updatedAt).toLocaleString()}</p>
            </li>
          ))
        )}
      </ul>
      <Link href="/chat" className="text-sm text-[color:var(--accent)] hover:underline">
        Open chat →
      </Link>
    </main>
  );
}
