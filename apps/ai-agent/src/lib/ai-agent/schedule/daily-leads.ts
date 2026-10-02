import { getSettings, updateSettings } from "@/lib/ai-agent/config/settings";
import {
  getDemoStore,
  newId,
  type DemoLead,
  type DemoLeadDigest,
  type DemoLeadDigestHighlight,
} from "@/lib/ai-agent/demo/store";
import { createLlmClient } from "@/lib/ai-agent/llm/client";
import { resolveLlmConfig } from "@/lib/ai-agent/llm/providers";

export type ZonedClock = {
  dateKey: string;
  hour: number;
  minute: number;
  timeLocal: string;
};

/** Read calendar date + clock in a named IANA timezone. */
export function getZonedClock(date: Date, timeZone: string): ZonedClock {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  let hour = Number(parts.hour ?? "0");
  if (hour === 24) hour = 0;
  const minute = Number(parts.minute ?? "0");
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    hour,
    minute,
    timeLocal: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function parseTimeLocal(timeLocal: string): { hour: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeLocal.trim());
  if (!match) return { hour: 10, minute: 0 };
  const hour = Math.min(23, Math.max(0, Number(match[1])));
  const minute = Math.min(59, Math.max(0, Number(match[2])));
  return { hour, minute };
}

/**
 * True when local clock is at/after the configured time and we have not yet
 * run for this calendar date in the schedule timezone.
 */
export function shouldRunDailyDigest(now = new Date()): {
  due: boolean;
  reason: string;
  clock: ZonedClock;
  schedule: ReturnType<typeof getSettings>["schedule"];
} {
  const settings = getSettings();
  const schedule = settings.schedule;
  const clock = getZonedClock(now, schedule.timezone || "Asia/Dubai");
  if (!schedule.enabled) {
    return { due: false, reason: "schedule disabled", clock, schedule };
  }
  const target = parseTimeLocal(schedule.timeLocal || "10:00");
  const minutesNow = clock.hour * 60 + clock.minute;
  const minutesTarget = target.hour * 60 + target.minute;
  if (minutesNow < minutesTarget) {
    return { due: false, reason: `before ${schedule.timeLocal}`, clock, schedule };
  }
  if (schedule.lastRunDateKey === clock.dateKey) {
    return { due: false, reason: `already ran for ${clock.dateKey}`, clock, schedule };
  }
  return { due: true, reason: "due", clock, schedule };
}

function leadLine(lead: DemoLead): string {
  const name = lead.fullName ?? "Unnamed";
  return `- ${name} | state=${lead.state} | score=${lead.score} | source=${lead.source} | id=${lead.id.slice(0, 8)}`;
}

function fallbackHighlights(leads: DemoLead[]): DemoLeadDigestHighlight[] {
  return leads
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((l) => ({
      leadId: l.id,
      name: l.fullName ?? "Unnamed lead",
      state: l.state,
      score: l.score,
      source: l.source,
      note:
        l.score >= 70
          ? "High priority — follow up today"
          : l.state === "qualifying"
            ? "Still qualifying — nudge for budget/bedrooms"
            : `Watch ${l.state}`,
    }));
}

function parseHighlightsFromLlm(
  content: string,
  leads: DemoLead[],
): { headline: string; summary: string; highlights: DemoLeadDigestHighlight[] } {
  const byId = new Map(leads.map((l) => [l.id, l]));
  const byShort = new Map(leads.map((l) => [l.id.slice(0, 8), l]));
  try {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const json = JSON.parse(content.slice(start, end + 1)) as {
        headline?: string;
        summary?: string;
        highlights?: Array<{
          leadId?: string;
          name?: string;
          note?: string;
          state?: string;
          score?: number;
          source?: string;
        }>;
      };
      const highlights: DemoLeadDigestHighlight[] = (json.highlights ?? [])
        .map((h) => {
          const id = h.leadId ?? "";
          const lead = byId.get(id) ?? byShort.get(id.slice(0, 8));
          if (!lead) return null;
          return {
            leadId: lead.id,
            name: h.name ?? lead.fullName ?? "Unnamed lead",
            state: h.state ?? lead.state,
            score: typeof h.score === "number" ? h.score : lead.score,
            source: h.source ?? lead.source,
            note: h.note ?? "Review today",
          } satisfies DemoLeadDigestHighlight;
        })
        .filter((x): x is DemoLeadDigestHighlight => Boolean(x));
      return {
        headline: json.headline ?? `Daily lead digest — ${leads.length} leads`,
        summary: json.summary ?? content.slice(0, 1200),
        highlights: highlights.length ? highlights : fallbackHighlights(leads),
      };
    }
  } catch {
    // fall through
  }
  return {
    headline: `Daily lead digest — ${leads.length} leads`,
    summary: content.slice(0, 1200) || "Configured LLM returned an empty summary.",
    highlights: fallbackHighlights(leads),
  };
}

