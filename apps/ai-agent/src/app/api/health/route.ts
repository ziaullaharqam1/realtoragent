import { NextResponse } from "next/server";
import { fullHealth } from "@/lib/ai-agent/health/probes";
import { startDailyLeadsTicker } from "@/lib/ai-agent/schedule/ticker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Boot the daily digest ticker on first health probe (local/dev)
  startDailyLeadsTicker();
  const report = await fullHealth();
  const status = report.status === "down" ? 503 : 200;
  return NextResponse.json(report, { status });
}
