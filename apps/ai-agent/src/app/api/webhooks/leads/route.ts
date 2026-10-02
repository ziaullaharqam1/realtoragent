import { NextResponse } from "next/server";
import { DemoLeadGateway } from "@/lib/ai-agent/gateways/demo/demo-lead-gateway";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { emitN8nEvent } from "@/lib/ai-agent/n8n/bridge";
import { processInboundMessage } from "@/lib/ai-agent/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Portal / n8n lead intake webhook.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const tenantId = String(body.tenantId ?? defaultTenantId());
  const leads = new DemoLeadGateway();
  const lead = leads.create(tenantId, {
    fullName: body.fullName ? String(body.fullName) : null,
    email: body.email ? String(body.email) : null,
    phone: body.phone ? String(body.phone) : null,
    source: String(body.source ?? "webhook"),
    consentMarketing: Boolean(body.consentMarketing ?? false),
    consentAi: Boolean(body.consentAi ?? true),
    preferredLocale: String(body.preferredLocale ?? "en"),
    metadata: (body.metadata as Record<string, unknown>) ?? null,
    state: "new",
  });

  await emitN8nEvent({
    type: "lead.created",
    tenantId,
    payload: { leadId: lead.id, source: lead.source },
  });

  let orchestration = null;
  if (body.message || body.autoQualify) {
    orchestration = await processInboundMessage({
      tenantId,
      channel: "web",
      leadId: lead.id,
      text: String(
        body.message ??
          `New lead ${lead.fullName ?? ""}. Looking for property. Budget ${body.budget ?? "TBD"}.`,
      ),
    });
  }

  return NextResponse.json({ lead, orchestration }, { status: 201 });
}
