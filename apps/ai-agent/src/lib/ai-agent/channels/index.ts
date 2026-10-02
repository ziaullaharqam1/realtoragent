import type { ChannelAdapter, ChannelKind } from "./types";
import { WebChannelAdapter } from "./web";
import { EmailChannelAdapter, TelegramChannelAdapter, WhatsAppChannelAdapter } from "./stubs";

const adapters: Record<ChannelKind, ChannelAdapter> = {
  web: new WebChannelAdapter(),
  whatsapp: new WhatsAppChannelAdapter(),
  telegram: new TelegramChannelAdapter(),
  email: new EmailChannelAdapter(),
};

export function getChannelAdapter(channel: ChannelKind): ChannelAdapter {
  return adapters[channel];
}

export * from "./types";
export * from "./web";
export * from "./stubs";
