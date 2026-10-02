import Link from "next/link";

const primary = [
  { href: "/chat", label: "Chat", detail: "Qualify, match, book viewings" },
  { href: "/admin", label: "Admin", detail: "Leads, approvals, flags, health" },
];

const endpoints = [
  { href: "/api/health", label: "Health" },
  { href: "/api/ai/gate", label: "AI gate" },
  { href: "/api/properties/search?q=marina&city=Dubai", label: "Hybrid search" },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-10 px-6 py-16">
      <header className="space-y-4">
        <p className="text-sm tracking-[0.35em] uppercase text-[color:var(--accent-2)]">PropPilot</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Property AI that brokers can trust
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-[color:var(--mist)]/80">
          Qualify buyers, match Dubai inventory, book viewings, and hand off to humans — with kill
          switch, shadow approvals, and demo mode that runs on Vercel without Postgres.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {primary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/15 px-5 py-5 transition hover:bg-[color:var(--accent)]/25"
          >
            <span className="text-lg font-semibold text-white">{item.label}</span>
            <span className="mt-1 block text-sm text-white/65">{item.detail}</span>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium tracking-wide text-white/70 uppercase">Diagnostics</h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {endpoints.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:border-[color:var(--accent)] hover:bg-white/10"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="text-xs text-white/40">
        Demo mode activates when DATABASE_URL is unset or DEMO_MODE=true. Set LLM_ENABLED + keys for
        a live OpenAI-compatible model.
      </footer>
    </main>
  );
}
