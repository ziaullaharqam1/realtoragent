import { NextResponse } from "next/server";
import { collectMetrics } from "@/lib/ai-agent/metrics/service";
import { requirePermission } from "@/lib/ai-agent/auth/rbac";
import { isDemoMode } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = requirePermission(request.headers, "metrics:read");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  return NextResponse.json(collectMetrics(isDemoMode()));
}
