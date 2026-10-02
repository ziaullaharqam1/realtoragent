import { NextResponse } from "next/server";
import { listN8nEvents } from "@/lib/ai-agent/n8n/bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ events: listN8nEvents() });
}

export async function POST() {
  // Same as GET for convenience when n8n POSTs to list/poll
  return NextResponse.json({ events: listN8nEvents() });
}
