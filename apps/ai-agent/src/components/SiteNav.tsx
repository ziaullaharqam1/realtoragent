"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Me = {
  authenticated: boolean;
  principal: { displayName: string; role: string } | null;
};

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: Me) => setMe(data))
      .catch(() => setMe({ authenticated: false, principal: null }));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe({ authenticated: false, principal: null });
    window.location.href = "/login";
  }

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
          <Link href="/admin/settings">Config</Link>
        </nav>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {me?.authenticated && me.principal ? (
            <>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                {me.principal.displayName}
              </span>
              <button type="button" className="pp-btn pp-btn-ghost" onClick={() => void logout()}>
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="pp-btn pp-btn-ghost">
              Log in
            </Link>
          )}
          <Link href="/chat" className="pp-btn pp-btn-primary">
            Open chat
          </Link>
        </div>
      </div>
    </header>
  );
}
