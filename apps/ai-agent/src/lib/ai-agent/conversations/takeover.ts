import { getDemoStore } from "@/lib/ai-agent/demo/store";

export function takeoverConversation(input: {
  tenantId: string;
  conversationId: string;
  brokerId: string;
}): { ok: true } | { ok: false; error: string } {
  const store = getDemoStore();
  const conversation = store.conversations.find(
    (c) => c.id === input.conversationId && c.tenantId === input.tenantId,
  );
  if (!conversation) return { ok: false, error: "conversation not found" };
  const broker = store.brokers.find(
    (b) => b.id === input.brokerId && b.tenantId === input.tenantId && b.active,
  );
  if (!broker) return { ok: false, error: "broker not found" };
  conversation.owner = "human";
  conversation.assignedBrokerId = input.brokerId;
  conversation.status = "human_takeover";
  conversation.updatedAt = new Date().toISOString();
  store.messages.push({
    id: crypto.randomUUID(),
    conversationId: conversation.id,
    tenantId: input.tenantId,
    role: "system",
    content: `Broker ${broker.displayName} took over this conversation.`,
    metadata: { event: "takeover", brokerId: input.brokerId },
    createdAt: new Date().toISOString(),
  });
  return { ok: true };
}

export function releaseConversation(input: {
  tenantId: string;
  conversationId: string;
}): { ok: true } | { ok: false; error: string } {
  const store = getDemoStore();
  const conversation = store.conversations.find(
    (c) => c.id === input.conversationId && c.tenantId === input.tenantId,
  );
  if (!conversation) return { ok: false, error: "conversation not found" };
  conversation.owner = "ai";
  conversation.status = "open";
  conversation.updatedAt = new Date().toISOString();
  store.messages.push({
    id: crypto.randomUUID(),
    conversationId: conversation.id,
    tenantId: input.tenantId,
    role: "system",
    content: "Conversation released back to PropPilot AI.",
    metadata: { event: "release" },
    createdAt: new Date().toISOString(),
  });
  return { ok: true };
}
