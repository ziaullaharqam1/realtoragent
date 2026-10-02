import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PropPilot",
  description:
    "PropPilot AI agent — qualify leads, match listings, book viewings, and hand off to brokers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
