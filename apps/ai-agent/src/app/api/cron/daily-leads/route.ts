import { NextResponse } from "next/server";
import {
  runDailyLeadsDigest,
  shouldRunDailyDigest,
} from "@/lib/ai-agent/schedule/daily-leads";
import { getSettings } from "@/lib/ai-agent/config/settings";
import { startDailyLeadsTicker } from "@/lib/ai-agent/schedule/ticker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Demo / local: allow without secret; production should set CRON_SECRET
    return true;
  }
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const header = request.headers.get("x-cron-secret");
  return header === secret;
}

/**
 * Vercel Cron (and manual) entrypoint for the daily LLM lead digest.
 * Runs hourly on Vercel; only produces a digest once the configured local
 * time (default 10:00) has passed and not yet for that calendar day.
 */
export async function GET(request: Request) {
  // Ensure local ticker is also running when this route is hit in long-lived Node
  startDailyLeadsTicker();

  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";
  const check = shouldRunDailyDigest();
  const schedule = getSettings().schedule;

  if (!force && !check.due) {
    return NextResponse.json({
      ok: true,
      ran: false,
      skipped: true,
      reason: check.reason,
      schedule: {
        enabled: schedule.enabled,
        timeLocal: schedule.timeLocal,
        timezone: schedule.timezone,
        lastRunDateKey: schedule.lastRunDateKey,
      },
      clock: check.clock,
    });
  }

  const result = await runDailyLeadsDigest({
    force,
    triggeredBy: force ? "manual" : "cron",
  });

  return NextResponse.json({
    ok: true,
    ran: result.ran,
    skipped: result.skipped ?? false,
    reason: result.reason,
    digest: result.digest
      ? {
          id: result.digest.id,
          dateKey: result.digest.dateKey,
          headline: result.digest.headline,
          leadCount: result.digest.leadCount,
          modelName: result.digest.modelName,
          provider: result.digest.provider,
          status: result.digest.status,
          createdAt: result.digest.createdAt,
        }
      : null,
  });
}

export async function POST(request: Request) {
  return GET(request);
}
