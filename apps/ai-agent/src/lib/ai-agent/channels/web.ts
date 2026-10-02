import type {
  ChannelAdapter,
  ChannelSendResult,
  NormalizedInboundMessage,
  OutboundMessage,
} from "./types";
import { getDemoStore, newId } from "@/lib/ai-agent/demo/store";

export class WebChannelAdapter implements ChannelAdapter {
  readonly channel = "web" as const;

  normalizeInbound(raw: unknown, tenantId: string): NormalizedInboundMessage {
    const body = (raw ?? {}) as Record<string, unknown>;
    const text = String(body.text ?? body.message ?? "");
    return {
      channel: "web",
      tenantId,
      externalUserId: String(body.externalUserId ?? body.sessionId ?? "web-user"),
      text,
      leadId: body.leadId ? String(body.leadId) : undefined,
      conversationId: body.conversationId ? String(body.conversationId) : undefined,
      metadata: (body.metadata as Record<string, unknown>) ?? undefined,
    };
  }

  async send(message: OutboundMessage): Promise<ChannelSendResult> {
    const id = newId();
    getDemoStore().outbox.push({
      id,
      tenantId: message.tenantId,
      channel: message.channel,
      destination: message.destination,
      payload: { text: message.text, ...(message.metadata ?? {}) },
      status: "sent",
      attempts: 1,
      lastError: null,
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    });
    return { ok: true, providerMessageId: id, stub: false };
  }
}
