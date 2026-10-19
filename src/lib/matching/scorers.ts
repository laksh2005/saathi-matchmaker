// Shared scoring dimensions. Each returns a 0..1 score with a short human note
// so every number on screen can be explained to the matchmaker.
import type { Diet, FamilyValues, Habit, Profile, ScoreFactor, YesNoMaybe } from "../types";

export type Scorer = (a: Profile, b: Profile) => Omit<ScoreFactor, "weight" | "key" | "label">;

const clamp = (x: number) => Math.max(0, Math.min(1, x));

function ynm(a: YesNoMaybe, b: YesNoMaybe): number {
  if (a === b) return 1;
  if (a === "Maybe" || b === "Maybe") return 0.6;
  return 0;
}

export const kids: Scorer = (a, b) => {
  const s = ynm(a.wantKids, b.wantKids);
  return { score: s, note: s === 1 ? `Both say "${a.wantKids}" to kids` : `Kids: ${a.wantKids} vs ${b.wantKids}` };
};

export const pets: Scorer = (a, b) => {
  const s = ynm(a.openToPets, b.openToPets);
  return { score: s, note: s === 1 ? "Same stance on pets" : `Pets: ${a.openToPets} vs ${b.openToPets}` };
};

/** Location plus willingness to move. */
export const location: Scorer = (a, b) => {
  if (a.city === b.city) return { score: 1, note: `Both in ${a.city}` };
  const willing = [a.openToRelocate, b.openToRelocate];
  const best = willing.includes("Yes") ? 1 : willing.includes("Maybe") ? 0.6 : 0.2;
  if (a.country === b.country) return { score: clamp(0.55 + 0.4 * best), note: `${a.city} and ${b.city}, ${best === 1 ? "one is happy to relocate" : "relocation is open"}` };
  return { score: clamp(0.15 + 0.6 * best), note: `Different countries (${a.country}, ${b.country})` };
};

const DIET_GROUP: Record<Diet, number> = { Jain: 0, Vegan: 0, Vegetarian: 1, Eggetarian: 2, "Non-Vegetarian": 3 };
const HABIT: Record<Habit, number> = { No: 0, Occasionally: 1, Yes: 2 };

export const lifestyle: Scorer = (a, b) => {
  const dietGap = Math.abs(DIET_GROUP[a.diet] - DIET_GROUP[b.diet]);
  const diet = [1, 0.8, 0.45, 0.2][dietGap];
  const smoke = 1 - Math.abs(HABIT[a.smoking] - HABIT[b.smoking]) * 0.4;
  const drink = 1 - Math.abs(HABIT[a.drinking] - HABIT[b.drinking]) * 0.25;
  const score = clamp(0.5 * diet + 0.3 * smoke + 0.2 * drink);
  const note = dietGap === 0 ? `Both ${a.diet.toLowerCase()}` : `${a.diet} and ${b.diet}`;
  return { score, note };
};

export const language: Scorer = (a, b) => {
  if (a.motherTongue === b.motherTongue) return { score: 1, note: `Same mother tongue (${a.motherTongue})` };
  const shared = a.languages.filter((l) => l !== "English" && b.languages.includes(l));
  if (shared.length) return { score: 0.75, note: `Both speak ${shared[0]}` };
  return { score: 0.45, note: "English as common language" };
};

const VALUES: Record<FamilyValues, number> = { Traditional: 0, Moderate: 1, Liberal: 2 };
export const values: Scorer = (a, b) => {
  const gap = Math.abs(VALUES[a.familyValues] - VALUES[b.familyValues]);
  const familyType = a.familyType === b.familyType ? 1 : 0.7;
  const score = clamp([1, 0.6, 0.15][gap] * 0.8 + familyType * 0.2);
  return { score, note: gap === 0 ? `Shared ${a.familyValues.toLowerCase()} values` : `${a.familyValues} and ${b.familyValues} values` };
};

export const interests: Scorer = (a, b) => {
  const shared = a.hobbies.filter((h) => b.hobbies.includes(h));
  return { score: clamp(0.35 + shared.length * 0.33), note: shared.length ? `Both enjoy ${shared.join(", ").toLowerCase()}` : "Different hobbies" };
};

export const maritalHistory: Scorer = (a, b) => {
  const first = (p: Profile) => p.maritalStatus === "Never Married";
  if (first(a) === first(b)) return { score: 1, note: "Similar marital history" };
  return { score: 0.45, note: `${a.maritalStatus} and ${b.maritalStatus}` };
};

const EDU = { Bachelors: 0, Masters: 1, Professional: 1, Doctorate: 2 } as const;
export function eduRank(p: Profile): number {
  return EDU[p.educationLevel];
}
