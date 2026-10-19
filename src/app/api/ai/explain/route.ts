import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.server";
import { clientFor, poolProfile } from "@/lib/data.server";
import { dealbreaker, scorePair } from "@/lib/matching";
import { explainMatches } from "@/lib/ai.server";
import type { Profile } from "@/lib/types";

const MAX_CANDIDATES = 10;

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { clientId, candidateIds = [], brief = "" } = await req.json().catch(() => ({}));
  const client = clientFor(s.sub, String(clientId));
  if (!client) return NextResponse.json({ error: "Unknown client" }, { status: 404 });
  // Re-derive matches server side: only eligible candidates ever reach the model.
  const matches = (candidateIds as string[])
    .slice(0, MAX_CANDIDATES)
    .map((id) => poolProfile(String(id)))
    .filter((p): p is Profile => !!p && dealbreaker(client, p) === null)
    .map((p) => scorePair(client, p));
  return NextResponse.json(await explainMatches(client, matches, String(brief).slice(0, 500)));
}
