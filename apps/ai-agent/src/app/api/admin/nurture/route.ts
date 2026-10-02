import { NextResponse } from "next/server";
import {
  listNurtureJobs,
  processDueNurtureJobs,
  scheduleNurtureJob,
} from "@/lib/ai-agent/nurture/cadence";
import { requirePermission } from "@/lib/ai-agent/auth/rbac";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ jobs: listNurtureJobs() });
}

export async function POST(request: Request) {
  const auth = requirePermission(request.headers, "admin:write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "run");

  if (action === "schedule") {
    const leadId = String(body.leadId ?? "");
    if (!leadId) {
      return NextResponse.json({ error: "leadId required" }, { status: 400 });
    }
    const job = scheduleNurtureJob({
      tenantId: String(body.tenantId ?? defaultTenantId()),
      leadId,
      channel: body.channel ? String(body.channel) : "web",
      delayMinutes: body.delayMinutes != null ? Number(body.delayMinutes) : 0,
      template: body.template ? String(body.template) : undefined,
    });
    return NextResponse.json({ job });
  }

  const result = await processDueNurtureJobs();
  return NextResponse.json({ result, jobs: listNurtureJobs(20) });
}
