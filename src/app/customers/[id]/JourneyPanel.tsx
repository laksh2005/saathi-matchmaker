"use client";

import { JOURNEY_STAGES, type JourneyStage, type StatusTag } from "@/lib/types";
import { useLocalState } from "@/lib/useLocalState";

const TAGS: StatusTag[] = ["New", "Active", "Priority", "On Hold", "Matched"];

export function JourneyPanel({ clientId, initialStage, initialTag }: { clientId: string; initialStage: JourneyStage; initialTag: StatusTag }) {
  const [stage, setStage] = useLocalState<JourneyStage>(`stage:${clientId}`, initialStage);
  const [tag, setTag] = useLocalState<StatusTag>(`tag:${clientId}`, initialTag);
  const current = JOURNEY_STAGES.indexOf(stage);

  return (
    <section className="card mt-4 p-5" aria-label="Matchmaking journey">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-xl">Journey</h2>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-sand-600">Status</span>
          <select className="input w-36 py-1.5" value={tag} onChange={(e) => setTag(e.target.value as StatusTag)}>
            {TAGS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {JOURNEY_STAGES.map((s, i) => {
          const done = i < current, now = i === current;
          return (
            <li key={s}>
              <button
                onClick={() => setStage(s)}
                aria-current={now ? "step" : undefined}
                className={`w-full rounded-xl border px-2 py-2 text-left text-xs transition ${
                  now ? "border-rose-500 bg-rose-500 text-white" : done ? "border-rose-200 bg-rose-50 text-rose-700" : "border-sand-200 text-sand-600 hover:bg-sand-100"
                }`}
              >
                <span className="block font-semibold">{i + 1}</span>
                {s}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
