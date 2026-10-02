export type ChannelKind = "web" | "whatsapp" | "telegram" | "email";

export type NormalizedInboundMessage = {
  channel: ChannelKind;
  tenantId: string;
  externalUserId: string;
  text: string;
  leadId?: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
};

export type OutboundMessage = {
  channel: ChannelKind;
  tenantId: string;
  destination: string;
  text: string;
  metadata?: Record<string, unknown>;
};

export type ChannelSendResult = {
  ok: boolean;
  providerMessageId?: string;
  stub?: boolean;
  detail?: string;
};

export interface ChannelAdapter {
  readonly channel: ChannelKind;
  normalizeInbound(raw: unknown, tenantId: string): NormalizedInboundMessage;
  send(message: OutboundMessage): Promise<ChannelSendResult>;
}
