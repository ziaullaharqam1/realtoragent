import type { AgentContext, AgentResult, PropPilotAgent } from "./types";
import { MAX_TOOL_LOOPS } from "./types";
import { emitN8nEvent } from "@/lib/ai-agent/n8n/bridge";

export class HandoffAgent implements PropPilotAgent {
  readonly name = "HandoffAgent";

  async run(ctx: AgentContext): Promise<AgentResult> {
    let loops = 0;
    while (loops < MAX_TOOL_LOOPS) {
      loops += 1;
      const completion = await ctx.llm.complete({
        tenantId: ctx.tenantId,
        agentName: this.name,
        conversationId: ctx.conversationId,
        leadId: ctx.leadId ?? undefined,
        correlationId: ctx.correlationId,
        intentHint: "handoff",
        messages: [
          {
            role: "system",
            content: "You are PropPilot HandoffAgent. Assign an active broker via AgentDirectory.",
          },
          { role: "user", content: ctx.userText },
        ],
        tools: [{ name: "assign_broker", description: "Assign lead to broker" }],
      });
      if (completion.toolCalls[0]?.name === "assign_broker") break;
      break;
    }

    const brokers = await ctx.gateways.agents.listActive(ctx.tenantId);
    const broker = brokers[0];
    if (!broker) {
      return {
        agentName: this.name,
        ok: false,
        summary: "No active brokers",
        draftMessages: [
          {
            channel: ctx.channel,
            text: "No active brokers are available right now. Leave your preferred contact window and we will follow up.",
          },
        ],
      };
    }

    if (ctx.leadId) {
      await ctx.gateways.agents.assignLead(ctx.tenantId, ctx.leadId, broker.id);
      await ctx.gateways.leads.updateProfile(ctx.tenantId, ctx.leadId, {
        state: "handed_off",
        assignedBrokerId: broker.id,
      });
    }

    await emitN8nEvent({
      type: "lead.handoff",
      tenantId: ctx.tenantId,
      payload: {
        leadId: ctx.leadId,
        brokerId: broker.id,
        conversationId: ctx.conversationId,
      },
    });

    return {
      agentName: this.name,
      ok: true,
      summary: `Handed off to ${broker.displayName}`,
      data: { brokerId: broker.id },
      handoff: true,
      draftMessages: [
        {
          channel: ctx.channel,
          text: `You are connected with ${broker.displayName}. They have your conversation context and will continue from here.`,
        },
      ],
    };
  }
}
