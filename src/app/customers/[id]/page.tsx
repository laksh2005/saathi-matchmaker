import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth.server";
import { clientFor } from "@/lib/data.server";
import { ageOf } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/ui";
import { Biodata } from "@/components/Biodata";
import { JourneyPanel } from "./JourneyPanel";
import { NotesPanel } from "./NotesPanel";
import { MatchesPanel } from "./MatchesPanel";

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) redirect("/login");
  const c = clientFor(s.sub, params.id);
  if (!c) notFound();

  return (
    <AppShell name={s.name}>
      <Link href="/dashboard" className="text-sm text-sand-600 hover:text-rose-600">&larr; All clients</Link>

      <section className="card mt-3 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar first={c.firstName} last={c.lastName} size={64} />
        <div className="flex-1">
          <h1 className="font-serif text-2xl">
            {c.firstName} {c.lastName}
            {c.verified && <span className="ml-2 align-middle text-xs font-sans text-emerald-700">Verified</span>}
          </h1>
          <p className="text-sm text-sand-600">
            {ageOf(c.dateOfBirth)} yrs, {c.gender}, {c.city}, {c.country} &middot; {c.designation} at {c.company}
          </p>
          <p className="mt-2 max-w-2xl text-sm">{c.aboutMe}</p>
        </div>
      </section>

      <JourneyPanel clientId={c.id} initialStage={c.stage} initialTag={c.statusTag} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
        <div className="space-y-6">
          <Biodata p={c} />
          <NotesPanel clientId={c.id} />
        </div>
        <MatchesPanel client={c} />
      </div>
    </AppShell>
  );
}
