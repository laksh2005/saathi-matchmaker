# Saathi

**Saathi** (Hindi for "companion") is a matchmaker dashboard and matching engine. Matchmakers sign in, see every client they manage and where each one is in their journey, read full biodata, record call notes, and get ranked, explained match suggestions they can send as a personal intro email.

* Live demo: https://saathi-matchmaker.vercel.app
* Repository: https://github.com/laksh2005/tdc-matchmaker
* Demo logins: `ritika` / `saathi123` (10 clients) and `arnav` / `saathi123` (6 clients)
* Matching write up: [docs/MATCHING.md](docs/MATCHING.md)

## Features

| Area | What it does |
| --- | --- |
| Login | Username and password, signed httpOnly session cookie, every page and API route guarded by middleware |
| Dashboard | Clients assigned to the signed in matchmaker with name, age, city, marital status, journey stage and status tag. Clickable journey pipeline, search and status filter |
| Client view | Full biodata (all fields in the brief plus mother tongue, diet, smoking, drinking, family type and values, parents' occupations, manglik, horoscope and caste preferences, hobbies, partner age range), editable journey stage and status, call and meeting notes |
| Matching | 240 synthetic profiles (120 per gender). Two way hard filters, gender specific weighted scoring, reciprocal scoring, tiers, highlights, concerns and a per factor breakdown |
| AI | "AI matchmaker" second opinion on the top 10 with fit score, reason and icebreaker, steerable with a free text brief; optional engine plus AI ranking; AI drafted intro emails |
| Send Match | Editable intro email with the match's basic profile, mock delivery endpoint, toast, and a sent history per client |

## Architecture

```
data/
  generate.ts         seeded generator for pool.json and clients.json
  matchmakers.json    demo accounts
src/lib/
  types.ts            Profile, Client, MatchResult
  session.ts          JWT session cookie (edge safe, used by middleware)
  auth.server.ts      credential check and session lookup
  data.server.ts      data access, always scoped to the signed in matchmaker
  matching/
    filters.ts        dealbreakers, applied both ways
    scorers.ts        shared factors (lifestyle, values, language, ...)
    male.ts           younger, earns less, shorter (smooth curves)
    female.ts         career parity, profession fit, relocation, family
    index.ts          weights, reciprocal scoring, ranking, tiers
  ai.server.ts        OpenAI review and intro emails with fallbacks
  intro.ts            template intro email
src/app/
  login, dashboard, customers/[id]    pages
  api/                login, logout, customers, matches, ai/explain, ai/intro, send-match
tests/matching.test.ts
```

Key decisions:

* **Next.js App Router for both UI and API.** One deployable, server components read data directly, and route handlers are the Node backend.
* **Deterministic engine first, AI second.** The engine is pure, fast and testable and it owns eligibility. The model adds judgement and language on top, and can never surface someone who fails a dealbreaker.
* **Static JSON as the database.** Swappable behind `data.server.ts`. Matchmaker edits persist in the browser through one hook (`useLocalState`), the only piece that changes when a real database is added.
* **Reciprocal scoring.** A match only works if both people would say yes, so the candidate's view counts for 30%.

## Run locally

```bash
npm install
```

```bash
cp .env.example .env.local
```

Add `OPENAI_API_KEY` to `.env.local` to enable AI (optional), then:

```bash
npm run dev
```

```bash
npm test
```

Regenerate the demo data with `npm run generate`.
