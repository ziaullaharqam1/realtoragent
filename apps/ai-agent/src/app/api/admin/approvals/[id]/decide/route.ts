import { NextResponse } from "next/server";
import { decideShadowApproval } from "@/lib/ai-agent/shadow/approvals";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";
import { getChannelAdapter, type ChannelKind } from "@/lib/ai-agent/channels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const tenantId = String(body.tenantId ?? defaultTenantId());
  const decision = String(body.decision ?? "") as "approved" | "rejected";
  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: "decision must be approved|rejected" }, { status: 400 });
  }

  try {
    const approval = decideShadowApproval(tenantId, id, decision, body.note ? String(body.note) : undefined);
    if (decision === "approved") {
      const channel = (approval.channel as ChannelKind) || "web";
      const adapter = getChannelAdapter(channel);
      const text = String(
        (approval.draftPayload.text as string) ??
          (approval.draftPayload as { content?: string }).content ??
          "",
      );
      await adapter.send({
        channel,
        tenantId,
        destination: approval.leadId ?? "web",
        text,
        metadata: { approvalId: approval.id, releasedFromShadow: true },
      });
    }
    return NextResponse.json({ approval });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "decide failed" },
      { status: 400 },
    );
  }
}
