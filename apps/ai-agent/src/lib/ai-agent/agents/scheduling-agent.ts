import type { AgentContext, AgentResult, PropPilotAgent } from "./types";
import { MAX_TOOL_LOOPS } from "./types";
import { DEMO_IDS } from "@/lib/ai-agent/demo/store";

export class SchedulingAgent implements PropPilotAgent {
  readonly name = "SchedulingAgent";

  async run(ctx: AgentContext): Promise<AgentResult> {
    let preferredAt = new Date();
    preferredAt.setDate(preferredAt.getDate() + 1);
    preferredAt.setHours(11, 0, 0, 0);
    let notes = ctx.userText.slice(0, 200);
    let propertyId: string = DEMO_IDS.propMarina;
    let loops = 0;

    while (loops < MAX_TOOL_LOOPS) {
      loops += 1;
      const completion = await ctx.llm.complete({
        tenantId: ctx.tenantId,
        agentName: this.name,
        conversationId: ctx.conversationId,
        leadId: ctx.leadId ?? undefined,
        correlationId: ctx.correlationId,
        intentHint: "scheduling",
        messages: [
          {
            role: "system",
            content:
              "You are PropPilot SchedulingAgent. Propose a viewing via ViewingGateway only.",
          },
          { role: "user", content: ctx.userText },
        ],
        tools: [{ name: "propose_viewing", description: "Propose viewing slot" }],
      });
      const tool = completion.toolCalls[0];
      if (tool?.name === "propose_viewing") {
        if (tool.arguments.preferredAt) {
          preferredAt = new Date(String(tool.arguments.preferredAt));
        }
        if (tool.arguments.notes) notes = String(tool.arguments.notes);
        if (tool.arguments.propertyId) propertyId = String(tool.arguments.propertyId);
        break;
      }
      break;
    }

    const brokers = await ctx.gateways.agents.listActive(ctx.tenantId);
    const broker = brokers[0];
    const leadId = ctx.leadId ?? DEMO_IDS.leadA;

    const viewing = await ctx.gateways.viewings.book(ctx.tenantId, {
      leadId,
      propertyId,
      brokerId: broker?.id,
      scheduledAt: preferredAt,
      notes,
    });

    const when = preferredAt.toLocaleString("en-AE", { timeZone: "Asia/Dubai" });
    const text = broker
      ? `Viewing booked for ${when} (Asia/Dubai) with ${broker.displayName}. Reference ${viewing.id.slice(0, 8)}. Reply if you need to reschedule.`
      : `Viewing requested for ${when}. A broker will confirm shortly. Reference ${viewing.id.slice(0, 8)}.`;

    return {
      agentName: this.name,
      ok: true,
      summary: `Viewing ${viewing.status}`,
      data: { viewingId: viewing.id, propertyId, brokerId: broker?.id ?? null },
      draftMessages: [{ channel: ctx.channel, text }],
    };
  }
}
