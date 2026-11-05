// Rusça içerik katmanı: İngilizce metinleri sözlükten Rusçaya çevirir.
// Sözlükte olmayan metin olduğu gibi (İngilizce) kalır.
import D from "./ru-dict.json";

const dict = D as Record<string, string>;

export function ruText(s: string): string {
  if (!s) return s;
  return dict[s] ?? dict[s.trim()] ?? s;
}

export function ruDeep<T>(v: T): T {
  if (typeof v === "string") return ruText(v) as T;
  if (Array.isArray(v)) return v.map((x) => ruDeep(x)) as T;
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) o[k] = typeof x === "function" ? x : ruDeep(x);
    return o as T;
  }
  return v;
}

/** {tr, en, ru?} kaydından dile göre seçer; ru yoksa en'in Rusça çevirisini döner. */
export function pick<T>(rec: { tr: T; en: T; ru?: T }, lang: string): T {
  if (lang === "tr") return rec.tr;
  if (lang === "ru") return rec.ru ?? ruDeep(rec.en);
  return rec.en;
}
