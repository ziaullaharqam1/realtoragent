"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

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

const SUGGESTIONS = [
  "Looking for a 2BR in Dubai Marina under 2.5M AED",
  "Book a viewing tomorrow at 3pm",
  "Build a presentation for the marina listing",
  "Connect me with a broker",
];

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/conversations?id=${encodeURIComponent(id)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { messages: ChatMessage[] };
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    if (conversationId) void loadConversation(conversationId);
  }, [conversationId, loadConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    setInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, conversationId }),
      });
      const data = (await res.json()) as ChatResponse;
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "chat failed");
      }
      setConversationId(data.conversationId);
      setMeta(
        [
          data.agentName ? data.agentName.replace("Agent", "") : null,
          data.shadowMode ? "Shadow approval queued" : "Live reply",
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await send(input);
  }

  return (
    <AppShell>
      <div className="pp-animate-in" style={{ marginBottom: "1.25rem" }}>
        <p className="pp-kicker">PropPilot</p>
        <h1 className="pp-display pp-page-title">Chat</h1>
        <p className="pp-page-lead">
          Ask about budget, Marina or JLT listings, viewings, presentations, or a broker handoff.
        </p>
      </div>

      <div className="pp-chat-layout">
        <aside className="pp-chat-aside">
          <h2>Try</h2>
          <div className="pp-chip-list">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="pp-chip" onClick={() => void send(s)} disabled={busy}>
                {s}
              </button>
            ))}
          </div>
          <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
            Need oversight?{" "}
            <Link href="/admin/approvals" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Review approvals
            </Link>
          </p>
        </aside>

        <section className="pp-chat-main">
          <div className="pp-chat-messages">
            {messages.length === 0 && !busy && (
              <div className="pp-empty">
                Start with a buyer need — neighborhood, bedrooms, and budget — and PropPilot will
                route the right agent.
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`pp-msg ${m.role === "user" ? "user" : "assistant"}`}>
                <div className="pp-msg-role">{m.role === "user" ? "You" : "PropPilot"}</div>
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="pp-msg assistant" style={{ opacity: 0.7 }}>
                <div className="pp-msg-role">PropPilot</div>
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {meta ? <div className="pp-chat-meta">{meta}</div> : null}
          {error ? <div className="pp-chat-meta pp-chat-error">{error}</div> : null}
          <form onSubmit={onSubmit} className="pp-chat-composer">
            <input
              className="pp-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message PropPilot…"
              disabled={busy}
              aria-label="Message"
            />
            <button
              type="submit"
              className="pp-btn pp-btn-primary"
              disabled={busy || !input.trim()}
              style={{ minWidth: "5.5rem" }}
            >
              {busy ? "…" : "Send"}
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
