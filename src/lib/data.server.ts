// Read only data access. The JSON files stand in for a database; every lookup
// is scoped to the signed in matchmaker so one matchmaker never sees another's
// clients.
import clientsJson from "@data/clients.json";
import poolJson from "@data/pool.json";
import type { Client, Profile } from "./types";

const CLIENTS = clientsJson as Client[];
const POOL = poolJson as Profile[];

export function clientsFor(matchmakerId: string): Client[] {
  return CLIENTS.filter((c) => c.matchmakerId === matchmakerId);
}

export function clientFor(matchmakerId: string, id: string): Client | null {
  return CLIENTS.find((c) => c.id === id && c.matchmakerId === matchmakerId) ?? null;
}

export function pool(): Profile[] {
  return POOL;
}

export function poolProfile(id: string): Profile | null {
  return POOL.find((p) => p.id === id) ?? null;
}
