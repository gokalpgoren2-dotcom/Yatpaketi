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

type Priced = { showPrice: boolean; priceDaily: number | null; monthly?: Monthly };

// Aylık fiyat girilmişse onu, hiç girilmemişse (eski kayıt) tek günlük fiyatı sezon aylarında kullanır.
export function dailyFor(b: Priced, month: number): number | null {
  if (!b.showPrice || !SEASON_MONTHS.includes(month)) return null;
  const m = b.monthly ?? {};
  if (Object.keys(m).length) return m[month] && m[month]! > 0 ? m[month]! : null;
  return b.priceDaily && b.priceDaily > 0 ? b.priceDaily : null;
}

// Vitrinde gösterilen: en düşük günlük fiyat
export function minDaily(b: Priced): number | null {
  if (!b.showPrice) return null;
  const vals = SEASON_MONTHS.map((m) => dailyFor(b, m)).filter((v): v is number => v != null);
  return vals.length ? Math.min(...vals) : null;
}

export type Quote = { ok: true; nights: number; total: number; parts: { month: number; nights: number; daily: number }[] } | { ok: false; nights: number; missing: number[] };

// Giriş gününden çıkış gününe kadar her gece için o ayın günlük fiyatı. Çıkış günü hesaba katılmaz.
export function quote(b: Priced, start: string, end: string): Quote | null {
  if (!start || !end || end <= start) return null;
  const d = new Date(start + "T12:00:00Z");
  const last = new Date(end + "T12:00:00Z");
  const parts: { month: number; nights: number; daily: number }[] = [];
  const missing = new Set<number>();
  let nights = 0, total = 0;
  while (d < last && nights < 400) {
    const month = d.getUTCMonth() + 1;
    const p = dailyFor(b, month);
    if (p == null) missing.add(month);
    else {
      total += p;
      const prev = parts[parts.length - 1];
      if (prev && prev.month === month && prev.daily === p) prev.nights++;
      else parts.push({ month, nights: 1, daily: p });
    }
    nights++;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  if (missing.size) return { ok: false, nights, missing: [...missing] };
  return { ok: true, nights, total, parts };
}

const SYM: Record<string, string> = { EUR: "€", USD: "$", TRY: "₺" };
export const sym = (cur: string) => SYM[cur] ?? cur;
// 1.000 € (TR) / €1,000 (EN)
export const money = (v: number, cur: string, lang: "tr" | "en" = "tr") =>
  lang === "en" ? `${sym(cur)}${v.toLocaleString("en-GB")}` : `${v.toLocaleString("tr-TR")} ${sym(cur)}`;
