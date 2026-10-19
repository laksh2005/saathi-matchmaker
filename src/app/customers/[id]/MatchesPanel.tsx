"use client";

import { useEffect, useState } from "react";
import { ageOf, type Client, type MatchResult } from "@/lib/types";
import { useLocalState } from "@/lib/useLocalState";
import { Avatar, ScoreRing, TierChip } from "@/components/ui";
import { Biodata } from "@/components/Biodata";
import { SendMatchModal } from "./SendMatchModal";
import type { AiInsight, InsightResponse } from "@/lib/ai.server";

interface Sent { candidateId: string; at: string; subject: string }
interface MatchesResponse { eligible: number; poolSize: number; matches: MatchResult[] }

export function MatchesPanel({ client }: { client: Client }) {
  const [data, setData] = useState<MatchesResponse | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [sending, setSending] = useState<MatchResult | null>(null);
  const [sent, setSent] = useLocalState<Sent[]>(`sent:${client.id}`, []);
  const [toast, setToast] = useState("");
  const [brief, setBrief] = useState("");
  const [insights, setInsights] = useState<Record<string, AiInsight>>({});
  const [insightSource, setInsightSource] = useState<InsightResponse["source"] | null>(null);
  const [thinking, setThinking] = useState(false);
  const [blend, setBlend] = useState(false);

  /** Ask the AI matchmaker for a second opinion on the current top 10. */
  async function getInsights() {
    if (!data) return;
    setThinking(true);
    const res = await fetch("/api/ai/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, candidateIds: data.matches.slice(0, 10).map((m) => m.candidate.id), brief }),
    });
    setThinking(false);
    if (!res.ok) return setToast("AI insights are unavailable right now.");
    const r: InsightResponse = await res.json();
    setInsights(Object.fromEntries(r.insights.map((i) => [i.id, i])));
    setInsightSource(r.source);
    setBlend(true);
  }

  // Blended rank: 60% engine, 40% AI opinion, only for matches the AI reviewed.
  const blended = (m: MatchResult) => (insights[m.candidate.id] ? Math.round(0.6 * m.score + 0.4 * insights[m.candidate.id].aiScore) : m.score);
  const ordered = data ? (blend ? [...data.matches].sort((a, b) => blended(b) - blended(a)) : data.matches) : [];

  useEffect(() => {
    fetch(`/api/customers/${client.id}/matches?limit=20`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError("Could not load matches."));
  }, [client.id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const sentIds = new Set(sent.map((s) => s.candidateId));

  return (
    <section className="card p-5" aria-label="Suggested matches">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-serif text-xl">Suggested matches</h2>
          {data && (
            <p className="text-sm text-sand-600">
              {data.eligible} of {data.poolSize} profiles pass {client.firstName}&apos;s dealbreakers. Showing the top {data.matches.length}.
            </p>
          )}
        </div>
        {sent.length > 0 && <span className="chip bg-emerald-50 text-emerald-700">{sent.length} sent</span>}
      </div>

      <div className="mt-4 rounded-xl bg-gradient-to-br from-rose-50 to-sand-50 p-4">
        <label htmlFor="brief" className="text-sm font-medium">AI matchmaker</label>
        <p className="text-xs text-sand-600">
          Add anything from your last call that the profile does not capture. The AI reviews the top 10 against both profiles and your brief.
        </p>
        <textarea id="brief" className="input mt-2 min-h-16" maxLength={500} value={brief} onChange={(e) => setBrief(e.target.value)}
          placeholder={`e.g. ${client.firstName} wants someone who loves travel, would prefer Bengaluru or Pune`} />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button className="btn-primary" onClick={getInsights} disabled={!data?.matches.length || thinking}>
            {thinking ? "Reviewing profiles..." : Object.keys(insights).length ? "Refresh AI review" : "Get AI review"}
          </button>
          {insightSource && (
            <label className="flex items-center gap-2 text-xs text-sand-600">
              <input type="checkbox" checked={blend} onChange={(e) => setBlend(e.target.checked)} className="accent-rose-500" />
              Rank by engine plus AI
            </label>
          )}
          {insightSource === "rules" && <span className="text-xs text-amber-700">AI not configured, showing rule based explanations</span>}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      {!data && !error && (
        <ul className="mt-4 space-y-3" aria-busy>
          {[0, 1, 2].map((i) => <li key={i} className="h-24 animate-pulse rounded-xl bg-sand-100" />)}
        </ul>
      )}
      {data && data.matches.length === 0 && (
        <p className="mt-4 rounded-xl bg-sand-50 p-4 text-sm text-sand-600">
          No one in the current pool passes every dealbreaker. Consider widening the age range or community preferences with {client.firstName}.
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {ordered.map((m) => {
          const c = m.candidate;
          const expanded = open === c.id;
          const wasSent = sentIds.has(c.id);
          const ai = insights[c.id];
          return (
            <li key={c.id} className="rounded-xl border border-sand-200 p-4">
              <div className="flex gap-3">
                <ScoreRing score={blend && ai ? blended(m) : m.score} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Avatar first={c.firstName} last={c.lastName} size={28} />
                    <h3 className="font-medium">{c.firstName} {c.lastName}</h3>
                    <TierChip tier={m.tier} />
                    {c.verified && <span className="text-xs text-emerald-700">Verified</span>}
                  </div>
                  <p className="mt-1 text-sm text-sand-600">
                    {ageOf(c.dateOfBirth)} yrs, {c.city} &middot; {c.designation}, {c.company} &middot; {c.incomeLpa} LPA
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {m.highlights.map((h) => <li key={h} className="chip bg-rose-50 text-rose-700">{h}</li>)}
                    {m.concerns.map((h) => <li key={h} className="chip bg-amber-50 text-amber-700">{h}</li>)}
                  </ul>
                </div>
              </div>

              {ai && (
                <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-sm">
                  <p className="font-medium text-rose-700">
                    {ai.headline}
                    <span className="ml-2 text-xs font-normal text-sand-600">{insightSource === "ai" ? "AI" : "Rules"} {ai.aiScore} &middot; Engine {m.score}</span>
                  </p>
                  <p className="mt-1">{ai.reasoning}</p>
                  <p className="mt-1 text-xs text-sand-600">Icebreaker: {ai.talkingPoint}</p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-primary" onClick={() => setSending(m)}>{wasSent ? "Send again" : "Send Match"}</button>
                <button className="btn-ghost" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : c.id)}>
                  {expanded ? "Hide details" : "Why this match"}
                </button>
                {wasSent && <span className="self-center text-xs text-emerald-700">Sent to {client.firstName}</span>}
              </div>

              {expanded && (
                <div className="mt-4 grid gap-5 border-t border-sand-100 pt-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-600">Score breakdown</h4>
                    <ul className="space-y-2">
                      {[...m.factors].sort((a, b) => b.weight - a.weight).map((f) => (
                        <li key={f.key} className="text-xs">
                          <div className="flex justify-between"><span className="font-medium">{f.label}</span><span className="text-sand-600">{Math.round(f.score * 100)}</span></div>
                          <div className="mt-1 h-1.5 rounded-full bg-sand-100">
                            <div className="h-1.5 rounded-full bg-rose-400" style={{ width: `${f.score * 100}%` }} />
                          </div>
                          <p className="mt-0.5 text-sand-600">{f.note}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Biodata p={c} compact />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {sending && (
        <SendMatchModal
          client={client}
          match={sending}
          onClose={() => setSending(null)}
          onSent={(subject) => {
            setSent([{ candidateId: sending.candidate.id, at: new Date().toISOString(), subject }, ...sent]);
            setToast(`Match sent to ${client.firstName} (${client.email})`);
            setSending(null);
          }}
        />
      )}

      {toast && (
        <div role="status" className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-sand-800 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </section>
  );
}
