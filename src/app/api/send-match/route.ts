import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.server";
import { clientFor, poolProfile } from "@/lib/data.server";

// Mock email delivery. Validates ownership and returns what would be sent; a
// real deployment would hand this payload to an email provider here.
export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { clientId, candidateId, subject, body } = await req.json().catch(() => ({}));
  const client = clientFor(s.sub, String(clientId));
  const cand = poolProfile(String(candidateId));
  if (!client || !cand) return NextResponse.json({ error: "Unknown client or match" }, { status: 404 });
  if (!subject || !body) return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  const email = { id: crypto.randomUUID(), to: client.email, from: "matches@thedatecrew.com", subject, body, sentAt: new Date().toISOString(), candidateId: cand.id };
  console.log(`[mock email] ${s.name} -> ${client.email}: ${subject}`);
  return NextResponse.json({ ok: true, email });
}
