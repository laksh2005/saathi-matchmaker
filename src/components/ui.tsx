// Small presentational pieces shared across pages.
import type { JourneyStage, MatchTier, StatusTag } from "@/lib/types";

const TAG_STYLE: Record<StatusTag, string> = {
  New: "bg-sky-50 text-sky-700",
  Active: "bg-emerald-50 text-emerald-700",
  Priority: "bg-rose-100 text-rose-700",
  "On Hold": "bg-amber-50 text-amber-700",
  Matched: "bg-violet-50 text-violet-700",
};
export function StatusChip({ tag }: { tag: StatusTag }) {
  return <span className={`chip ${TAG_STYLE[tag]}`}>{tag}</span>;
}

const TIER_STYLE: Record<MatchTier, string> = {
  "High Potential": "bg-rose-500 text-white",
  "Good Match": "bg-rose-100 text-rose-700",
  "Worth Exploring": "bg-sand-100 text-sand-600",
};
export function TierChip({ tier }: { tier: MatchTier }) {
  return <span className={`chip ${TIER_STYLE[tier]}`}>{tier}</span>;
}

export function StageChip({ stage }: { stage: JourneyStage }) {
  return <span className="chip bg-sand-100 text-sand-600">{stage}</span>;
}

export function Avatar({ first, last, size = 40 }: { first: string; last: string; size?: number }) {
  // Deterministic warm hue per name so the list is easy to scan.
  const hue = [...(first + last)].reduce((h, c) => h + c.charCodeAt(0), 0) % 40;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `hsl(${340 + hue} 55% 58%)` }}
      aria-hidden
    >
      {first[0]}{last[0]}
    </span>
  );
}

export function ScoreRing({ score }: { score: number }) {
  const r = 22, c = 2 * Math.PI * r;
  return (
    <div className="relative h-14 w-14 shrink-0" aria-label={`Compatibility ${score} out of 100`}>
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#f4ede4" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e2506b" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold">{score}</span>
    </div>
  );
}
