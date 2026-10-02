import { randomUUID } from "node:crypto";
import { gateAiAgent } from "@/lib/ai-agent/boundary";
import { createGateways } from "@/lib/ai-agent/gateways";
import { createLlmClient } from "@/lib/ai-agent/llm/client";
import { getDemoStore, newId, DEMO_IDS } from "@/lib/ai-agent/demo/store";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { createShadowApproval } from "@/lib/ai-agent/shadow/approvals";
import { getChannelAdapter, type ChannelKind } from "@/lib/ai-agent/channels";
import {
  QualificationAgent,
  MatchingAgent,
  SchedulingAgent,
  PresentationAgent,
  HandoffAgent,
  NurtureAgent,
  type AgentResult,
  type PropPilotAgent,
} from "@/lib/ai-agent/agents";
import { DemoLeadGateway } from "@/lib/ai-agent/gateways/demo/demo-lead-gateway";
import { linkChannelIdentity, resolveLeadByIdentity } from "@/lib/ai-agent/channels/identity";
import { hasConsent } from "@/lib/ai-agent/consent/service";

export type InboundProcessInput = {
  tenantId?: string;
  channel?: ChannelKind;
  text: string;
  conversationId?: string;
  leadId?: string;
  externalUserId?: string;
  correlationId?: string;
};

export type InboundProcessResult = {
  allowed: boolean;
  shadowMode: boolean;
  reason?: string;
  conversationId: string;
  leadId: string | null;
  agentName?: string;
  replyText: string | null;
  approvalId?: string;
  outboxId?: string;
  agentResult?: AgentResult;
};

function routeAgent(text: string): PropPilotAgent {
  const lower = text.toLowerCase();
  if (
    lower.includes("viewing") ||
    lower.includes("tour") ||
    lower.includes("schedule") ||
    lower.includes("book")
  ) {
    return new SchedulingAgent();
  }
  if (lower.includes("presentation") || lower.includes("brochure") || lower.includes("deck")) {
    return new PresentationAgent();
  }
  if (
    lower.includes("broker") ||
    lower.includes("human") ||
    lower.includes("handoff") ||
    lower.includes("speak to")
  ) {
    return new HandoffAgent();
  }
  if (
    lower.includes("later") ||
    lower.includes("keep me") ||
    lower.includes("update me") ||
    lower.includes("nurture")
  ) {
    return new NurtureAgent();
  }
  if (
    lower.includes("match") ||
    lower.includes("show me") ||
    lower.includes("search") ||
    lower.includes("listing") ||
    lower.includes("apartment") ||
    lower.includes("villa") ||
    lower.includes("townhouse") ||
    lower.includes("marina") ||
    lower.includes("jlt")
  ) {
    return new MatchingAgent();
  }
  if (
    lower.includes("budget") ||
    lower.includes("looking for") ||
    lower.includes("qualify") ||
    lower.includes("bedroom") ||
    lower.includes("br ")
  ) {
    return new QualificationAgent();
  }
  return new QualificationAgent();
}

