// AI layer on top of the deterministic engine.
//
// The engine decides who is eligible and gives a transparent score. The LLM
// then acts as a second opinion that reads both full profiles plus the
// matchmaker's own free text brief ("she loves music, prefers Bengaluru"),
// returns its own fit score with a short explanation, and writes intro
// emails. Keeping the LLM downstream means a model outage or a bad answer can
// never surface someone who fails a dealbreaker, and every call has a
// deterministic fallback.
import OpenAI from "openai";
import { ageOf, type MatchResult, type Profile } from "./types";
import { templateIntro, type IntroEmail } from "./intro";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export const aiEnabled = () => openai !== null;

// Small in memory cache; identical requests in a warm instance are free.
const cache = new Map<string, unknown>();

/** Compact profile text for prompts. Contact details are never sent to the model. */
function summarize(p: Profile): string {
  return [
    `${p.firstName}, ${p.gender}, ${ageOf(p.dateOfBirth)} yrs, ${p.heightCm} cm, ${p.city} (${p.country}), ${p.maritalStatus}`,
    `${p.designation} at ${p.company}, ${p.profession}, ${p.degree} from ${p.college}, ${p.incomeLpa} LPA`,
    `${p.religion}/${p.caste}, mother tongue ${p.motherTongue}, ${p.familyType} family, ${p.familyValues} values`,
    `Kids: ${p.wantKids}; relocate: ${p.openToRelocate}; pets: ${p.openToPets}; diet ${p.diet}; smokes ${p.smoking}; drinks ${p.drinking}`,
    `Hobbies: ${p.hobbies.join(", ")}. About: ${p.aboutMe}`,
  ].join("\n");
}

export interface AiInsight {
  id: string;
  aiScore: number; // 0..100
  headline: string; // e.g. "Grounded pair with a shared love of travel"
  reasoning: string; // two sentences
  talkingPoint: string; // icebreaker for the first call
}

export interface InsightResponse { source: "ai" | "rules"; insights: AiInsight[] }

/** Rule based fallback built from the engine's own factors. */
function ruleInsights(matches: MatchResult[]): AiInsight[] {
  return matches.map((m) => {
    const top = [...m.factors].sort((a, b) => b.score * b.weight - a.score * a.weight);
    const shared = m.candidate.hobbies[0]?.toLowerCase() ?? "their weekends";
    return {
      id: m.candidate.id,
      aiScore: m.score,
      headline: `${m.tier}: strongest on ${top[0].label.toLowerCase()} and ${top[1].label.toLowerCase()}`,
      reasoning: `${top[0].note}. ${top[1].note}.${m.concerns.length ? ` Watch: ${m.concerns[0].toLowerCase()}.` : ""}`,
      talkingPoint: `Ask about ${shared}.`,
    };
  });
}

export async function explainMatches(client: Profile, matches: MatchResult[], brief = ""): Promise<InsightResponse> {
  if (!openai || !matches.length) return { source: "rules", insights: ruleInsights(matches) };
  const key = `explain:${client.id}:${matches.map((m) => m.candidate.id).join(",")}:${brief}`;
  if (cache.has(key)) return cache.get(key) as InsightResponse;

  const candidates = matches.map((m) =>
    `ID ${m.candidate.id} (engine score ${m.score}, ${m.tier})\n${summarize(m.candidate)}\nEngine notes: ${m.factors.map((f) => `${f.label} ${Math.round(f.score * 100)}`).join(", ")}`,
  ).join("\n\n");

  try {
    const res = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior Indian matchmaker at The Date Crew. Judge long term compatibility for marriage the way an experienced matchmaker would: shared values and family expectations, life plans (children, city, career), lifestyle, and genuine chemistry signals. Respect the client's stated preferences and the matchmaker's brief. Be warm but honest; do not invent facts. Never use em dashes. " +
            'Return JSON: {"results":[{"id":string,"aiScore":0-100 integer,"headline":"max 10 words","reasoning":"two short sentences","talkingPoint":"one icebreaker for the first call"}]} with one entry per candidate, same ids.',
        },
        {
          role: "user",
          content: `CLIENT\n${summarize(client)}\n\nMATCHMAKER BRIEF\n${brief || "(none)"}\n\nCANDIDATES\n${candidates}`,
        },
      ],
    });
    const parsed = JSON.parse(res.choices[0].message.content ?? "{}") as { results?: AiInsight[] };
    const byId = new Map((parsed.results ?? []).map((r) => [r.id, r]));
    const fallback = ruleInsights(matches);
    const insights = matches.map((m, i) => {
      const r = byId.get(m.candidate.id);
      return r ? { ...r, id: m.candidate.id, aiScore: Math.max(0, Math.min(100, Math.round(Number(r.aiScore) || m.score))) } : fallback[i];
    });
    const out: InsightResponse = { source: "ai", insights };
    cache.set(key, out);
    return out;
  } catch (err) {
    console.error("AI explain failed, using rules", err instanceof Error ? err.message : err);
    return { source: "rules", insights: ruleInsights(matches) };
  }
}

export async function writeIntro(client: Profile, match: MatchResult, matchmaker: string): Promise<IntroEmail> {
  const fallback = templateIntro(client, match, matchmaker);
  if (!openai) return fallback;
  try {
    const res = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write short, warm, personal introduction emails from a matchmaker at The Date Crew to their client, introducing a suggested match. 140 to 200 words. Mention two or three specific reasons they could click, drawn only from the profiles. End with a basic profile block (age, city, profession, education, family) and an invitation to reply. Plain text, no markdown headings, never use em dashes. " +
            'Return JSON {"subject": string, "body": string}.',
        },
        {
          role: "user",
          content: `MATCHMAKER: ${matchmaker}\n\nCLIENT (recipient)\n${summarize(client)}\n\nSUGGESTED MATCH\n${summarize(match.candidate)}\n\nWhy the engine likes it: ${match.highlights.join("; ")}`,
        },
      ],
    });
    const j = JSON.parse(res.choices[0].message.content ?? "{}") as { subject?: string; body?: string };
    if (!j.subject || !j.body) return fallback;
    // Belt and braces: the product copy avoids em dashes.
    const clean = (s: string) => s.replace(/—/g, ", ");
    return { source: "ai", subject: clean(j.subject), body: clean(j.body) };
  } catch (err) {
    console.error("AI intro failed, using template", err instanceof Error ? err.message : err);
    return fallback;
  }
}
