import { getDemoStore } from "@/lib/ai-agent/demo/store";

export type MetricsSnapshot = {
  generatedAt: string;
  demoMode: boolean;
  counts: {
    leads: number;
    conversations: number;
    messages: number;
    viewings: number;
    presentations: number;
    approvalsPending: number;
    outboxPending: number;
    outboxFailed: number;
    nurturePending: number;
    nurtureSent: number;
    presentationViews: number;
    n8nEvents: number;
    audits: number;
    identities: number;
  };
  channels: Record<string, number>;
  leadStates: Record<string, number>;
};

function tally<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = keyFn(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export function collectMetrics(demoMode = true): MetricsSnapshot {
  const store = getDemoStore();
  return {
    generatedAt: new Date().toISOString(),
    demoMode,
    counts: {
      leads: store.leads.length,
      conversations: store.conversations.length,
      messages: store.messages.length,
      viewings: store.viewings.length,
      presentations: store.presentations.length,
      approvalsPending: store.approvals.filter((a) => a.status === "pending").length,
      outboxPending: store.outbox.filter((o) => o.status === "pending").length,
      outboxFailed: store.outbox.filter((o) => o.status === "failed").length,
      nurturePending: store.nurtureJobs.filter((j) => j.status === "pending").length,
      nurtureSent: store.nurtureJobs.filter((j) => j.status === "sent").length,
      presentationViews: store.presentationViews.length,
      n8nEvents: store.n8nEvents.length,
      audits: store.audits.length,
      identities: store.identities.length,
    },
    channels: tally(store.conversations, (c) => c.channel),
    leadStates: tally(store.leads, (l) => l.state),
  };
}
