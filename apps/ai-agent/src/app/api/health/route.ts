import { NextResponse } from "next/server";
import { fullHealth } from "@/lib/ai-agent/health/probes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const report = await fullHealth();
  const status = report.status === "down" ? 503 : 200;
  return NextResponse.json(report, { status });
}
