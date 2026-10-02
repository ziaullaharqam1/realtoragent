import { NextResponse } from "next/server";
import { getDemoStore, newId } from "@/lib/ai-agent/demo/store";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Record a presentation view for M12 analytics. */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const store = getDemoStore();
  const presentation = store.presentations.find((p) => p.id === id);
  if (!presentation) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const row = {
    id: newId(),
    tenantId: presentation.tenantId || defaultTenantId(),
    presentationId: id,
    leadId: body.leadId ? String(body.leadId) : presentation.leadId,
    source: String(body.source ?? "viewer"),
    createdAt: new Date().toISOString(),
  };
  store.presentationViews.push(row);
  return NextResponse.json({
    ok: true,
    view: row,
    totalViews: store.presentationViews.filter((v) => v.presentationId === id).length,
  });
}
