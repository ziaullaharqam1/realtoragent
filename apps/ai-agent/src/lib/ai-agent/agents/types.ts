import type { GatewayBundle } from "@/lib/ai-agent/gateways";
import type { LlmClient } from "@/lib/ai-agent/llm/client";
import type { ChannelKind } from "@/lib/ai-agent/channels/types";

export type AgentContext = {
  tenantId: string;
  leadId: string | null;
  conversationId: string;
  correlationId: string;
  channel: ChannelKind;
  userText: string;
  gateways: GatewayBundle;
  llm: LlmClient;
  shadowMode: boolean;
};

export type DraftMessage = {
  channel: ChannelKind;
  text: string;
  destination?: string;
};

export type AgentResult = {
  agentName: string;
  ok: boolean;
  summary: string;
  data?: Record<string, unknown>;
  draftMessages?: DraftMessage[];
  handoff?: boolean;
};

export const MAX_TOOL_LOOPS = 3;

export interface PropPilotAgent {
  readonly name: string;
  run(ctx: AgentContext): Promise<AgentResult>;
}
