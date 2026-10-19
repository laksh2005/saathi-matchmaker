// Preferences applied when the person being served is a woman.
// Research on matrimonial platforms and on matchmaker interviews points to
// career and education parity, a partner who respects her own career,
// agreement on relocation (who moves after marriage) and family expectations
// (joint family, traditional roles) as the strongest predictors. Height and a
// slightly older partner still matter to many clients, at lower weight.
import { ageOf } from "../types";
import { eduRank, type Scorer } from "./scorers";

const clamp = (x: number) => Math.max(0, Math.min(1, x));

/** Education at her level or above, and an income that is at least comparable. */
export const careerParity: Scorer = (her, him) => {
  const edu = eduRank(him) - eduRank(her);
  const eduScore = edu >= 0 ? 1 : 0.55;
  const ratio = him.incomeLpa / Math.max(1, her.incomeLpa);
  const incomeScore = ratio >= 0.9 ? 1 : clamp(0.3 + ratio * 0.7);
  const score = 0.5 * eduScore + 0.5 * incomeScore;
  return { score, note: `${him.designation} at ${him.company}, ${him.incomeLpa} LPA` };
};

/** Professions that understand each other's schedules and ambitions. */
const AFFINITY: Record<string, string[]> = {
  Technology: ["Technology", "Business", "Design", "Entrepreneur"],
  Business: ["Business", "Finance", "Technology", "Entrepreneur", "Law"],
  Finance: ["Finance", "Business", "Law", "Technology"],
  Medicine: ["Medicine", "Education", "Technology"],
  Law: ["Law", "Finance", "Business", "Media"],
  Design: ["Design", "Media", "Technology", "Entrepreneur"],
  Education: ["Education", "Medicine", "Media"],
  Media: ["Media", "Design", "Law", "Education"],
  Entrepreneur: ["Entrepreneur", "Business", "Technology", "Design"],
};
export const professionFit: Scorer = (her, him) => {
  if (her.profession === him.profession) return { score: 1, note: `Both work in ${her.profession.toLowerCase()}` };
  const ok = AFFINITY[her.profession]?.includes(him.profession);
  return { score: ok ? 0.8 : 0.45, note: ok ? `${him.profession} pairs well with ${her.profession.toLowerCase()}` : `${him.profession} and ${her.profession}` };
};

/** Does the move work for her? A man who will relocate, or already lives in her city, scores best. */
export const relocationFit: Scorer = (her, him) => {
  if (her.city === him.city) return { score: 1, note: `Same city, no one needs to move` };
  if (him.openToRelocate === "Yes") return { score: 1, note: "He is open to relocating" };
  if (her.openToRelocate === "Yes") return { score: 0.75, note: "She is open to relocating" };
  if (him.openToRelocate === "Maybe" || her.openToRelocate === "Maybe") return { score: 0.5, note: "Relocation is negotiable" };
  return { score: 0.15, note: "Neither keen to relocate" };
};

/** Joint family plus traditional values can clash with a liberal, independent client. */
export const familyExpectations: Scorer = (her, him) => {
  if (her.familyValues === "Liberal" && him.familyType === "Joint" && him.familyValues === "Traditional")
    return { score: 0.2, note: "Traditional joint family, she is liberal" };
  if (her.familyType === him.familyType) return { score: 1, note: `Both from ${him.familyType.toLowerCase()} families` };
  return { score: 0.7, note: `${him.familyType} family` };
};

/** Mild preference for a partner who is the same age to 6 years older and taller. */
export const ageAndHeight: Scorer = (her, him) => {
  const gap = ageOf(her.dateOfBirth) - ageOf(him.dateOfBirth); // negative when he is older
  const age = gap <= 0 && gap >= -6 ? 1 : clamp(0.9 - Math.abs(gap) * 0.12);
  const h = him.heightCm - her.heightCm;
  const height = h >= 3 ? 1 : clamp(0.5 + h * 0.1);
  return { score: 0.5 * age + 0.5 * height, note: `${Math.abs(gap)} yrs ${gap <= 0 ? "older" : "younger"}, ${h >= 0 ? h + " cm taller" : -h + " cm shorter"}` };
};
