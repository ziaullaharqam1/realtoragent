"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AppShell } from "@/components/AppShell";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/admin";
  const [email, setEmail] = useState("admin@proppilot.demo");
  const [password, setPassword] = useState("proppilot");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "login failed");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <p className="pp-kicker">PropPilot</p>
      <h1 className="pp-display pp-page-title">Sign in</h1>
      <p className="pp-page-lead">
        Demo accounts ship with the app. Use admin for settings, channels, and Studio spatial tools.
      </p>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="pp-panel"
        style={{ marginTop: "1.5rem", padding: "1.35rem", maxWidth: 440, display: "grid", gap: "0.9rem" }}
      >
        <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.88rem", color: "var(--muted)" }}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "0.7rem 0.8rem",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--bg)",
              color: "var(--ink)",
            }}
          />
        </label>
        <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.88rem", color: "var(--muted)" }}>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "0.7rem 0.8rem",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--bg)",
              color: "var(--ink)",
            }}
          />
        </label>
        {error ? <p className="pp-chat-error">{error}</p> : null}
        <button type="submit" className="pp-btn pp-btn-primary" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="pp-panel" style={{ marginTop: "1rem", padding: "1rem 1.25rem", maxWidth: 440 }}>
        <strong style={{ display: "block", marginBottom: "0.5rem" }}>Demo credentials</strong>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)", lineHeight: 1.7, fontSize: "0.92rem" }}>
          <li>admin@proppilot.demo / proppilot</li>
          <li>broker@proppilot.demo / broker</li>
          <li>viewer@proppilot.demo / viewer</li>
        </ul>
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
          Or continue without login for public chat —{" "}
          <Link href="/chat" style={{ color: "var(--accent)" }}>
            Open chat
          </Link>
        </p>
      </div>
    </AppShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AppShell><p className="pp-page-lead">Loading…</p></AppShell>}>
      <LoginForm />
    </Suspense>
  );
}