function ensureConversation(
  tenantId: string,
  channel: ChannelKind,
  conversationId?: string,
  leadId?: string | null,
) {
  const store = getDemoStore();
  if (conversationId) {
    const existing = store.conversations.find(
      (c) => c.id === conversationId && c.tenantId === tenantId,
    );
    if (existing) return existing;
  }
  const row = {
    id: conversationId ?? newId(),
    tenantId,
    leadId: leadId ?? DEMO_IDS.leadA,
    channel,
    status: "open",
    owner: "ai" as const,
    assignedBrokerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.conversations.push(row);
  return row;
}

/**
 * Core inbound path: gate → route agent → shadow approval or outbox send.
 */
export async function processInboundMessage(
  input: InboundProcessInput,
): Promise<InboundProcessResult> {
  const tenantId = input.tenantId ?? defaultTenantId();
  const channel: ChannelKind = input.channel ?? "web";
  const correlationId = input.correlationId ?? randomUUID();
  const text = (input.text ?? "").trim();

  const gate = await gateAiAgent({
    tenantId,
    channel,
  });

  let leadId = input.leadId ?? null;
  if (!leadId && input.externalUserId) {
    leadId = resolveLeadByIdentity(tenantId, channel, input.externalUserId);
  }
  if (!leadId && channel === "web") {
    leadId = DEMO_IDS.leadA;
  }

  // Auto-create lead from webhook style sources when missing
  if (!leadId && text) {
    const demoLeads = new DemoLeadGateway();
    const created = demoLeads.create(tenantId, {
      source: channel === "web" ? "web_chat" : channel,
      fullName: input.externalUserId ?? null,
      consentAi: true,
      state: "new",
    });
    leadId = created.id;
  }

  if (leadId && input.externalUserId) {
    linkChannelIdentity({
      tenantId,
      leadId,
      channel,
      externalUserId: input.externalUserId,
      verified: channel === "web",
    });
  }

  const conversation = ensureConversation(tenantId, channel, input.conversationId, leadId);

  // Human takeover: do not run AI agents
  if (conversation.owner === "human") {
    const store = getDemoStore();
    if (text) {
      store.messages.push({
        id: newId(),
        conversationId: conversation.id,
        tenantId,
        role: "user",
        content: text,
        metadata: { channel, correlationId, owner: "human" },
        createdAt: new Date().toISOString(),
      });
      conversation.updatedAt = new Date().toISOString();
    }
    return {
      allowed: false,
      shadowMode: gate.shadowMode,
      reason: "conversation owned by human broker (takeover active)",
      conversationId: conversation.id,
      leadId,
      replyText:
        "A broker has taken over this conversation. PropPilot AI is paused here until release.",
    };
  }

  if (leadId && !hasConsent(tenantId, leadId, "ai") && channel !== "web") {
    return {
      allowed: false,
      shadowMode: gate.shadowMode,
      reason: "AI consent not granted for this lead",
      conversationId: conversation.id,
      leadId,
      replyText: "Please confirm AI assistance consent before we continue on this channel.",
    };
  }

  if (!text) {
    return {
      allowed: gate.allowed,
      shadowMode: gate.shadowMode,
      reason: "empty message",
      conversationId: conversation.id,
      leadId,
      replyText: "Send a message about budget, community, or viewings to get started.",
    };
  }

  const store = getDemoStore();
  store.messages.push({
    id: newId(),
    conversationId: conversation.id,
    tenantId,
    role: "user",
    content: text,
    metadata: { channel, correlationId },
    createdAt: new Date().toISOString(),
  });
  conversation.updatedAt = new Date().toISOString();

  if (!gate.allowed) {
    const reply =
      gate.reason ??
      "PropPilot AI is currently paused. A broker will follow up on your enquiry.";
    store.messages.push({
      id: newId(),
      conversationId: conversation.id,
      tenantId,
      role: "assistant",
      content: reply,
      metadata: { gated: true },
      createdAt: new Date().toISOString(),
    });
    return {
      allowed: false,
      shadowMode: gate.shadowMode,
      reason: gate.reason,
      conversationId: conversation.id,
      leadId,
      replyText: reply,
    };
  }

  const gateways = createGateways();
  const llm = createLlmClient();
  const agent = routeAgent(text);
  const agentResult = await agent.run({
    tenantId,
    leadId,
    conversationId: conversation.id,
    correlationId,
    channel,
    userText: text,
    gateways,
    llm,
    shadowMode: gate.shadowMode,
  });

  const draft = agentResult.draftMessages?.[0];
  const replyText = draft?.text ?? agentResult.summary;

  store.messages.push({
    id: newId(),
    conversationId: conversation.id,
    tenantId,
    role: "assistant",
    content: replyText,
    metadata: {
      agentName: agentResult.agentName,
      shadowMode: gate.shadowMode,
    },
    createdAt: new Date().toISOString(),
  });

  if (gate.shadowMode) {
    const approval = createShadowApproval({
      tenantId,
      conversationId: conversation.id,
      leadId,
      channel,
      draftPayload: {
        text: replyText,
        agentName: agentResult.agentName,
        data: agentResult.data ?? {},
      },
    });
    return {
      allowed: true,
      shadowMode: true,
      conversationId: conversation.id,
      leadId,
      agentName: agentResult.agentName,
      replyText,
      approvalId: approval.id,
      agentResult,
      reason: "shadow mode — draft stored for approval instead of channel send",
    };
  }

  const adapter = getChannelAdapter(channel);
  const send = await adapter.send({
    channel,
    tenantId,
    destination: input.externalUserId ?? leadId ?? "web",
    text: replyText,
    metadata: { conversationId: conversation.id, agentName: agentResult.agentName },
  });

  return {
    allowed: true,
    shadowMode: false,
    conversationId: conversation.id,
    leadId,
    agentName: agentResult.agentName,
    replyText,
    outboxId: send.providerMessageId,
    agentResult,
  };
}
