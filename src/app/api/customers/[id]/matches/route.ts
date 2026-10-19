import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.server";
import { clientFor, pool } from "@/lib/data.server";
import { findMatches } from "@/lib/matching";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const client = clientFor(s.sub, params.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const limit = Math.min(50, Number(new URL(req.url).searchParams.get("limit")) || 20);
  const all = findMatches(client, pool(), { limit: 1000 });
  return NextResponse.json({ eligible: all.length, poolSize: pool().filter((p) => p.gender !== client.gender).length, matches: all.slice(0, limit) });
}
