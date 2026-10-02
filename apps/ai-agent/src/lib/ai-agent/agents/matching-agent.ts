import { hybridSearch } from "@/lib/ai-agent/search/hybrid";
import type { AgentContext, AgentResult, PropPilotAgent } from "./types";
import { MAX_TOOL_LOOPS } from "./types";

export class MatchingAgent implements PropPilotAgent {
  readonly name = "MatchingAgent";

  async run(ctx: AgentContext): Promise<AgentResult> {
    let loops = 0;
    let filters: Record<string, unknown> = { query: ctx.userText };
    let hits = await hybridSearch(ctx.tenantId, {
      query: ctx.userText,
      city: "Dubai",
      limit: 5,
    });

    while (loops < MAX_TOOL_LOOPS) {
      loops += 1;
      const completion = await ctx.llm.complete({
        tenantId: ctx.tenantId,
        agentName: this.name,
        conversationId: ctx.conversationId,
        leadId: ctx.leadId ?? undefined,
        correlationId: ctx.correlationId,
        intentHint: "matching",
        messages: [
          {
            role: "system",
            content:
              "You are PropPilot MatchingAgent. Call search_properties with city/bedrooms/budget filters. Only use gateway facts.",
          },
          { role: "user", content: ctx.userText },
          {
            role: "assistant",
            content: `Current shortlist size: ${hits.length}`,
          },
        ],
        tools: [
          {
            name: "search_properties",
            description: "Search listings via PropertyGateway + hybrid embeddings",
          },
        ],
      });

      const tool = completion.toolCalls[0];
      if (!tool || tool.name !== "search_properties") break;
      filters = tool.arguments;
      hits = await hybridSearch(ctx.tenantId, {
        query: String(tool.arguments.query ?? ctx.userText),
        city: tool.arguments.city ? String(tool.arguments.city) : "Dubai",
        minBedrooms:
          tool.arguments.minBedrooms != null ? Number(tool.arguments.minBedrooms) : undefined,
        maxPrice: tool.arguments.maxPrice != null ? Number(tool.arguments.maxPrice) : undefined,
        propertyType: tool.arguments.propertyType
          ? String(tool.arguments.propertyType)
          : undefined,
        limit: 5,
      });
      if (hits.length > 0) break;
    }

    const lines =
      hits.length === 0
        ? ["No active listings matched those filters. Try a wider budget or another community."]
        : hits.map(
            (h, i) =>
              `${i + 1}. ${h.title} — ${h.priceCurrency} ${Number(h.priceAmount ?? 0).toLocaleString("en-AE")} (${h.district ?? h.city}, score ${(h.score * 100).toFixed(0)}%)`,
          );

    const text = `Here is a PropPilot shortlist:\n${lines.join("\n")}\nAsk me to book a viewing or build a presentation for any listing.`;

    return {
      agentName: this.name,
      ok: true,
      summary: `Matched ${hits.length} properties`,
      data: { filters, propertyIds: hits.map((h) => h.id), hits },
      draftMessages: [{ channel: ctx.channel, text }],
    };
  }
}
