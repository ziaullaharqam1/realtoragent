import { getDemoStore } from "@/lib/ai-agent/demo/store";

export type OutboxProcessResult = {
  processed: number;
  sent: number;
  failed: number;
  items: Array<{ id: string; status: string; detail?: string }>;
};

/**
 * Drain pending outbox items. Without live channel credentials, marks items sent
 * as demo deliveries after recording an attempt. With credentials, would call providers.
 */
export async function processOutbox(limit = 25): Promise<OutboxProcessResult> {
  const store = getDemoStore();
  const pending = store.outbox
    .filter((o) => o.status === "pending")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, limit);

  let sent = 0;
  let failed = 0;
  const items: OutboxProcessResult["items"] = [];

  for (const item of pending) {
    item.attempts = (item.attempts ?? 0) + 1;
    try {
      // Live providers would be invoked here when tokens exist.
      const hasWhatsApp = Boolean(process.env.WHATSAPP_ACCESS_TOKEN);
      const hasTelegram = Boolean(process.env.TELEGRAM_BOT_TOKEN);
      if (item.channel === "whatsapp" && !hasWhatsApp) {
        item.status = "sent";
        item.sentAt = new Date().toISOString();
        item.lastError = null;
        sent += 1;
        items.push({ id: item.id, status: "sent", detail: "demo delivery (no WA token)" });
        continue;
      }
      if (item.channel === "telegram" && !hasTelegram) {
        item.status = "sent";
        item.sentAt = new Date().toISOString();
        item.lastError = null;
        sent += 1;
        items.push({ id: item.id, status: "sent", detail: "demo delivery (no TG token)" });
        continue;
      }
      item.status = "sent";
      item.sentAt = new Date().toISOString();
      item.lastError = null;
      sent += 1;
      items.push({ id: item.id, status: "sent" });
    } catch (err) {
      item.lastError = err instanceof Error ? err.message : "outbox failed";
      if (item.attempts >= 5) {
        item.status = "failed";
        failed += 1;
      }
      items.push({ id: item.id, status: item.status, detail: item.lastError });
    }
  }

  return { processed: pending.length, sent, failed, items };
}
