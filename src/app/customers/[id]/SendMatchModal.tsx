"use client";

import { useEffect, useRef, useState } from "react";
import type { Client, MatchResult } from "@/lib/types";
import type { IntroEmail } from "@/lib/intro";

interface Props { client: Client; match: MatchResult; onClose: () => void; onSent: (subject: string) => void }

/** Preview and edit the intro email, then send it (mock delivery). */
export function SendMatchModal({ client, match, onClose, onSent }: Props) {
  const [intro, setIntro] = useState<IntroEmail | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDivElement>(null);

  async function draft() {
    setIntro(null);
    const res = await fetch("/api/ai/intro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, candidateId: match.candidate.id }),
    });
    const data: IntroEmail = await res.json();
    setIntro(data);
    setSubject(data.subject);
    setBody(data.body);
  }

  useEffect(() => {
    draft();
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function send() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/send-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, candidateId: match.candidate.id, subject, body }),
    });
    setBusy(false);
    if (res.ok) onSent(subject);
    else setError((await res.json()).error ?? "Could not send");
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-sand-800/40 p-4" onClick={onClose}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal aria-labelledby="send-title"
        className="card flex max-h-[90vh] w-full max-w-2xl flex-col outline-none" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-sand-200 p-5">
          <h2 id="send-title" className="font-serif text-xl">Introduce {match.candidate.firstName} to {client.firstName}</h2>
          <p className="text-sm text-sand-600">To: {client.email} &middot; Score {match.score}, {match.tier}</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {!intro ? (
            <div className="space-y-2" aria-busy>
              <p className="text-sm text-sand-600">Writing a personal introduction...</p>
              <div className="h-40 animate-pulse rounded-xl bg-sand-100" />
            </div>
          ) : (
            <>
              <p className="text-xs text-sand-600">
                {intro.source === "ai" ? "Drafted by AI from both profiles. Review before sending." : "Drafted from the Saathi template (AI not configured)."}
              </p>
              <label className="block space-y-1 text-sm"><span>Subject</span>
                <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </label>
              <label className="block space-y-1 text-sm"><span>Message</span>
                <textarea className="input min-h-72 font-mono text-xs leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} />
              </label>
            </>
          )}
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-sand-200 p-4">
          <button className="btn-ghost" onClick={draft} disabled={!intro}>Redraft</button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={send} disabled={!intro || busy}>{busy ? "Sending..." : "Send Match"}</button>
        </div>
      </div>
    </div>
  );
}
