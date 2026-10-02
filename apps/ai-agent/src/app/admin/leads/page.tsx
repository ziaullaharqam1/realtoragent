"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lead = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  state: string;
  score: number;
  assignedBrokerId: string | null;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/leads");
      const data = (await res.json()) as { leads: Lead[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "failed");
        return;
      }
      setLeads(data.leads ?? []);
    })();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <Link href="/admin" className="text-sm text-white/50 hover:text-white">
          ← Admin
        </Link>
        <h1 className="text-3xl font-semibold text-white">Leads</h1>
        <p className="text-sm text-white/60">Seeded and webhook-created leads in the PropPilot demo store.</p>
      </header>
      {error && <p className="text-sm text-[color:var(--danger)]">{error}</p>}
      <div className="overflow-x-auto rounded-md border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">State</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-white/10">
                <td className="px-3 py-2 text-white">{l.fullName ?? "—"}</td>
                <td className="px-3 py-2 text-white/70">{l.source}</td>
                <td className="px-3 py-2 text-white/70">{l.state}</td>
                <td className="px-3 py-2 text-white/70">{l.score}</td>
                <td className="px-3 py-2 text-white/55">
                  {[l.email, l.phone].filter(Boolean).join(" · ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
