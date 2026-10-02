"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Session = {
  principal: { role: string; userId: string; displayName: string };
  permissions: Record<string, boolean>;
  note: string;
};

export default function AdminAccessPage() {
  const [role, setRole] = useState("admin");
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/session", {
          headers: { "X-PropPilot-Role": role },
        });
        const data = (await res.json()) as Session & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "failed");
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "failed");
      }
    })();
  }, [role]);

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Access (demo RBAC)</h1>
      <p className="pp-page-lead">
        Roles are resolved from the <code>X-PropPilot-Role</code> header until SSO lands.
      </p>

      <div className="pp-panel" style={{ marginTop: "1.5rem", padding: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {(["admin", "broker", "viewer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`pp-btn ${role === r ? "pp-btn-primary" : "pp-btn-secondary"}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
        {error ? <p className="pp-chat-error">{error}</p> : null}
        {session ? (
          <div style={{ marginTop: "1.25rem" }}>
            <p style={{ margin: "0 0 0.75rem", color: "var(--muted)" }}>
              {session.principal.displayName} · {session.principal.role}
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.7 }}>
              {Object.entries(session.permissions).map(([key, value]) => (
                <li key={key}>
                  {key}: {value ? "allowed" : "denied"}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--muted)" }}>
              {session.note}
            </p>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
