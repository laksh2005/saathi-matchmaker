import { cookies } from "next/headers";
import matchmakers from "@data/matchmakers.json";
import type { Matchmaker } from "./types";
import { readSessionToken, SESSION_COOKIE, type Session } from "./session";

const MATCHMAKERS = matchmakers as Matchmaker[];

export function verifyCredentials(username: string, password: string): Matchmaker | null {
  const m = MATCHMAKERS.find((x) => x.username === username.trim().toLowerCase());
  return m && m.password === password ? m : null;
}

/** Current matchmaker for server components and route handlers. */
export async function getSession(): Promise<Session | null> {
  return readSessionToken(cookies().get(SESSION_COOKIE)?.value);
}
