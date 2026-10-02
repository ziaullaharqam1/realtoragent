import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const CHECKS = [
  {
    title: "Health probes",
    detail: "GET /api/health returns live + ready in demo mode.",
    href: "/api/health",
  },
  {
    title: "Kill switch",
    detail: "Toggle ai.kill_switch in Flags — chat should short-circuit.",
    href: "/admin/flags",
  },
  {
    title: "Shadow approvals",
    detail: "With shadow on, drafts land in Approvals before send.",
    href: "/admin/approvals",
  },
  {
    title: "Viewing calendar",
    detail: "Ask chat to book a viewing — SchedulingAgent uses availability slots.",
    href: "/chat",
  },
  {
    title: "Presentation Studio",
    detail: "Build a compare deck, open viewer, export Markdown / PPTX-JSON.",
    href: "/studio",
  },
  {
    title: "Nurture cadence",
    detail: "Schedule + drain nurture jobs; consent gates marketing sends.",
    href: "/admin/nurture",
  },
  {
    title: "n8n commands",
    detail: "ping, refresh_embeddings, sync_leads, drain_outbox, run_nurture.",
    href: "/admin/n8n",
  },
  {
    title: "Eval gate",
    detail: "Run the full harness before calling a pilot ready.",
    href: "/admin/eval",
  },
  {
    title: "Metrics",
    detail: "GET /api/metrics for ops counters (RBAC: admin/broker).",
    href: "/api/metrics",
  },
  {
    title: "Channel secrets",
    detail: "Optional: WHATSAPP_APP_SECRET, TELEGRAM_WEBHOOK_SECRET, N8N_WEBHOOK_SECRET.",
    href: "/admin",
  },
];

export default function RunbookPage() {
  return (
    <AppShell>
      <Link href="/admin" className="pp-kicker">
        ← Admin
      </Link>
      <h1 className="pp-display pp-page-title">Pilot runbook</h1>
      <p className="pp-page-lead">
        Staging checklist for a PropPilot demo pilot. Work top to bottom; green eval last.
      </p>

      <ol className="pp-panel" style={{ listStyle: "none", padding: 0, marginTop: "1.5rem" }}>
        {CHECKS.map((item, index) => (
          <li key={item.title}>
            <Link href={item.href} className="pp-list-link">
              <strong>
                {index + 1}. {item.title}
              </strong>
              <span>{item.detail}</span>
            </Link>
          </li>
        ))}
      </ol>
    </AppShell>
  );
}
