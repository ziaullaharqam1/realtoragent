import Link from "next/link";

const endpoints = [
  { href: "/api/health/live", label: "Liveness" },
  { href: "/api/health/ready", label: "Readiness" },
  { href: "/api/health/startup", label: "Startup" },
  { href: "/api/health", label: "Full health" },
  { href: "/api/ai/gate", label: "AI kill-switch gate" },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-10 px-6 py-16">
      <header className="space-y-4">
        <p className="text-sm tracking-[0.35em] uppercase text-[color:var(--accent-2)]">PropPilot</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          AI agent foundation
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-[color:var(--mist)]/80">
          Milestone 1: gateways, feature flags with shadow mode, tool-call audit hooks,
          health probes, and object-storage wiring. Deploy on Vercel; run Postgres, Redis,
          and MinIO locally via Compose.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-medium tracking-wide text-white/70 uppercase">Health & gate</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {endpoints.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:border-[color:var(--accent)] hover:bg-white/10"
              >
                {item.label}
                <span className="mt-1 block font-mono text-xs text-white/50">{item.href}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="text-xs text-white/40">
        Kill switch and shadow mode default on. Core AI loop ships in later milestones.
      </footer>
    </main>
  );
}
