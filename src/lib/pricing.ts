// Aylık günlük fiyatlar ve tarih aralığına göre tutar hesabı. Hem sunucuda hem tarayıcıda kullanılır.
// Sezon: Nisan–Kasım. Nisan, Mayıs, Ekim, Kasım düşük; Haziran, Eylül orta; Temmuz, Ağustos yüksek sezon.

export type Monthly = Partial<Record<number, number>>;
export type Season = "low" | "mid" | "high";

export const SEASON_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11];
export const SEASON_OF: Record<number, Season> = { 4: "low", 5: "low", 6: "mid", 7: "high", 8: "high", 9: "mid", 10: "low", 11: "low" };
export const SEASONS: { key: Season; tr: string; en: string; months: number[] }[] = [
  { key: "low", tr: "Düşük sezon", en: "Low season", months: [4, 5, 10, 11] },
  { key: "mid", tr: "Orta sezon", en: "Mid season", months: [6, 9] },
  { key: "high", tr: "Yüksek sezon", en: "High season", months: [7, 8] },
];
const MONTHS_TR = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const MONTHS_EN = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthName = (m: number, lang: "tr" | "en" = "tr") => (lang === "en" ? MONTHS_EN : MONTHS_TR)[m] ?? "";

type Priced = { showPrice: boolean; priceDaily: number | null; monthly?: Monthly; weekly?: Monthly };

// Aylık fiyat girilmişse onu, hiç girilmemişse (eski kayıt) tek günlük fiyatı sezon aylarında kullanır.
export function dailyFor(b: Priced, month: number): number | null {
  if (!b.showPrice || !SEASON_MONTHS.includes(month)) return null;
  const m = b.monthly ?? {};
  if (Object.keys(m).length) return m[month] && m[month]! > 0 ? m[month]! : null;
  return b.priceDaily && b.priceDaily > 0 ? b.priceDaily : null;
}

// Bazı yatlarda haftalık fiyat günlüğün 7 katı değildir: girilmişse 7 gece ve üzeri konaklamada kullanılır.
export function weeklyFor(b: Priced, month: number): number | null {
  if (!b.showPrice || !SEASON_MONTHS.includes(month)) return null;
  const w = b.weekly?.[month];
  return w && w > 0 ? w : null;
}
export const hasWeekly = (b: Priced) => SEASON_MONTHS.some((m) => weeklyFor(b, m) != null);

// Vitrinde gösterilen: en düşük günlük fiyat
export function minDaily(b: Priced): number | null {
  if (!b.showPrice) return null;
  const vals = SEASON_MONTHS.map((m) => dailyFor(b, m)).filter((v): v is number => v != null);
  return vals.length ? Math.min(...vals) : null;
}

// Geçerli kampanya indirimi (yüzde) uygulanmış fiyat
export const off = (v: number, pct?: number | null) => (pct && pct > 0 ? Math.round(v * (1 - pct / 100)) : v);

export type Quote = { ok: true; nights: number; total: number; weekly: boolean; parts: { month: number; nights: number; daily: number; sub: number }[] } | { ok: false; nights: number; missing: number[] };

// Giriş gününden çıkış gününe kadar her gece için o ayın günlük fiyatı. Çıkış günü hesaba katılmaz.
export function quote(b: Priced, start: string, end: string): Quote | null {
  if (!start || !end || end <= start) return null;
  const d = new Date(start + "T12:00:00Z");
  const last = new Date(end + "T12:00:00Z");
  const parts: { month: number; nights: number; daily: number; sub: number }[] = [];
  const missing = new Set<number>();
  let nights = 0, total = 0;
  // 7 gece ve üzeri: haftalık fiyatı girilmiş aylarda gecelik = haftalık / 7
  const span = Math.round((last.getTime() - d.getTime()) / 86400000);
  const useWeekly = span >= 7 && hasWeekly(b);
  let usedWeekly = false;
  while (d < last && nights < 400) {
    const month = d.getUTCMonth() + 1;
    const w = useWeekly ? weeklyFor(b, month) : null;
    if (w != null) usedWeekly = true;
    const p = w != null ? w / 7 : dailyFor(b, month);
    if (p == null) missing.add(month);
    else {
      total += p;
      const prev = parts[parts.length - 1];
      if (prev && prev.month === month && prev.daily === p) { prev.nights++; prev.sub += p; }
      else parts.push({ month, nights: 1, daily: p, sub: p });
    }
    nights++;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  if (missing.size) return { ok: false, nights, missing: [...missing] };
  return { ok: true, nights, total: Math.round(total), weekly: usedWeekly, parts: parts.map((x) => ({ ...x, daily: Math.round(x.daily), sub: Math.round(x.sub) })) };
}

const SYM: Record<string, string> = { EUR: "€", USD: "$", TRY: "₺" };
export const sym = (cur: string) => SYM[cur] ?? cur;
// 1.000 € (TR) / €1,000 (EN)
export const money = (v: number, cur: string, lang: "tr" | "en" = "tr") =>
  lang === "en" ? `${sym(cur)}${v.toLocaleString("en-GB")}` : `${v.toLocaleString("tr-TR")} ${sym(cur)}`;

// KDV notu (fiyatın yanında)
export function vatNote(b: { vatMode?: string; vatRate?: number }, lang: "tr" | "en" = "tr"): string {
  if (b.vatMode === "included") return lang === "en" ? "VAT included" : "KDV dahil";
  if (b.vatMode === "excluded") return lang === "en" ? `+${b.vatRate ?? 20}% VAT` : `+%${b.vatRate ?? 20} KDV`;
  return "";
}

// APA (Advance Provisioning Allowance) kısa açıklaması
export const apaText = (pct: number, lang: "tr" | "en" = "tr") =>
  lang === "en"
    ? `APA is an advance of ${pct}% of the charter fee for running costs such as fuel, port fees and provisions. Expenses are documented at the end of the charter; any balance is refunded or settled.`
    : `APA, yakıt, liman ücretleri ve kumanya gibi tur masrafları için kiralama bedelinin %${pct}'u kadar alınan ön ödemedir. Tur sonunda harcamalar belgelenir; artan iade edilir, eksik tamamlanır.`;
