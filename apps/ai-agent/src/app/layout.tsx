import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PropPilot",
  description: "PropPilot AI agent service — Milestone 1 foundation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
