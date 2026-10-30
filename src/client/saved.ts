"use client";

import { useSyncExternalStore } from "react";
import { birthQuery, type Birth } from "@/lib/birth";

// Saved kundlis live in this browser only (localStorage): no account, nothing sent anywhere.

export interface SavedKundli extends Birth {
  savedAt: number;
}

const KEY = "jyotish:saved";
const listeners = new Set<() => void>();
const EMPTY: SavedKundli[] = [];

let cacheRaw: string | null = null;
let cacheList: SavedKundli[] = EMPTY;

function read(): SavedKundli[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  // Same string, same array: useSyncExternalStore needs a stable snapshot
  if (raw === cacheRaw) return cacheList;
  cacheRaw = raw;
  try {
    const parsed = JSON.parse(raw ?? "[]");
    cacheList = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cacheList = EMPTY;
  }
  return cacheList;
}

function write(list: SavedKundli[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  listeners.forEach((l) => l());
}

export const keyOf = (b: Birth) => birthQuery(b);

export function saveKundli(b: Birth) {
  const rest = read().filter((s) => keyOf(s) !== keyOf(b));
  write([{ ...b, savedAt: Date.now() }, ...rest]);
}

export function removeKundli(b: Birth) {
  write(read().filter((s) => keyOf(s) !== keyOf(b)));
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Another tab saving or removing one
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    removeEventListener("storage", onStorage);
  };
}

export function useSaved() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
