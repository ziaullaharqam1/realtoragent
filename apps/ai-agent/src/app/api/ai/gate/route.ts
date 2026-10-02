import { NextResponse } from "next/server";
import { gateAiAgent } from "@/lib/ai-agent/boundary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") ?? process.env.TENANT_DEFAULT ?? "default";
  const channel = searchParams.get("channel") ?? undefined;
  const leadSource = searchParams.get("leadSource") ?? undefined;
  const brokerId = searchParams.get("brokerId") ?? undefined;

  try {
    const result = await gateAiAgent({ tenantId, channel, leadSource, brokerId });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "flag evaluation failed",
        hint: "Ensure DATABASE_URL is set and migrations are applied",
      },
      { status: 503 },
    );
  }
}
