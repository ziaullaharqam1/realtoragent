import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell bare>
      <section className="pp-hero">
        <div className="pp-hero-bg" aria-hidden />
        <div className="pp-hero-grid" aria-hidden />
        <div className="pp-hero-inner">
          <div className="pp-animate-in">
            <p className="pp-kicker">PropPilot</p>
            <h1 className="pp-display">Property conversations that close.</h1>
            <p className="pp-hero-copy">
              Qualify buyers, match Dubai inventory, and book viewings — with shadow approvals so
              brokers stay in control.
            </p>
            <div className="pp-cta-row">
              <Link href="/chat" className="pp-btn pp-btn-primary">
                Start a conversation
              </Link>
              <Link href="/admin" className="pp-btn pp-btn-secondary">
                Open admin
              </Link>
            </div>
          </div>

          <div className="pp-product-stage" aria-label="PropPilot product preview">
            <div className="pp-chat-preview">
              <div className="pp-chat-preview-bar">
                <span>Live assistant</span>
                <span>Shadow mode on</span>
              </div>
              <div className="pp-chat-bubble user">
                Looking for a 2BR in Dubai Marina under 2.5M AED this month.
              </div>
              <div className="pp-chat-bubble assistant">
                Shortlist ready: Marina Gate Tower 2 — AED 2,450,000. I can book a viewing with
                Sara or draft a presentation for approval.
              </div>
              <div
                className="pp-chat-bubble assistant"
                style={{ animationDelay: "420ms", maxWidth: "70%" }}
              >
                Want me to schedule tomorrow at 3pm?
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pp-section pp-section-tint">
        <div className="pp-container">
          <h2 className="pp-display">Built for brokers, not bots alone</h2>
          <p className="lead">
            One calm surface for the moments that matter — intake, match, booking, and human
            handoff.
          </p>
          <div className="pp-feature-row">
            <article className="pp-feature pp-animate-in">
              <h3>Qualify with context</h3>
              <p>Capture budget, timeline, and consent before inventory is shown.</p>
            </article>
            <article className="pp-feature pp-animate-in-delay">
              <h3>Match with facts</h3>
              <p>Hybrid search blends hard filters with semantic ranking on your listings.</p>
            </article>
            <article className="pp-feature pp-animate-in-delay">
              <h3>Approve before send</h3>
              <p>Shadow mode queues drafts so nothing leaves without a broker decision.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="pp-footer">
        <div className="pp-container" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <span>PropPilot</span>
          <span>Demo mode · Vercel-ready · Kill switch included</span>
        </div>
      </footer>
    </AppShell>
  );
}
