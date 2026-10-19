import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.server";
import { clientsFor } from "@/lib/data.server";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json(clientsFor(s.sub));
}
