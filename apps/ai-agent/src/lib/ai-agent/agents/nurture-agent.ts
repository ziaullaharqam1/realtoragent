import type { AgentContext, AgentResult, PropPilotAgent } from "./types";
import { emitN8nEvent } from "@/lib/ai-agent/n8n/bridge";

export class NurtureAgent implements PropPilotAgent {
  readonly name = "NurtureAgent";

  async run(ctx: AgentContext): Promise<AgentResult> {
    const completion = await ctx.llm.complete({
      tenantId: ctx.tenantId,
      agentName: this.name,
      conversationId: ctx.conversationId,
      leadId: ctx.leadId ?? undefined,
      correlationId: ctx.correlationId,
      intentHint: "nurture",
      messages: [
        {
          role: "system",
          content:
            "You are PropPilot NurtureAgent. Keep warm leads engaged with concise, factual follow-ups.",
        },
        { role: "user", content: ctx.userText },
      ],
    });

    if (ctx.leadId) {
      await ctx.gateways.leads.updateProfile(ctx.tenantId, ctx.leadId, {
        state: "nurturing",
      });
    }

    await emitN8nEvent({
      type: "lead.nurture",
      tenantId: ctx.tenantId,
      payload: {
        leadId: ctx.leadId,
        conversationId: ctx.conversationId,
        note: ctx.userText.slice(0, 240),
      },
    });

    return {
      agentName: this.name,
      ok: true,
      summary: "Nurture cadence noted",
      draftMessages: [
        {
          channel: ctx.channel,
          text:
            completion.content ||
            "Understood — PropPilot will keep you updated when new inventory matches your brief.",
        },
      ],
    };
  }
}
