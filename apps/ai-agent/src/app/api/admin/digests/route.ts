import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/ai-agent/auth/rbac";
import { getSettings } from "@/lib/ai-agent/config/settings";
import {
  getLatestLeadDigest,
  getZonedClock,
  listLeadDigests,
  runDailyLeadsDigest,
  shouldRunDailyDigest,
} from "@/lib/ai-agent/schedule/daily-leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = requirePermission(request.headers, "admin:read");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const settings = getSettings();
  const check = shouldRunDailyDigest();
  return NextResponse.json({
    schedule: settings.schedule,
    clock: check.clock,
    due: check.due,
    reason: check.reason,
    latest: getLatestLeadDigest(),
    digests: listLeadDigests(30),
  });
}

export async function POST(request: Request) {
  const auth = requirePermission(request.headers, "admin:write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = (await request.json().catch(() => ({}))) as { force?: boolean };
  const result = await runDailyLeadsDigest({
    force: body.force !== false,
    triggeredBy: "manual",
  });
  const settings = getSettings();
  return NextResponse.json({
    ok: true,
    ran: result.ran,
    skipped: result.skipped ?? false,
    reason: result.reason,
    digest: result.digest,
    schedule: settings.schedule,
    clock: getZonedClock(new Date(), settings.schedule.timezone),
  });
}
