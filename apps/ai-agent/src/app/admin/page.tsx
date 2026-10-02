import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const links = [
  { href: "/admin/leads", label: "Leads", detail: "Profiles, scores, and sources" },
  { href: "/admin/approvals", label: "Approvals", detail: "Shadow drafts waiting for a broker" },
  { href: "/admin/conversations", label: "Conversations", detail: "Channel threads and status" },
  { href: "/admin/analytics", label: "Analytics", detail: "Volume across the demo store" },
  { href: "/admin/flags", label: "Flags", detail: "Kill switch, channels, shadow mode" },
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
