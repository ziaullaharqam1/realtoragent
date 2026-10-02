import { NextResponse } from "next/server";
import { getDemoStore, newId } from "@/lib/ai-agent/demo/store";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") ?? defaultTenantId();
  const conversationId = searchParams.get("id");
  const store = getDemoStore();

  if (conversationId) {
    const conversation = store.conversations.find(
      (c) => c.id === conversationId && c.tenantId === tenantId,
    );
    if (!conversation) {
      return NextResponse.json({ error: "conversation not found" }, { status: 404 });
    }
    const messages = store.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return NextResponse.json({ conversation, messages });
  }

  const conversations = store.conversations
    .filter((c) => c.tenantId === tenantId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const tenantId = String(body.tenantId ?? defaultTenantId());
  const store = getDemoStore();
  const now = new Date().toISOString();
  const conversation = {
    id: newId(),
    tenantId,
    leadId: body.leadId ? String(body.leadId) : null,
    channel: String(body.channel ?? "web"),
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
  store.conversations.push(conversation);
  return NextResponse.json({ conversation }, { status: 201 });
}
