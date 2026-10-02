import { NextResponse } from "next/server";
import { runEvalSuite } from "@/lib/ai-agent/eval/harness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { reset?: boolean };
  const report = await runEvalSuite({ reset: body.reset !== false });
  return NextResponse.json(report, { status: report.ok ? 200 : 422 });
}

export async function GET() {
  const report = await runEvalSuite({ reset: true });
  return NextResponse.json(report, { status: report.ok ? 200 : 422 });
}
