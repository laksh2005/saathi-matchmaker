"use client";

import { useState } from "react";
import { useLocalState } from "@/lib/useLocalState";

interface Note { id: string; kind: string; text: string; at: string }
const KINDS = ["Call", "Meeting", "Feedback", "Family"];

export function NotesPanel({ clientId }: { clientId: string }) {
  const [notes, setNotes] = useLocalState<Note[]>(`notes:${clientId}`, []);
  const [text, setText] = useState("");
  const [kind, setKind] = useState(KINDS[0]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setNotes([{ id: crypto.randomUUID(), kind, text: text.trim(), at: new Date().toISOString() }, ...notes]);
    setText("");
  }

  return (
    <section className="card p-5" aria-label="Notes">
      <h2 className="font-serif text-xl">Notes</h2>
      <form onSubmit={add} className="mt-3 space-y-2">
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Note type">
          {KINDS.map((k) => (
            <button type="button" key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
              className={`chip border ${kind === k ? "border-rose-400 bg-rose-50 text-rose-700" : "border-sand-200 text-sand-600"}`}>{k}</button>
          ))}
        </div>
        <textarea className="input min-h-20" placeholder="What came up in the last conversation?" value={text} onChange={(e) => setText(e.target.value)} aria-label="Note" />
        <button className="btn-primary" disabled={!text.trim()}>Save note</button>
      </form>
      <ul className="mt-4 space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="rounded-xl bg-sand-50 p-3 text-sm">
            <div className="mb-1 flex items-center justify-between text-xs text-sand-600">
              <span className="font-medium text-rose-700">{n.kind}</span>
              <span>{new Date(n.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <p className="whitespace-pre-wrap">{n.text}</p>
            <button className="mt-1 text-xs text-sand-600 hover:text-rose-600" onClick={() => setNotes(notes.filter((x) => x.id !== n.id))}>Remove</button>
          </li>
        ))}
        {!notes.length && <li className="text-sm text-sand-600">No notes yet. Notes are saved in this browser.</li>}
      </ul>
    </section>
  );
}
