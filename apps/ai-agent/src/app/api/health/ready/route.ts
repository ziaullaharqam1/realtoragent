import { NextResponse } from "next/server";
import { readiness } from "@/lib/ai-agent/health/probes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const report = await readiness();
  const status = report.status === "ok" ? 200 : 503;
  return NextResponse.json(report, { status });
}
