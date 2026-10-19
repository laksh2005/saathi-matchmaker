import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.server";
import { clientFor, poolProfile } from "@/lib/data.server";
import { scorePair } from "@/lib/matching";
import { templateIntro } from "@/lib/intro";

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { clientId, candidateId } = await req.json().catch(() => ({}));
  const client = clientFor(s.sub, String(clientId));
  const cand = poolProfile(String(candidateId));
  if (!client || !cand) return NextResponse.json({ error: "Unknown client or match" }, { status: 404 });
  return NextResponse.json(templateIntro(client, scorePair(client, cand), s.name));
}
