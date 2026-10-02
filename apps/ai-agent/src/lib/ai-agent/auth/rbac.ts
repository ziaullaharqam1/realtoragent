export type PropPilotRole = "admin" | "broker" | "viewer";

export type SessionPrincipal = {
  role: PropPilotRole;
  userId: string;
  displayName: string;
};

const ROLE_PERMISSIONS: Record<PropPilotRole, readonly string[]> = {
  admin: [
    "admin:read",
    "admin:write",
    "flags:write",
    "approvals:decide",
    "takeover",
    "n8n:command",
    "eval:run",
    "metrics:read",
    "export:presentation",
  ],
  broker: [
    "admin:read",
    "approvals:decide",
    "takeover",
    "export:presentation",
  ],
  viewer: ["admin:read", "export:presentation"],
};

export function parseRole(raw: string | null | undefined): PropPilotRole {
  const value = (raw ?? "admin").toLowerCase();
  if (value === "broker" || value === "viewer" || value === "admin") return value;
  return "admin";
}

/** Resolve demo principal from headers (X-PropPilot-Role / X-PropPilot-User). */
export function resolvePrincipal(headers: Headers): SessionPrincipal {
  const role = parseRole(headers.get("x-proppilot-role") ?? process.env.DEMO_ADMIN_ROLE);
  const userId = headers.get("x-proppilot-user") ?? "demo-user";
  const names: Record<PropPilotRole, string> = {
    admin: "Demo Admin",
    broker: "Demo Broker",
    viewer: "Demo Viewer",
  };
  return { role, userId, displayName: names[role] };
}

export function can(role: PropPilotRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function requirePermission(
  headers: Headers,
  permission: string,
): { ok: true; principal: SessionPrincipal } | { ok: false; status: number; error: string } {
  const principal = resolvePrincipal(headers);
  if (!can(principal.role, permission)) {
    return {
      ok: false,
      status: 403,
      error: `Role ${principal.role} cannot ${permission}`,
    };
  }
  return { ok: true, principal };
}
