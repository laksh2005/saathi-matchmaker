import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.server";
import { clientFor } from "@/lib/data.server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const c = clientFor(s.sub, params.id);
  return c ? NextResponse.json(c) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
