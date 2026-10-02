import { getDb } from "@/lib/db/client";
import { toolCallAudits } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/ai-agent/demo/mode";
import { getDemoStore, newId } from "@/lib/ai-agent/demo/store";
import { maskPii, maskPiiDeep } from "./pii";

export type AuditRecordInput = {
  tenantId: string;
  correlationId?: string;
  conversationId?: string;
  leadId?: string;
  agentName?: string;
  toolName: string;
  callType?: "tool" | "llm";
  status?: string;
  input?: unknown;
  output?: unknown;
  errorMessage?: string;
  latencyMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUsd?: string | number;
  modelName?: string;
  metadata?: Record<string, unknown>;
};

export class ToolCallAuditService {
  async record(input: AuditRecordInput) {
    const inputMasked = maskPii(
      typeof input.input === "string" ? input.input : JSON.stringify(maskPiiDeep(input.input ?? null)),
    );
    const outputMasked = maskPii(
      typeof input.output === "string"
        ? input.output
        : JSON.stringify(maskPiiDeep(input.output ?? null)),
    );

    if (isDemoMode()) {
      const row = {
        id: newId(),
        tenantId: input.tenantId,
        correlationId: input.correlationId ?? null,
        conversationId: input.conversationId ?? null,
        leadId: input.leadId ?? null,
        agentName: input.agentName ?? null,
        toolName: input.toolName,
        callType: input.callType ?? "tool",
        status: input.status ?? "ok",
        inputMasked,
        outputMasked,
        errorMessage: maskPii(input.errorMessage),
        latencyMs: input.latencyMs ?? null,
        modelName: input.modelName ?? null,
        createdAt: new Date().toISOString(),
      };
      getDemoStore().audits.push(row);
      return row;
    }

    try {
      const db = getDb();
      const [row] = await db
        .insert(toolCallAudits)
        .values({
          tenantId: input.tenantId,
          correlationId: input.correlationId,
          conversationId: input.conversationId,
          leadId: input.leadId,
          agentName: input.agentName,
          toolName: input.toolName,
          callType: input.callType ?? "tool",
          status: input.status ?? "ok",
          inputMasked,
          outputMasked,
          errorMessage: maskPii(input.errorMessage),
          latencyMs: input.latencyMs,
          promptTokens: input.promptTokens,
          completionTokens: input.completionTokens,
          totalTokens: input.totalTokens,
          costUsd: input.costUsd != null ? String(input.costUsd) : null,
          modelName: input.modelName,
          piiMasked: true,
          metadataJson: maskPiiDeep(input.metadata ?? null) as Record<string, unknown> | null,
        })
        .returning();
      return row;
    } catch {
      const row = {
        id: newId(),
        tenantId: input.tenantId,
        correlationId: input.correlationId ?? null,
        conversationId: input.conversationId ?? null,
        leadId: input.leadId ?? null,
        agentName: input.agentName ?? null,
        toolName: input.toolName,
        callType: input.callType ?? "tool",
        status: input.status ?? "ok",
        inputMasked,
        outputMasked,
        errorMessage: maskPii(input.errorMessage),
        latencyMs: input.latencyMs ?? null,
        modelName: input.modelName ?? null,
        createdAt: new Date().toISOString(),
      };
      getDemoStore().audits.push(row);
      return row;
    }
  }
}

export const toolCallAuditService = new ToolCallAuditService();
