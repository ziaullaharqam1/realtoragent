"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Flag = {
  id: string;
  flagKey: string;
  scopeType: string;
  isEnabled: boolean;
  shadowMode: boolean;
  description: string | null;
};

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/flags");
    const data = (await res.json()) as { flags: Flag[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "failed");
      return;
    }
    setFlags(data.flags ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(flag: Flag, field: "isEnabled" | "shadowMode") {
    setBusy(flag.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flagKey: flag.flagKey,
          isEnabled: field === "isEnabled" ? !flag.isEnabled : flag.isEnabled,
          shadowMode: field === "shadowMode" ? !flag.shadowMode : flag.shadowMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "update failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "update failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <Link href="/admin" className="text-sm text-white/50 hover:text-white">
          ← Admin
        </Link>
        <h1 className="text-3xl font-semibold text-white">Feature flags</h1>
        <p className="text-sm text-white/60">
          Kill switch, orchestrator, and channel flags. Demo defaults: AI on, kill switch off, shadow off.
        </p>
      </header>
      {error && <p className="text-sm text-[color:var(--danger)]">{error}</p>}
      <ul className="space-y-3">
        {flags.map((f) => (
          <li key={f.id} className="rounded-md border border-white/10 bg-black/20 p-4">
            <div className="font-mono text-sm text-white">{f.flagKey}</div>
            <p className="mt-1 text-xs text-white/50">{f.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy === f.id}
                onClick={() => void toggle(f, "isEnabled")}
                className={`rounded-md px-3 py-1.5 text-xs ${
                  f.isEnabled
                    ? "bg-[color:var(--ok)]/80 text-[#04140f]"
                    : "bg-white/10 text-white/70"
                }`}
              >
                Enabled: {f.isEnabled ? "yes" : "no"}
              </button>
              <button
                type="button"
                disabled={busy === f.id}
                onClick={() => void toggle(f, "shadowMode")}
                className={`rounded-md px-3 py-1.5 text-xs ${
                  f.shadowMode
                    ? "bg-[color:var(--accent-2)]/80 text-[#04140f]"
                    : "bg-white/10 text-white/70"
                }`}
              >
                Shadow: {f.shadowMode ? "on" : "off"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
