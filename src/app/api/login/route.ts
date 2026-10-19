import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth.server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const { username = "", password = "" } = await req.json().catch(() => ({}));
  const m = verifyCredentials(String(username), String(password));
  if (!m) return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  const res = NextResponse.json({ ok: true, name: m.name });
  res.cookies.set(SESSION_COOKIE, await createSessionToken({ sub: m.id, name: m.name }), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8,
  });
  return res;
}
