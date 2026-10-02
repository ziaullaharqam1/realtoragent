"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`pp-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="pp-nav-inner">
        <Link href="/" className="pp-brand">
          PropPilot
        </Link>
        <nav className="pp-nav-links" aria-label="Primary">
          <Link href="/chat">Chat</Link>
          <Link href="/studio">Studio</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/admin/runbook">Runbook</Link>
        </nav>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin" className="pp-btn pp-btn-ghost">
            Dashboard
          </Link>
          <Link href="/chat" className="pp-btn pp-btn-primary">
            Open chat
          </Link>
        </div>
      </div>
    </header>
  );
}
