"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ageOf, JOURNEY_STAGES, type Client, type JourneyStage, type StatusTag } from "@/lib/types";
import { readLocal } from "@/lib/useLocalState";
import { Avatar, StageChip, StatusChip } from "@/components/ui";

const TAGS: StatusTag[] = ["New", "Active", "Priority", "On Hold", "Matched"];

export function ClientList({ clients: initial }: { clients: Client[] }) {
  const [clients, setClients] = useState(initial);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<StatusTag | "">("");
  const [stage, setStage] = useState<JourneyStage | "">("");

  // Apply any stage or tag edits the matchmaker made on the detail page.
  useEffect(() => {
    setClients(initial.map((c) => ({
      ...c,
      stage: readLocal(`stage:${c.id}`, c.stage),
      statusTag: readLocal(`tag:${c.id}`, c.statusTag),
    })));
  }, [initial]);

  const shown = useMemo(() => clients.filter((c) => {
    const text = `${c.firstName} ${c.lastName} ${c.city} ${c.designation}`.toLowerCase();
    return (!q || text.includes(q.toLowerCase())) && (!tag || c.statusTag === tag) && (!stage || c.stage === stage);
  }), [clients, q, tag, stage]);

  return (
    <div className="space-y-6">
      <section aria-label="Journey pipeline" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {JOURNEY_STAGES.map((s) => {
          const n = clients.filter((c) => c.stage === s).length;
          const on = stage === s;
          return (
            <button key={s} onClick={() => setStage(on ? "" : s)} aria-pressed={on}
              className={`card p-3 text-left transition hover:border-rose-200 ${on ? "border-rose-400 ring-2 ring-rose-100" : ""}`}>
              <p className="text-2xl font-semibold">{n}</p>
              <p className="text-xs text-sand-600">{s}</p>
            </button>
          );
        })}
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input className="input sm:max-w-xs" placeholder="Search name, city or role" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search clients" />
        <select className="input sm:w-44" value={tag} onChange={(e) => setTag(e.target.value as StatusTag | "")} aria-label="Filter by status">
          <option value="">All statuses</option>
          {TAGS.map((t) => <option key={t}>{t}</option>)}
        </select>
        {(q || tag || stage) && <button className="btn-ghost" onClick={() => { setQ(""); setTag(""); setStage(""); }}>Clear</button>}
      </div>

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[2fr_0.6fr_1fr_1fr_1fr_1fr] gap-4 border-b border-sand-200 bg-sand-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-sand-600 md:grid">
          <span>Name</span><span>Age</span><span>City</span><span>Marital status</span><span>Stage</span><span>Status</span>
        </div>
        <ul>
          {shown.map((c) => (
            <li key={c.id} className="border-b border-sand-100 last:border-0">
              <Link href={`/customers/${c.id}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-rose-50/50 md:grid-cols-[2fr_0.6fr_1fr_1fr_1fr_1fr] md:gap-4 md:px-5">
                <span className="flex items-center gap-3 md:col-span-1">
                  <Avatar first={c.firstName} last={c.lastName} />
                  <span className="hidden md:block">
                    <span className="block font-medium">{c.firstName} {c.lastName}</span>
                    <span className="block text-xs text-sand-600">{c.designation}, {c.company}</span>
                  </span>
                </span>
                <span className="md:hidden">
                  <span className="block font-medium">{c.firstName} {c.lastName}</span>
                  <span className="block text-xs text-sand-600">{ageOf(c.dateOfBirth)} · {c.city} · {c.maritalStatus}</span>
                </span>
                <span className="hidden md:block">{ageOf(c.dateOfBirth)}</span>
                <span className="hidden md:block">{c.city}</span>
                <span className="hidden text-sm md:block">{c.maritalStatus}</span>
                <span className="hidden md:block"><StageChip stage={c.stage} /></span>
                <span><StatusChip tag={c.statusTag} /></span>
              </Link>
            </li>
          ))}
          {!shown.length && <li className="p-8 text-center text-sm text-sand-600">No clients match these filters.</li>}
        </ul>
      </div>
    </div>
  );
}
