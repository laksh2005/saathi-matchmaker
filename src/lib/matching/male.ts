// Preferences applied when the person being served is a man.
// The brief asks for women who are younger, earn less, are shorter and share
// his view on children. Instead of hard cut offs each rule is a smooth curve
// that peaks in the most common real world range, so a woman one year older
// or earning slightly more is down ranked rather than hidden.
import { ageOf } from "../types";
import type { Scorer } from "./scorers";

const clamp = (x: number) => Math.max(0, Math.min(1, x));

/** Peaks when she is 1 to 5 years younger, fades either side. */
export const younger: Scorer = (him, her) => {
  const gap = ageOf(him.dateOfBirth) - ageOf(her.dateOfBirth);
  const score = gap >= 1 && gap <= 5 ? 1 : gap > 5 ? clamp(1 - (gap - 5) * 0.15) : clamp(0.6 + gap * 0.25);
  return { score, note: gap > 0 ? `She is ${gap} year${gap > 1 ? "s" : ""} younger` : gap === 0 ? "Same age" : `She is ${-gap} year${gap < -1 ? "s" : ""} older` };
};

/** Full score when she earns less; gently declines as her income passes his. */
export const earnsLess: Scorer = (him, her) => {
  const ratio = her.incomeLpa / Math.max(1, him.incomeLpa);
  const score = ratio <= 1 ? 1 : clamp(1 - (ratio - 1) * 0.8);
  return { score, note: ratio <= 1 ? `Earns ${her.incomeLpa} LPA vs his ${him.incomeLpa} LPA` : `Earns more (${her.incomeLpa} vs ${him.incomeLpa} LPA)` };
};

/** Peaks when she is 5 to 20 cm shorter. */
export const shorter: Scorer = (him, her) => {
  const diff = him.heightCm - her.heightCm;
  const score = diff >= 5 && diff <= 20 ? 1 : diff > 20 ? clamp(1 - (diff - 20) * 0.05) : clamp(0.4 + diff * 0.12);
  return { score, note: diff > 0 ? `${diff} cm shorter` : diff === 0 ? "Same height" : `${-diff} cm taller` };
};
