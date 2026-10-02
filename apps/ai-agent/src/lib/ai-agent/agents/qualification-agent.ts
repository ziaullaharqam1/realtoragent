import { parseQualification, type LlmClient } from "@/lib/ai-agent/llm/client";
import type { AgentContext, AgentResult, PropPilotAgent } from "./types";

export class QualificationAgent implements PropPilotAgent {
  readonly name = "QualificationAgent";

  constructor(private readonly llm?: LlmClient) {}

  async run(ctx: AgentContext): Promise<AgentResult> {
    const llm = this.llm ?? ctx.llm;
    const completion = await llm.complete({
      tenantId: ctx.tenantId,
      agentName: this.name,
      conversationId: ctx.conversationId,
      leadId: ctx.leadId ?? undefined,
      correlationId: ctx.correlationId,
      intentHint: "qualification",
      messages: [
        {
          role: "system",
          content:
            "You are PropPilot QualificationAgent. Extract budget, bedrooms, area, timeline, and buyer type as JSON.",
        },
        { role: "user", content: ctx.userText },
      ],
    });

    let parsed = parseQualification(ctx.userText);
    try {
      const json = JSON.parse(completion.content) as Partial<typeof parsed>;
      parsed = { ...parsed, ...json, score: Number(json.score ?? parsed.score) };
    } catch {
      // keep heuristic parse
    }

    if (ctx.leadId) {
      await ctx.gateways.leads.updateProfile(ctx.tenantId, ctx.leadId, {
        state: "qualified",
        score: parsed.score,
        scoreBreakdown: {
          budget: parsed.budgetMaxAed,
          bedrooms: parsed.bedrooms,
          district: parsed.district,
          timeline: parsed.timeline,
          buyerType: parsed.buyerType,
        },
      });
    }

    const reply =
      parsed.score >= 50
        ? `${parsed.summary} I can match listings next — or book a viewing if you already have a property in mind.`
        : `${parsed.summary} Share your budget (AED), preferred community, and bedroom count so I can score this lead more accurately.`;

    return {
      agentName: this.name,
      ok: true,
      summary: parsed.summary,
      data: parsed as unknown as Record<string, unknown>,
      draftMessages: [{ channel: ctx.channel, text: reply }],
    };
  }
}
