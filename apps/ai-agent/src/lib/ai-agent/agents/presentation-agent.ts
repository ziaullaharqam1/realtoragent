import { buildPresentationSpec } from "@/lib/ai-agent/presentations/spec";
import { hybridSearch } from "@/lib/ai-agent/search/hybrid";
import { getDemoStore, newId } from "@/lib/ai-agent/demo/store";
import type { AgentContext, AgentResult, PropPilotAgent } from "./types";
import { MAX_TOOL_LOOPS } from "./types";

export class PresentationAgent implements PropPilotAgent {
  readonly name = "PresentationAgent";

  async run(ctx: AgentContext): Promise<AgentResult> {
    let propertyId: string | null = null;
    let loops = 0;

    while (loops < MAX_TOOL_LOOPS) {
      loops += 1;
      const completion = await ctx.llm.complete({
        tenantId: ctx.tenantId,
        agentName: this.name,
        conversationId: ctx.conversationId,
        leadId: ctx.leadId ?? undefined,
        correlationId: ctx.correlationId,
        intentHint: "presentation",
        messages: [
          {
            role: "system",
            content:
              "You are PropPilot PresentationAgent. Build decks from PropertyGateway facts only.",
          },
          { role: "user", content: ctx.userText },
        ],
        tools: [{ name: "build_presentation", description: "Select property and build spec" }],
      });
      const tool = completion.toolCalls[0];
      if (tool?.arguments?.propertyId) {
        propertyId = String(tool.arguments.propertyId);
        break;
      }
      break;
    }

    if (!propertyId) {
      const hits = await hybridSearch(ctx.tenantId, { query: ctx.userText, city: "Dubai", limit: 1 });
      propertyId = hits[0]?.id ?? null;
    }

    if (!propertyId) {
      return {
        agentName: this.name,
        ok: false,
        summary: "No property found for presentation",
        draftMessages: [
          {
            channel: ctx.channel,
            text: "I could not find a listing to present. Share a community or listing name first.",
          },
        ],
      };
    }

    const property = await ctx.gateways.properties.getById(ctx.tenantId, propertyId);
    if (!property) {
      return {
        agentName: this.name,
        ok: false,
        summary: "Property missing",
        draftMessages: [
          { channel: ctx.channel, text: "That listing is no longer available in PropPilot inventory." },
        ],
      };
    }

    const spec = buildPresentationSpec(property);
    const id = newId();
    spec.id = id;
    getDemoStore().presentations.push({
      id,
      tenantId: ctx.tenantId,
      leadId: ctx.leadId,
      title: spec.title,
      spec: spec as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString(),
    });

    return {
      agentName: this.name,
      ok: true,
      summary: `Presentation ${id}`,
      data: { presentationId: id, propertyId },
      draftMessages: [
        {
          channel: ctx.channel,
          text: `Presentation ready for ${property.title}. Open /presentations/${id} to review the fact-based deck.`,
        },
      ],
    };
  }
}
