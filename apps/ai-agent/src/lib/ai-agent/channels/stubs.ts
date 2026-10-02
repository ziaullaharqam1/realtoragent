import type {
  ChannelAdapter,
  ChannelSendResult,
  NormalizedInboundMessage,
  OutboundMessage,
} from "./types";
import { getDemoStore, newId } from "@/lib/ai-agent/demo/store";

export class WhatsAppChannelAdapter implements ChannelAdapter {
  readonly channel = "whatsapp" as const;

  normalizeInbound(raw: unknown, tenantId: string): NormalizedInboundMessage {
    const body = (raw ?? {}) as Record<string, unknown>;
    const entry = Array.isArray(body.entry) ? (body.entry[0] as Record<string, unknown>) : body;
    const changes = Array.isArray(entry?.changes)
      ? (entry.changes[0] as Record<string, unknown>)
      : entry;
    const value = (changes?.value ?? changes) as Record<string, unknown>;
    const messages = Array.isArray(value?.messages)
      ? (value.messages[0] as Record<string, unknown>)
      : value;
    const textObj = (messages?.text ?? {}) as Record<string, unknown>;
    return {
      channel: "whatsapp",
      tenantId,
      externalUserId: String(messages?.from ?? body.from ?? "whatsapp-unknown"),
      text: String(textObj.body ?? body.text ?? ""),
      metadata: { stub: true, rawType: "whatsapp_cloud" },
    };
  }

  async send(message: OutboundMessage): Promise<ChannelSendResult> {
    const id = newId();
    getDemoStore().outbox.push({
      id,
      tenantId: message.tenantId,
      channel: "whatsapp",
      destination: message.destination,
      payload: { text: message.text, stub: true },
      status: "pending",
      createdAt: new Date().toISOString(),
      sentAt: null,
    });
    return {
      ok: true,
      providerMessageId: id,
      stub: true,
      detail: "WhatsApp send stub — configure WhatsApp Cloud API credentials to go live",
    };
  }
}

export class TelegramChannelAdapter implements ChannelAdapter {
  readonly channel = "telegram" as const;

  normalizeInbound(raw: unknown, tenantId: string): NormalizedInboundMessage {
    const body = (raw ?? {}) as Record<string, unknown>;
    const message = (body.message ?? body) as Record<string, unknown>;
    const from = (message.from ?? {}) as Record<string, unknown>;
    const chat = (message.chat ?? {}) as Record<string, unknown>;
    return {
      channel: "telegram",
      tenantId,
      externalUserId: String(from.id ?? chat.id ?? "telegram-unknown"),
      text: String(message.text ?? body.text ?? ""),
      metadata: { stub: true },
    };
  }

  async send(message: OutboundMessage): Promise<ChannelSendResult> {
    const id = newId();
    getDemoStore().outbox.push({
      id,
      tenantId: message.tenantId,
      channel: "telegram",
      destination: message.destination,
      payload: { text: message.text, stub: true },
      status: "pending",
      createdAt: new Date().toISOString(),
      sentAt: null,
    });
    return {
      ok: true,
      providerMessageId: id,
      stub: true,
      detail: "Telegram send stub — set TELEGRAM_BOT_TOKEN to enable delivery",
    };
  }
}

export class EmailChannelAdapter implements ChannelAdapter {
  readonly channel = "email" as const;

  normalizeInbound(raw: unknown, tenantId: string): NormalizedInboundMessage {
    const body = (raw ?? {}) as Record<string, unknown>;
    return {
      channel: "email",
      tenantId,
      externalUserId: String(body.from ?? body.email ?? "email-unknown"),
      text: String(body.text ?? body.body ?? body.subject ?? ""),
      metadata: { stub: true, subject: body.subject },
    };
  }

  async send(message: OutboundMessage): Promise<ChannelSendResult> {
    const id = newId();
    getDemoStore().outbox.push({
      id,
      tenantId: message.tenantId,
      channel: "email",
      destination: message.destination,
      payload: { text: message.text, stub: true },
      status: "pending",
      createdAt: new Date().toISOString(),
      sentAt: null,
    });
    return {
      ok: true,
      providerMessageId: id,
      stub: true,
      detail: "Email send stub — wire SMTP or provider later",
    };
  }
}
