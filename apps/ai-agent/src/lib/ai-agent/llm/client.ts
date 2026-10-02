import { toolCallAuditService } from "@/lib/ai-agent/audit/service";
import { maskPiiDeep } from "@/lib/ai-agent/audit/pii";
import { getSettings } from "@/lib/ai-agent/config/settings";
import { resolveLlmConfig } from "@/lib/ai-agent/llm/providers";

export type LlmMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
};

export type LlmToolDef = {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
};

export type LlmToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type LlmCompletionRequest = {
  tenantId: string;
  agentName: string;
  messages: LlmMessage[];
  tools?: LlmToolDef[];
  correlationId?: string;
  conversationId?: string;
  leadId?: string;
  /** Hint for mock routing: qualification | matching | scheduling | presentation | handoff | nurture | general */
  intentHint?: string;
};

export type LlmCompletionResult = {
  content: string;
  toolCalls: LlmToolCall[];
  modelName: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  raw?: unknown;
};

export interface LlmClient {
  complete(req: LlmCompletionRequest): Promise<LlmCompletionResult>;
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Deterministic mock LLM for demo / tests.
 * Parses buyer signals from user text and emits structured JSON or tool calls.
 */
export class MockLlmClient implements LlmClient {
  async complete(req: LlmCompletionRequest): Promise<LlmCompletionResult> {
    const started = Date.now();
    const lastUser = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const lower = lastUser.toLowerCase();
    const intent = req.intentHint ?? inferIntent(lower);

    let result: LlmCompletionResult;

    if (intent === "qualification") {
      const parsed = parseQualification(lastUser);
      result = {
        content: JSON.stringify(parsed),
        toolCalls: [],
        modelName: "mock-llm",
      };
    } else if (intent === "matching") {
      const filters = parseMatchFilters(lastUser);
      result = {
        content: `Searching for ${filters.minBedrooms ?? ""}BR properties in ${filters.city ?? "Dubai"}.`,
        toolCalls: [
          {
            id: "call_search_1",
            name: "search_properties",
            arguments: filters,
          },
        ],
        modelName: "mock-llm",
      };
    } else if (intent === "scheduling") {
      result = {
        content: "I can propose viewing slots with an available broker.",
        toolCalls: [
          {
            id: "call_book_1",
            name: "propose_viewing",
            arguments: parseScheduling(lastUser),
          },
        ],
        modelName: "mock-llm",
      };
    } else if (intent === "presentation") {
      result = {
        content: "Building a property presentation from listing facts.",
        toolCalls: [
          {
            id: "call_pres_1",
            name: "build_presentation",
            arguments: { query: lastUser },
          },
        ],
        modelName: "mock-llm",
      };
    } else if (intent === "handoff") {
      result = {
        content: "Connecting you with a PropPilot broker for next steps.",
        toolCalls: [
          {
            id: "call_handoff_1",
            name: "assign_broker",
            arguments: {},
          },
        ],
        modelName: "mock-llm",
      };
    } else if (intent === "nurture") {
      result = {
        content:
          "Thanks for staying in touch. I will send a short shortlist when new Marina or JLT inventory matches your budget.",
        toolCalls: [],
        modelName: "mock-llm",
      };
    } else {
      result = {
        content:
          "I can help qualify your requirements, match Dubai listings, book viewings, or hand you to a broker. What would you like to do?",
        toolCalls: [],
        modelName: "mock-llm",
      };
    }

    await toolCallAuditService.record({
      tenantId: req.tenantId,
      correlationId: req.correlationId,
      conversationId: req.conversationId,
      leadId: req.leadId,
      agentName: req.agentName,
      toolName: "llm.complete",
      callType: "llm",
      status: "ok",
      input: maskPiiDeep({ messages: req.messages, intentHint: intent }),
      output: maskPiiDeep(result),
      latencyMs: Date.now() - started,
      modelName: result.modelName,
    });

    return result;
  }
}

export function parseQualification(text: string): {
  budgetMaxAed: number | null;
  bedrooms: number | null;
  city: string | null;
  district: string | null;
  timeline: string | null;
  buyerType: string | null;
  score: number;
  summary: string;
} {
  const lower = text.toLowerCase();
  let budgetMaxAed: number | null = null;
  const budgetMatch =
    lower.match(/(\d+(?:\.\d+)?)\s*(m|million)\b/) ??
    lower.match(/budget\s*(?:of|is|around|under|upto|up to)?\s*(?:aed\s*)?(\d[\d,]*)/);
  if (budgetMatch) {
    if (budgetMatch[2] === "m" || budgetMatch[2] === "million") {
      budgetMaxAed = Math.round(Number(budgetMatch[1]) * 1_000_000);
    } else {
      budgetMaxAed = Number((budgetMatch[1] ?? "").replace(/,/g, ""));
    }
  }

  let bedrooms: number | null = null;
  const bedMatch = lower.match(/(\d+)\s*(?:br|bed|bedroom)/);
  if (bedMatch) bedrooms = Number(bedMatch[1]);

  let city: string | null = lower.includes("abu dhabi") ? "Abu Dhabi" : "Dubai";
  if (!lower.includes("dubai") && !lower.includes("abu dhabi")) city = "Dubai";

  let district: string | null = null;
  if (lower.includes("marina")) district = "Dubai Marina";
  else if (lower.includes("jlt") || lower.includes("lake towers")) district = "Jumeirah Lake Towers";
  else if (lower.includes("damac") || lower.includes("hills")) district = "Damac Hills";
  else if (lower.includes("downtown")) district = "Downtown Dubai";

  let timeline: string | null = null;
  if (lower.includes("asap") || lower.includes("immediate") || lower.includes("this month")) {
    timeline = "immediate";
  } else if (lower.includes("3 month") || lower.includes("quarter")) {
    timeline = "3_months";
  } else if (lower.includes("next year") || lower.includes("flexible")) {
    timeline = "flexible";
  }

  let buyerType: string | null = null;
  if (lower.includes("invest")) buyerType = "investor";
  else if (lower.includes("family") || lower.includes("live")) buyerType = "end_user";

  let score = 35;
  if (budgetMaxAed) score += 20;
  if (bedrooms != null) score += 15;
  if (district) score += 15;
  if (timeline === "immediate") score += 15;
  else if (timeline) score += 8;
  if (buyerType) score += 5;
  score = Math.min(100, score);

  return {
    budgetMaxAed,
    bedrooms,
    city,
    district,
    timeline,
    buyerType,
    score,
    summary: `Qualified interest: ${bedrooms ?? "?"}BR in ${district ?? city}, budget ${budgetMaxAed ? `AED ${budgetMaxAed}` : "TBD"}, timeline ${timeline ?? "unknown"}.`,
  };
}

function parseMatchFilters(text: string): Record<string, unknown> {
  const q = parseQualification(text);
  return {
    city: q.city ?? "Dubai",
    minBedrooms: q.bedrooms ?? undefined,
    maxPrice: q.budgetMaxAed ?? undefined,
    query: text,
  };
}

function parseScheduling(text: string): Record<string, unknown> {
  const lower = text.toLowerCase();
  let dayOffset = 1;
  if (lower.includes("tomorrow")) dayOffset = 1;
  else if (lower.includes("next week")) dayOffset = 7;
  else if (lower.includes("friday")) dayOffset = ((5 - new Date().getDay()) + 7) % 7 || 7;
  const when = new Date();
  when.setDate(when.getDate() + dayOffset);
  when.setHours(11, 0, 0, 0);
  return { preferredAt: when.toISOString(), notes: text.slice(0, 200) };
}

function inferIntent(lower: string): string {
  if (
    lower.includes("budget") ||
    lower.includes("looking for") ||
    lower.includes("qualify") ||
    lower.includes("bedroom")
  ) {
    return "qualification";
  }
  if (lower.includes("match") || lower.includes("show me") || lower.includes("search") || lower.includes("listing")) {
    return "matching";
  }
  if (lower.includes("viewing") || lower.includes("tour") || lower.includes("schedule") || lower.includes("book")) {
    return "scheduling";
  }
  if (lower.includes("presentation") || lower.includes("brochure") || lower.includes("deck")) {
    return "presentation";
  }
  if (lower.includes("broker") || lower.includes("agent") || lower.includes("human") || lower.includes("handoff")) {
    return "handoff";
  }
  if (lower.includes("later") || lower.includes("keep me") || lower.includes("update me") || lower.includes("nurture")) {
    return "nurture";
  }
  return "general";
}

export class OpenAiCompatibleLlmClient implements LlmClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly model: string,
    private readonly providerLabel = "openai-compatible",
  ) {}

  async complete(req: LlmCompletionRequest): Promise<LlmCompletionResult> {
    const started = Date.now();
    const url = `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
    // OpenRouter recommends these headers
    if (this.baseUrl.includes("openrouter.ai")) {
      headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL ?? "https://proppilot.demo";
      headers["X-Title"] = process.env.OPENROUTER_APP_NAME ?? "PropPilot";
    }
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: req.messages,
          tools: req.tools?.map((t) => ({
            type: "function",
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters ?? { type: "object", properties: {} },
            },
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`LLM HTTP ${res.status}: ${body.slice(0, 200)}`);
      }
      const data = (await res.json()) as {
        choices?: Array<{
          message?: {
            content?: string | null;
            tool_calls?: Array<{
              id: string;
              function: { name: string; arguments: string };
            }>;
          };
        }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
        model?: string;
      };
      const message = data.choices?.[0]?.message;
      const toolCalls: LlmToolCall[] = (message?.tool_calls ?? []).map((tc) => {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
        } catch {
          args = { raw: tc.function.arguments };
        }
        return { id: tc.id, name: tc.function.name, arguments: args };
      });
      const result: LlmCompletionResult = {
        content: message?.content ?? "",
        toolCalls,
        modelName: data.model ?? `${this.providerLabel}:${this.model}`,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
        raw: data,
      };
      await toolCallAuditService.record({
        tenantId: req.tenantId,
        correlationId: req.correlationId,
        conversationId: req.conversationId,
        leadId: req.leadId,
        agentName: req.agentName,
        toolName: "llm.complete",
        callType: "llm",
        status: "ok",
        input: maskPiiDeep({ messages: req.messages, provider: this.providerLabel }),
        output: maskPiiDeep({ content: result.content, toolCalls: result.toolCalls }),
        latencyMs: Date.now() - started,
        promptTokens: result.usage?.promptTokens,
        completionTokens: result.usage?.completionTokens,
        totalTokens: result.usage?.totalTokens,
        modelName: result.modelName,
      });
      return result;
    } catch (err) {
      await toolCallAuditService.record({
        tenantId: req.tenantId,
        correlationId: req.correlationId,
        conversationId: req.conversationId,
        leadId: req.leadId,
        agentName: req.agentName,
        toolName: "llm.complete",
        callType: "llm",
        status: "error",
        input: maskPiiDeep({ messages: req.messages, provider: this.providerLabel }),
        errorMessage: err instanceof Error ? err.message : "llm failed",
        latencyMs: Date.now() - started,
        modelName: this.model,
      });
      throw err;
    }
  }
}

/** Prefer live provider; on failure fall back to mock so agents keep working. */
export class FailoverLlmClient implements LlmClient {
  constructor(
    private readonly primary: LlmClient,
    private readonly fallback: LlmClient,
  ) {}

  async complete(req: LlmCompletionRequest): Promise<LlmCompletionResult> {
    try {
      return await this.primary.complete(req);
    } catch {
      const result = await this.fallback.complete(req);
      return {
        ...result,
        modelName: `${result.modelName}+failover`,
      };
    }
  }
}

export function createLlmClient(): LlmClient {
  let settingsLlm = null as ReturnType<typeof getSettings>["llm"] | null;
  try {
    settingsLlm = getSettings().llm;
  } catch {
    settingsLlm = null;
  }

  const config = resolveLlmConfig(settingsLlm);
  const mock = new MockLlmClient();

  if (config.provider === "mock" || !config.enabled) {
    return mock;
  }

  if (!config.apiKey || !config.baseUrl) {
    // Grok remains the configured default — mock until XAI_API_KEY / settings key is set
    return mock;
  }

  const primary = new OpenAiCompatibleLlmClient(
    config.baseUrl,
    config.apiKey,
    config.model,
    config.provider,
  );

  if (config.fallbackToMock) {
    return new FailoverLlmClient(primary, mock);
  }
  return primary;
}

export { extractJsonObject };
export { resolveLlmConfig, LLM_PROVIDERS, DEFAULT_LLM_PROVIDER } from "./providers";
