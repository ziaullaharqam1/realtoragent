"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type ChatResponse = {
  conversationId: string;
  replyText: string | null;
  agentName?: string;
  shadowMode: boolean;
  approvalId?: string;
  allowed: boolean;
  reason?: string;
};

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/conversations?id=${encodeURIComponent(id)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { messages: ChatMessage[] };
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    if (conversationId) void loadConversation(conversationId);
  }, [conversationId, loadConversation]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    setInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, conversationId }),
      });
      const data = (await res.json()) as ChatResponse;
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "chat failed");
      }
      setConversationId(data.conversationId);
      setMeta(
        [
          data.agentName ? `Agent: ${data.agentName}` : null,
          data.shadowMode ? "Shadow mode (draft stored for approval)" : "Live send",
          data.approvalId ? `Approval ${data.approvalId.slice(0, 8)}` : null,
          !data.allowed ? data.reason : null,
        ]
          .filter(Boolean)
          .join(" · "),
      );
      await loadConversation(data.conversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "chat failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm tracking-[0.35em] uppercase text-[color:var(--accent-2)]">PropPilot</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-semibold text-white">Chat</h1>
          <Link href="/admin" className="text-sm text-white/60 hover:text-white">
            Admin →
          </Link>
        </div>
        <p className="text-sm text-white/65">
          Ask about budget, Dubai Marina / JLT listings, viewings, presentations, or broker handoff.
        </p>
      </header>

      <section className="flex min-h-[420px] flex-1 flex-col rounded-lg border border-white/10 bg-black/20">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-sm text-white/45">
              Example: &quot;Looking for a 2BR in Dubai Marina under 2.5M AED, ready this month.&quot;
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-[color:var(--accent)]/25 text-white"
                  : "bg-white/8 text-[color:var(--mist)]"
              }`}
            >
              <div className="mb-1 text-[10px] uppercase tracking-wide text-white/40">{m.role}</div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
        </div>
        {meta && <p className="border-t border-white/10 px-4 py-2 text-xs text-white/45">{meta}</p>}
        {error && <p className="border-t border-white/10 px-4 py-2 text-xs text-[color:var(--danger)]">{error}</p>}
        <form onSubmit={onSubmit} className="flex gap-2 border-t border-white/10 p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message PropPilot…"
            className="flex-1 rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--accent)]"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[#04140f] disabled:opacity-40"
          >
            {busy ? "…" : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}
