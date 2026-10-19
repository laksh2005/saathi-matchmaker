// Matching engine entry point.
//
// Pipeline for one client:
//   1. Hard filters remove dealbreakers in both directions (filters.ts).
//   2. The client's view: a weighted blend of shared dimensions and the
//      gender specific preferences for the client (male.ts or female.ts).
//   3. The candidate's view: the same model run from the candidate's side.
//      Matching is two sided; a match only works if both people would say yes,
//      so the final score blends both views (reciprocal recommendation).
//   4. A verified candidate gets a small trust boost, then results are ranked
//      and tiered.
// Everything is pure and synchronous, so it runs in a route handler, a test or
// a batch job alike. AI explanations are layered on top in lib/ai.ts.
import type { MatchResult, MatchTier, Profile, ScoreFactor } from "../types";
import { dealbreaker } from "./filters";
import * as shared from "./scorers";
import * as male from "./male";
import * as female from "./female";

interface Dimension { key: string; label: string; weight: number; scorer: shared.Scorer }

const SHARED: Dimension[] = [
  { key: "lifestyle", label: "Lifestyle", weight: 1.0, scorer: shared.lifestyle },
  { key: "values", label: "Family values", weight: 1.2, scorer: shared.values },
  { key: "language", label: "Language", weight: 0.6, scorer: shared.language },
  { key: "interests", label: "Interests", weight: 0.5, scorer: shared.interests },
  { key: "pets", label: "Pets", weight: 0.3, scorer: shared.pets },
  { key: "marital", label: "Marital history", weight: 0.6, scorer: shared.maritalHistory },
];

/** Weights used when the person being served is a man (brief's rules weigh most). */
const FOR_MEN: Dimension[] = [
  { key: "kids", label: "Views on children", weight: 2.0, scorer: shared.kids },
  { key: "younger", label: "Age", weight: 1.4, scorer: male.younger },
  { key: "earnsLess", label: "Income", weight: 1.1, scorer: male.earnsLess },
  { key: "shorter", label: "Height", weight: 1.0, scorer: male.shorter },
  { key: "location", label: "Location", weight: 0.9, scorer: shared.location },
  ...SHARED,
];

/** Weights used when the person being served is a woman. */
const FOR_WOMEN: Dimension[] = [
  { key: "career", label: "Career and education", weight: 1.6, scorer: female.careerParity },
  { key: "profession", label: "Profession fit", weight: 0.9, scorer: female.professionFit },
  { key: "relocation", label: "Relocation", weight: 1.3, scorer: female.relocationFit },
  { key: "family", label: "Family expectations", weight: 1.2, scorer: female.familyExpectations },
  { key: "kids", label: "Views on children", weight: 1.5, scorer: shared.kids },
  { key: "ageHeight", label: "Age and height", weight: 0.6, scorer: female.ageAndHeight },
  ...SHARED,
];

export const dimensionsFor = (p: Profile) => (p.gender === "Male" ? FOR_MEN : FOR_WOMEN);

/** How well `cand` fits what `self` is looking for, 0..1, with per factor detail. */
export function oneSidedScore(self: Profile, cand: Profile): { score: number; factors: ScoreFactor[] } {
  const dims = dimensionsFor(self);
  const factors = dims.map((d) => ({ key: d.key, label: d.label, weight: d.weight, ...d.scorer(self, cand) }));
  const total = factors.reduce((s, f) => s + f.weight, 0);
  return { score: factors.reduce((s, f) => s + f.weight * f.score, 0) / total, factors };
}

/** Share of the final score that comes from the client's own preferences. */
export const CLIENT_SIDE_WEIGHT = 0.7;
const VERIFIED_BONUS = 0.03;

export function tierFor(score: number): MatchTier {
  return score >= 87 ? "High Potential" : score >= 77 ? "Good Match" : "Worth Exploring";
}

export function scorePair(client: Profile, cand: Profile): MatchResult {
  const mine = oneSidedScore(client, cand);
  const theirs = oneSidedScore(cand, client);
  let s = CLIENT_SIDE_WEIGHT * mine.score + (1 - CLIENT_SIDE_WEIGHT) * theirs.score;
  if (cand.verified) s += VERIFIED_BONUS;
  const score = Math.round(Math.min(1, s) * 100);

  const ranked = [...mine.factors].sort((a, b) => b.weight * b.score - a.weight * a.score);
  const highlights = ranked.filter((f) => f.score >= 0.85).slice(0, 3).map((f) => f.note);
  const concerns = mine.factors.filter((f) => f.score < 0.5).sort((a, b) => b.weight - a.weight).slice(0, 2).map((f) => f.note);
  if (theirs.score < 0.55) concerns.push("Client may not fit this person's own preferences");

  return { candidate: cand, score, tier: tierFor(score), factors: mine.factors, highlights, concerns };
}

export interface MatchOptions { limit?: number; excludeIds?: string[] }

export function findMatches(client: Profile, pool: Profile[], opts: MatchOptions = {}): MatchResult[] {
  const exclude = new Set(opts.excludeIds ?? []);
  return pool
    .filter((c) => !exclude.has(c.id) && dealbreaker(client, c) === null)
    .map((c) => scorePair(client, c))
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit ?? 20);
}

export { dealbreaker };
