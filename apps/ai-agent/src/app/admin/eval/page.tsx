"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type EvalReport = {
  total: number;
  passed: number;
  failed: number;
  ok: boolean;
  results: Array<{ id: string; name: string; pass: boolean; detail: string }>;
  ranAt: string;
};

export default function AdminEvalPage() {
  const [report, setReport] = useState<EvalReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/eval/run", { method: "POST", body: "{}" });
      const data = (await res.json()) as EvalReport & { error?: string };
      if (!res.ok && !data.results) throw new Error(data.error ?? "eval failed");
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "eval failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void run();
  }, []);

  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Eval harness</h1>
      <p className="pp-page-lead">
        Lightweight go-live checks for qualification routing, hybrid ranking, and handoff.
      </p>
      <button
        type="button"
        className="pp-btn pp-btn-primary"
        style={{ marginTop: "1.25rem" }}
        disabled={busy}
        onClick={() => void run()}
      >
        {busy ? "Running…" : "Run suite"}
      </button>
      {error ? <p className="pp-chat-error" style={{ marginTop: "1rem" }}>{error}</p> : null}
      {report ? (
        <div className="pp-panel" style={{ marginTop: "1.5rem" }}>
          <div className="pp-list-link" style={{ cursor: "default" }}>
            <strong>
              {report.passed}/{report.total} passed {report.ok ? "· suite green" : "· suite red"}
            </strong>
            <span>{new Date(report.ranAt).toLocaleString()}</span>
          </div>
          {report.results.map((r) => (
            <div key={r.id} className="pp-list-link" style={{ cursor: "default" }}>
              <strong>
                {r.pass ? "Pass" : "Fail"} · {r.name}
              </strong>
              <span>{r.detail}</span>
            </div>
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}
