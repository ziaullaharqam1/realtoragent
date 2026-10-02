import { NextResponse } from "next/server";
import {
  applySettingsToEnvHints,
  getSettings,
  maskSettings,
  updateSettings,
  type DemoSettings,
} from "@/lib/ai-agent/config/settings";
import { requirePermission } from "@/lib/ai-agent/auth/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = requirePermission(request.headers, "admin:read");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const settings = getSettings();
  const reveal = new URL(request.url).searchParams.get("reveal") === "1";
  const canReveal = auth.principal.role === "admin" && reveal;
  return NextResponse.json({
    settings: canReveal ? settings : maskSettings(settings),
    masked: !canReveal,
  });
}

export async function PUT(request: Request) {
  const auth = requirePermission(request.headers, "settings:write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = (await request.json().catch(() => ({}))) as Partial<DemoSettings>;
  const next = updateSettings(body);
  applySettingsToEnvHints(next);
  return NextResponse.json({ settings: maskSettings(next), ok: true });
}
