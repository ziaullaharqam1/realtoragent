import { createHmac, timingSafeEqual } from "node:crypto";
import type { PropPilotRole, SessionPrincipal } from "./types";

export type { PropPilotRole, SessionPrincipal };

export type DemoUser = {
  email: string;
  password: string;
  role: PropPilotRole;
  displayName: string;
  userId: string;
};

export const DEMO_USERS: DemoUser[] = [
  {
    email: "admin@proppilot.demo",
    password: "proppilot",
    role: "admin",
    displayName: "Sara Admin",
    userId: "user-admin",
  },
  {
    email: "broker@proppilot.demo",
    password: "broker",
    role: "broker",
    displayName: "Omar Broker",
    userId: "user-broker",
  },
  {
    email: "viewer@proppilot.demo",
    password: "viewer",
    role: "viewer",
    displayName: "Alex Viewer",
    userId: "user-viewer",
  },
];

const COOKIE_NAME = "pp_session";

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "proppilot-demo-session-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function authenticateUser(
  email: string,
  password: string,
): SessionPrincipal | null {
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!user) return null;
  return {
    role: user.role,
    userId: user.userId,
    displayName: user.displayName,
  };
}

export function encodeSession(principal: SessionPrincipal): string {
  const body = Buffer.from(
    JSON.stringify({
      ...principal,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined | null): SessionPrincipal | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPrincipal & {
      exp?: number;
    };
    if (parsed.exp && Date.now() > parsed.exp) return null;
    if (!parsed.role || !parsed.userId) return null;
    return {
      role: parsed.role,
      userId: parsed.userId,
      displayName: parsed.displayName ?? parsed.userId,
    };
  } catch {
    return null;
  }
}

export function sessionCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${COOKIE_NAME}=`)) {
      return part.slice(COOKIE_NAME.length + 1);
    }
  }
  return null;
}

export function principalFromRequest(request: Request): SessionPrincipal | null {
  const token = readSessionCookie(request.headers.get("cookie"));
  return decodeSession(token);
}

export { COOKIE_NAME };
