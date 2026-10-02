import { getDemoStore, newId, type DemoNurtureJob } from "@/lib/ai-agent/demo/store";
import { getChannelAdapter } from "@/lib/ai-agent/channels";

export type ScheduleNurtureInput = {
  tenantId: string;
  leadId: string;
  channel?: string;
  destination?: string;
  delayMinutes?: number;
  template?: string;
};

const DEFAULT_TEMPLATE =
  "Quick check-in from PropPilot — new inventory may match your brief. Reply anytime to resume the search.";

export function scheduleNurtureJob(input: ScheduleNurtureInput): DemoNurtureJob {
  const delay = input.delayMinutes ?? 60;
  const dueAt = new Date(Date.now() + delay * 60_000).toISOString();
  const job: DemoNurtureJob = {
    id: newId(),
    tenantId: input.tenantId,
    leadId: input.leadId,
    channel: input.channel ?? "web",
    destination: input.destination ?? input.leadId,
    template: input.template ?? DEFAULT_TEMPLATE,
    status: "pending",
    dueAt,
    createdAt: new Date().toISOString(),
    sentAt: null,
    lastError: null,
  };
  getDemoStore().nurtureJobs.push(job);
  return job;
}

export async function processDueNurtureJobs(now = new Date()): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const store = getDemoStore();
  const due = store.nurtureJobs.filter(
    (j) => j.status === "pending" && new Date(j.dueAt).getTime() <= now.getTime(),
  );
  let sent = 0;
  let failed = 0;

  for (const job of due) {
    const lead = store.leads.find((l) => l.id === job.leadId);
    if (lead && !lead.consentMarketing) {
      job.status = "skipped";
      job.lastError = "marketing consent not granted";
      failed += 1;
      continue;
    }
    try {
      const channel = job.channel as "web" | "whatsapp" | "telegram" | "email";
      const adapter = getChannelAdapter(channel);
      await adapter.send({
        channel,
        tenantId: job.tenantId,
        destination: job.destination,
        text: job.template,
      });
      job.status = "sent";
      job.sentAt = new Date().toISOString();
      sent += 1;
    } catch (err) {
      job.status = "failed";
      job.lastError = err instanceof Error ? err.message : "send failed";
      failed += 1;
    }
  }

  return { processed: due.length, sent, failed };
}

export function listNurtureJobs(limit = 50): DemoNurtureJob[] {
  return getDemoStore()
    .nurtureJobs.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
