import { NextResponse } from "next/server";
import { can, resolvePrincipal } from "@/lib/ai-agent/auth/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const principal = resolvePrincipal(request.headers);
  return NextResponse.json({
    principal,
    permissions: {
      adminRead: can(principal.role, "admin:read"),
      adminWrite: can(principal.role, "admin:write"),
      flagsWrite: can(principal.role, "flags:write"),
      approvalsDecide: can(principal.role, "approvals:decide"),
      takeover: can(principal.role, "takeover"),
      n8nCommand: can(principal.role, "n8n:command"),
      evalRun: can(principal.role, "eval:run"),
      metricsRead: can(principal.role, "metrics:read"),
    },
    note: "Demo RBAC via X-PropPilot-Role header (admin|broker|viewer). SSO later.",
  });
}
