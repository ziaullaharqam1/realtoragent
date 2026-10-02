import { NextResponse } from "next/server";
import { liveness } from "@/lib/ai-agent/health/probes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const report = await liveness();
  return NextResponse.json(report, { status: 200 });
}
