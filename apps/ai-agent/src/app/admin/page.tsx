import Link from "next/link";

const links = [
  { href: "/admin/leads", label: "Leads", detail: "Demo CRM lead list" },
  { href: "/admin/approvals", label: "Shadow approvals", detail: "Review drafts before send" },
  { href: "/admin/flags", label: "Feature flags", detail: "Kill switch, shadow, channels" },
  { href: "/chat", label: "Conversations (chat)", detail: "Open web chat UI" },
  { href: "/api/conversations", label: "Conversations API", detail: "JSON conversation list" },
  { href: "/api/presentations", label: "Presentations API", detail: "List / create decks" },
  { href: "/api/health", label: "Health", detail: "DB / Redis / LLM / demo probes" },
  { href: "/api/properties/search?q=marina&city=Dubai", label: "Property search", detail: "Hybrid search sample" },
];

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="space-y-3">
        <p className="text-sm tracking-[0.35em] uppercase text-[color:var(--accent-2)]">PropPilot</p>
        <h1 className="text-4xl font-semibold text-white">Admin</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-white/65">
          Operations dashboard for the demo slice — leads, shadow approvals, flags, conversations,
          presentations, and health. Runs in-memory when Postgres is not configured.
        </p>
        <Link href="/" className="text-sm text-white/50 hover:text-white">
          ← Home
        </Link>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md border border-white/10 bg-white/5 px-4 py-4 transition hover:border-[color:var(--accent)] hover:bg-white/10"
            >
              <span className="text-base font-medium text-white">{item.label}</span>
              <span className="mt-1 block text-sm text-white/55">{item.detail}</span>
              <span className="mt-2 block font-mono text-xs text-white/35">{item.href}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