export type RunDailyLeadsDigestOptions = {
  tenantId?: string;
  now?: Date;
  /** Skip due-window / once-per-day checks */
  force?: boolean;
  triggeredBy?: DemoLeadDigest["triggeredBy"];
};

export type RunDailyLeadsDigestResult = {
  ran: boolean;
  skipped?: boolean;
  reason?: string;
  digest: DemoLeadDigest | null;
};

/**
 * Daily scheduled task: summarize pipeline leads with the configured LLM
 * (Grok by default) and persist a digest for the admin UI.
 */
export async function runDailyLeadsDigest(
  options: RunDailyLeadsDigestOptions = {},
): Promise<RunDailyLeadsDigestResult> {
  const now = options.now ?? new Date();
  const settings = getSettings();
  const schedule = settings.schedule;
  const timezone = schedule.timezone || "Asia/Dubai";
  const clock = getZonedClock(now, timezone);
  const triggeredBy = options.triggeredBy ?? "manual";

  if (!options.force) {
    const check = shouldRunDailyDigest(now);
    if (!check.due) {
      return { ran: false, skipped: true, reason: check.reason, digest: null };
    }
  }

  const store = getDemoStore();
  const tenantId = options.tenantId ?? "default";
  const leads = store.leads.filter((l) => l.tenantId === tenantId);
  const llmConfig = resolveLlmConfig(settings.llm);

  const system = `You are PropPilot's morning lead analyst for a Dubai brokerage.
Return ONLY compact JSON:
{
  "headline": string,
  "summary": string (2-4 sentences for brokers),
  "highlights": [{ "leadId": string, "name": string, "state": string, "score": number, "source": string, "note": string }]
}
Prioritize high scores and leads still in qualifying/matched states. Max 8 highlights.`;

  const user = `Timezone ${timezone}, local date ${clock.dateKey}, scheduled for ${schedule.timeLocal}.
Lead pipeline (${leads.length}):
${leads.map(leadLine).join("\n") || "(no leads)"}`;

  let digest: DemoLeadDigest;

  try {
    const client = createLlmClient();
    const result = await client.complete({
      tenantId,
      agentName: "daily-leads-digest",
      intentHint: "digest",
      correlationId: `digest-${clock.dateKey}`,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const parsed = parseHighlightsFromLlm(result.content, leads);
    digest = {
      id: newId(),
      tenantId,
      dateKey: clock.dateKey,
      timezone,
      timeLocal: schedule.timeLocal || "10:00",
      headline: parsed.headline,
      summary: parsed.summary,
      leadCount: leads.length,
      highlights: parsed.highlights,
      modelName: result.modelName,
      provider: llmConfig.provider,
      status: "ok",
      errorMessage: null,
      triggeredBy,
      createdAt: now.toISOString(),
    };
  } catch (err) {
    const highlights = fallbackHighlights(leads);
    digest = {
      id: newId(),
      tenantId,
      dateKey: clock.dateKey,
      timezone,
      timeLocal: schedule.timeLocal || "10:00",
      headline: `Lead digest unavailable — ${leads.length} leads listed`,
      summary: "LLM call failed; showing ranked leads without AI narrative.",
      leadCount: leads.length,
      highlights,
      modelName: llmConfig.model,
      provider: llmConfig.provider,
      status: "error",
      errorMessage: err instanceof Error ? err.message : "llm failed",
      triggeredBy,
      createdAt: now.toISOString(),
    };
  }

  store.leadDigests.unshift(digest);
  if (store.leadDigests.length > 60) {
    store.leadDigests.length = 60;
  }
  updateSettings({
    schedule: { ...schedule, lastRunDateKey: clock.dateKey },
  });

  return { ran: true, digest };
}

export function listLeadDigests(limit = 30): DemoLeadDigest[] {
  return getDemoStore()
    .leadDigests.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getLatestLeadDigest(): DemoLeadDigest | null {
  return listLeadDigests(1)[0] ?? null;
}
