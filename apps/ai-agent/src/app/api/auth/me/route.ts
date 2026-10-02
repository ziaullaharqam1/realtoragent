import { NextResponse } from "next/server";
import { principalFromRequest } from "@/lib/ai-agent/auth/session";
import { can } from "@/lib/ai-agent/auth/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const principal = principalFromRequest(request);
  if (!principal) {
    return NextResponse.json({ authenticated: false, principal: null });
  }
  return NextResponse.json({
    authenticated: true,
    principal,
    permissions: {
      adminWrite: can(principal.role, "admin:write"),
      settingsWrite: can(principal.role, "settings:write"),
      studioSpatial: can(principal.role, "studio:spatial"),
      exportPresentation: can(principal.role, "export:presentation"),
    },
  });
}
