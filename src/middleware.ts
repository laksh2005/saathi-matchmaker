import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

// Every page and API route except login requires a valid matchmaker session.
export async function middleware(req: NextRequest) {
  const session = await readSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const url = new URL("/login", req.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|api/login|_next|favicon.ico).*)"],
};
