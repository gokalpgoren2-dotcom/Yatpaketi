"use client";

import { useSyncExternalStore } from "react";

// Favori tekneler yalnızca ziyaretçinin kendi tarayıcısında saklanır (hesap gerekmez).
const KEY = "yp_favs";
const EVT = "yp-favs";
const MAX = 12;
const EMPTY: string[] = [];
let cache: { raw: string | null; list: string[] } = { raw: null, list: EMPTY };

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.list;
    const v = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, MAX) : EMPTY;
    cache = { raw, list };
    return list;
  } catch {
    return EMPTY;
  }
}

function write(list: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch { /* özel pencere: sessizce yok sayılır */ }
  window.dispatchEvent(new Event(EVT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); };
}

export const FAV_MAX = MAX;
export function useFavorites(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
export function toggleFavorite(slug: string) {
  const cur = read();
  write(cur.includes(slug) ? cur.filter((s) => s !== slug) : [slug, ...cur]);
}
export function removeFavorite(slug: string) { write(read().filter((s) => s !== slug)); }
export function clearFavorites() { write([]); }
