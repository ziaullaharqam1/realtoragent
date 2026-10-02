import { createHmac, timingSafeEqual } from "node:crypto";
import { getDemoStore, newId, type DemoN8nEvent } from "@/lib/ai-agent/demo/store";
import { embeddingService } from "@/lib/ai-agent/embeddings/service";
import { processOutbox } from "@/lib/ai-agent/outbox/processor";
import { processDueNurtureJobs, scheduleNurtureJob } from "@/lib/ai-agent/nurture/cadence";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export type N8nOutboundEvent = {
  type: string;
  tenantId: string;
  payload: Record<string, unknown>;
};

export function signPayload(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifySignature(body: string, signature: string | null, secret?: string): boolean {
  if (!secret) return true; // HMAC optional
  if (!signature) return false;
  const expected = signPayload(body, secret);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Stub emitter: records event locally; optionally POSTs to N8N_WEBHOOK_URL. */
export async function emitN8nEvent(event: N8nOutboundEvent): Promise<DemoN8nEvent> {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const body = JSON.stringify(event);
  const signature = secret ? signPayload(body, secret) : null;
  const row: DemoN8nEvent = {
    id: newId(),
    type: event.type,
    payload: event.payload,
    signature,
    createdAt: new Date().toISOString(),
  };
  getDemoStore().n8nEvents.push(row);

  const url = process.env.N8N_WEBHOOK_URL;
  if (url) {
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(signature ? { "X-PropPilot-Signature": signature } : {}),
        },
        body,
      });
    } catch {
      // stub — local record is enough
    }
  }
  return row;
}

export type N8nCommand = {
  command: string;
  tenantId?: string;
  payload?: Record<string, unknown>;
};

export type N8nCommandResult = {
  accepted: boolean;
  command: string;
  detail: string;
  result?: Record<string, unknown>;
};

export const N8N_COMMANDS = [
  "refresh_embeddings",
  "sync_leads",
  "drain_outbox",
  "run_nurture",
  "schedule_nurture",
  "ping",
] as const;

/** Execute n8n → PropPilot commands against demo/local services. */
export async function executeN8nCommand(cmd: N8nCommand): Promise<N8nCommandResult> {
  const tenantId = cmd.tenantId ?? defaultTenantId();
  if (!N8N_COMMANDS.includes(cmd.command as (typeof N8N_COMMANDS)[number])) {
    return {
      accepted: false,
      command: cmd.command,
      detail: `Unknown command. Supported: ${N8N_COMMANDS.join(", ")}`,
    };
  }

  if (cmd.command === "ping") {
    return { accepted: true, command: cmd.command, detail: "pong", result: { ok: true } };
  }

  if (cmd.command === "refresh_embeddings") {
    const out = await embeddingService.refreshPropertyEmbeddings(tenantId);
    return {
      accepted: true,
      command: cmd.command,
      detail: `Refreshed ${out.refreshed} embeddings`,
      result: { refreshed: out.refreshed },
    };
  }

  if (cmd.command === "sync_leads") {
    const leads = getDemoStore().leads.filter((l) => l.tenantId === tenantId);
    await emitN8nEvent({
      type: "leads.synced",
      tenantId,
      payload: { count: leads.length, leadIds: leads.map((l) => l.id) },
    });
    return {
      accepted: true,
      command: cmd.command,
      detail: `Synced ${leads.length} leads to event bus`,
      result: { count: leads.length },
    };
  }

  if (cmd.command === "drain_outbox") {
    const out = await processOutbox();
    return {
      accepted: true,
      command: cmd.command,
      detail: `Outbox drain sent=${out.sent} failed=${out.failed}`,
      result: out as unknown as Record<string, unknown>,
    };
  }

  if (cmd.command === "run_nurture") {
    const out = await processDueNurtureJobs();
    return {
      accepted: true,
      command: cmd.command,
      detail: `Nurture processed=${out.processed} sent=${out.sent}`,
      result: out as unknown as Record<string, unknown>,
    };
  }

  if (cmd.command === "schedule_nurture") {
    const leadId = String(cmd.payload?.leadId ?? "");
    if (!leadId) {
      return { accepted: false, command: cmd.command, detail: "leadId required in payload" };
    }
    const job = scheduleNurtureJob({
      tenantId,
      leadId,
      channel: cmd.payload?.channel ? String(cmd.payload.channel) : "web",
      delayMinutes: cmd.payload?.delayMinutes
        ? Number(cmd.payload.delayMinutes)
        : 0,
      template: cmd.payload?.template ? String(cmd.payload.template) : undefined,
    });
    return {
      accepted: true,
      command: cmd.command,
      detail: `Scheduled nurture ${job.id}`,
      result: { jobId: job.id, dueAt: job.dueAt },
    };
  }

  return { accepted: false, command: cmd.command, detail: "Unhandled command" };
}

/** @deprecated use executeN8nCommand — kept for sync accept checks */
export function receiveN8nCommand(cmd: N8nCommand): N8nCommandResult {
  if (!N8N_COMMANDS.includes(cmd.command as (typeof N8N_COMMANDS)[number])) {
    return {
      accepted: false,
      command: cmd.command,
      detail: `Unknown command. Supported: ${N8N_COMMANDS.join(", ")}`,
    };
  }
  return {
    accepted: true,
    command: cmd.command,
    detail: `Command ${cmd.command} accepted`,
  };
}

export function listN8nEvents(limit = 50): DemoN8nEvent[] {
  return getDemoStore()
    .n8nEvents.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
