import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const links = [
  { href: "/admin/leads", label: "Leads", detail: "Profiles, scores, and sources" },
  { href: "/admin/approvals", label: "Approvals", detail: "Shadow drafts waiting for a broker" },
  { href: "/admin/conversations", label: "Conversations", detail: "Takeover, release, channel threads" },
  { href: "/admin/nurture", label: "Nurture", detail: "Follow-up cadence jobs" },
  { href: "/admin/n8n", label: "n8n bridge", detail: "Commands the automation plane calls" },
  { href: "/admin/analytics", label: "Analytics", detail: "Volume across the demo store" },
  { href: "/admin/flags", label: "Flags", detail: "Kill switch, channels, shadow mode" },
  { href: "/admin/access", label: "Access", detail: "Demo RBAC roles until SSO" },
  { href: "/admin/eval", label: "Eval harness", detail: "Go-live checks for routing and search" },
  { href: "/admin/runbook", label: "Pilot runbook", detail: "Staging checklist before a pilot" },
  { href: "/studio", label: "Presentation Studio", detail: "Themes, decks, and comparisons" },
  { href: "/chat", label: "Live chat", detail: "Talk to the orchestrator" },
];

export default function AdminPage() {
  return (
    <AppShell>
      <div className="pp-animate-in">
        <p className="pp-kicker">PropPilot</p>
        <h1 className="pp-display pp-page-title">Admin</h1>
        <p className="pp-page-lead">
          A quiet operations view — leads, approvals, conversations, and controls. Nothing noisy.
        </p>
      </div>

      <div className="pp-panel pp-animate-in-delay">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="pp-list-link">
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
