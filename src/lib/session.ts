// Signed, httpOnly cookie session. Edge safe (used by middleware), so it only
// depends on jose and never touches Node APIs.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "saathi_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "saathi-demo-secret-change-in-production");

export interface Session { sub: string; name: string }

export async function createSessionToken(s: Session): Promise<string> {
  return new SignJWT({ name: s.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(s.sub)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function readSessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { sub: String(payload.sub), name: String(payload.name) };
  } catch {
    return null;
  }
}
