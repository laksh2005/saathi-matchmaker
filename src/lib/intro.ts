// Deterministic intro email. Used directly when no AI key is configured and as
// the fallback whenever the AI call fails, so Send Match always works.
import { ageOf, formatHeight, type MatchResult, type Profile } from "./types";

export interface IntroEmail { subject: string; body: string; source: "ai" | "template" }

export function templateIntro(client: Profile, match: MatchResult, matchmaker: string): IntroEmail {
  const m = match.candidate;
  const reasons = match.highlights.length ? match.highlights.map((h) => `  * ${h}`).join("\n") : "  * A thoughtful overall fit";
  return {
    source: "template",
    subject: `${client.firstName}, meet ${m.firstName}: a ${match.tier.toLowerCase()} introduction`,
    body: `Hi ${client.firstName},

I hope you are doing well. I have been thinking about who could be a great fit for you, and I would love to introduce you to ${m.firstName}.

${m.firstName} is ${ageOf(m.dateOfBirth)}, lives in ${m.city}, and works as ${m.designation} at ${m.company}. ${m.aboutMe}

Why I think you two could click:
${reasons}

Quick profile
  Age: ${ageOf(m.dateOfBirth)}  |  Height: ${formatHeight(m.heightCm)}
  Education: ${m.degree}, ${m.college}
  Family: ${m.familyType}, ${m.familyValues.toLowerCase()} values  |  ${m.religion}

If this feels interesting, reply to this email and I will set up a first conversation.

Warmly,
${matchmaker}
The Date Crew`,
  };
}
