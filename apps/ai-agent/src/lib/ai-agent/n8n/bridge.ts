import { createHmac, timingSafeEqual } from "node:crypto";
import { getDemoStore, newId, type DemoN8nEvent } from "@/lib/ai-agent/demo/store";

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
};

/** Stub command receiver for n8n → PropPilot callbacks. */
export function receiveN8nCommand(cmd: N8nCommand): N8nCommandResult {
  const known = ["refresh_embeddings", "sync_leads", "ping"];
  if (!known.includes(cmd.command)) {
    return {
      accepted: false,
      command: cmd.command,
      detail: `Unknown command. Supported: ${known.join(", ")}`,
    };
  }
  return {
    accepted: true,
    command: cmd.command,
    detail: `Command ${cmd.command} queued in demo bridge`,
  };
}

export function listN8nEvents(limit = 50): DemoN8nEvent[] {
  return getDemoStore()
    .n8nEvents.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
