import { NextResponse } from "next/server";
import {
  applySettingsToEnvHints,
  getSettings,
  maskSettings,
  updateSettings,
  type DemoSettings,
} from "@/lib/ai-agent/config/settings";
import { requirePermission } from "@/lib/ai-agent/auth/rbac";
import { LLM_PROVIDERS, resolveLlmConfig } from "@/lib/ai-agent/llm/providers";

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
  const resolved = resolveLlmConfig(settings.llm);
  return NextResponse.json({
    settings: canReveal ? settings : maskSettings(settings),
    masked: !canReveal,
    llmProviders: LLM_PROVIDERS,
    llmResolved: {
      provider: resolved.provider,
      model: resolved.model,
      baseUrl: resolved.baseUrl,
      enabled: resolved.enabled,
      hasApiKey: Boolean(resolved.apiKey),
      fallbackToMock: resolved.fallbackToMock,
      source: resolved.source,
    },
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
