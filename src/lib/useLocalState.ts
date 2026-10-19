"use client";
// Per browser persistence for matchmaker edits (journey stage, notes, sent
// matches). The demo data is static and serverless hosts have no writable
// disk, so the browser is the system of record for this MVP. Swapping this
// hook for API calls is the only change needed to move to a real database.
import { useEffect, useState } from "react";

const PREFIX = "saathi:";

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => setValue(readLocal(key, initial)), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const update = (next: T) => {
    setValue(next);
    try { localStorage.setItem(PREFIX + key, JSON.stringify(next)); } catch { /* storage unavailable */ }
  };
  return [value, update] as const;
}
