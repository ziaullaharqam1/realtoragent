import { NextResponse } from "next/server";
import {
  authenticateUser,
  encodeSession,
  sessionCookieHeader,
} from "@/lib/ai-agent/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const principal = authenticateUser(String(body.email ?? ""), String(body.password ?? ""));
  if (!principal) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const token = encodeSession(principal);
  const res = NextResponse.json({ ok: true, principal });
  res.headers.set("Set-Cookie", sessionCookieHeader(token));
  return res;
}
