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
const MONTHS_RU = ["", "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
export const monthName = (m: number, lang: "tr" | "en" | "ru" = "tr") => (lang === "ru" ? MONTHS_RU : lang !== "tr" ? MONTHS_EN : MONTHS_TR)[m] ?? "";

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
export const money = (v: number, cur: string, lang: "tr" | "en" | "ru" = "tr") =>
  lang === "ru" ? `${v.toLocaleString("ru-RU")} ${sym(cur)}` : lang !== "tr" ? `${sym(cur)}${v.toLocaleString("en-GB")}` : `${v.toLocaleString("tr-TR")} ${sym(cur)}`;

// KDV notu (fiyatın yanında)
export function vatNote(b: { vatMode?: string; vatRate?: number }, lang: "tr" | "en" | "ru" = "tr"): string {
  if (b.vatMode === "included") return lang === "ru" ? "НДС включён" : lang !== "tr" ? "VAT included" : "KDV dahil";
  if (b.vatMode === "excluded") return lang === "ru" ? `+${b.vatRate ?? 20}% НДС` : lang !== "tr" ? `+${b.vatRate ?? 20}% VAT` : `+%${b.vatRate ?? 20} KDV`;
  return "";
}

// APA (Advance Provisioning Allowance) kısa açıklaması
// "%20'si", "%30'u", "%5'i" — Türkçe ek
const pctSuffix = (p: number) => {
  const n = p % 10 ? p % 10 : p % 100 ? (p / 10) % 10 : 0;
  const ones: Record<number, string> = { 1: "i", 2: "si", 3: "ü", 4: "ü", 5: "i", 6: "sı", 7: "si", 8: "i", 9: "u" };
  const tens: Record<number, string> = { 1: "u", 2: "si", 3: "u", 4: "ı", 5: "si", 6: "ı", 7: "i", 8: "i", 9: "ı" };
  return (p % 10 ? ones[n] : tens[n]) ?? "i";
};
// APA açıklaması. %5 APA yalnızca su sporları yakıtı ve marina bağlama ücretleri içindir.
export const apaText = (pct: number, lang: "tr" | "en" | "ru" = "tr") =>
  pct === 5
    ? lang === "ru"
      ? "APA 5% — это аванс в размере 5% от стоимости аренды, который покрывает только топливо для водных развлечений и сборы за стоянку в маринах. В конце аренды расходы подтверждаются документами; остаток возвращается или доплачивается."
      : lang !== "tr"
      ? "A 5% APA is an advance on the charter fee that covers water sports fuel and marina mooring fees only. Expenses are documented at the end of the charter; any balance is refunded or settled."
      : `%5 APA, yalnızca su sporları yakıtı ve marina bağlama ücretleri için kiralama bedelinin %5'i kadar alınan ön ödemedir. Tur sonunda harcamalar belgelenir; artan iade edilir, eksik tamamlanır.`
    : lang === "ru"
      ? `APA — это аванс в размере ${pct}% от стоимости аренды на текущие расходы: топливо, портовые сборы и продукты. В конце аренды расходы подтверждаются документами; остаток возвращается или доплачивается.`
      : lang !== "tr"
      ? `APA is an advance of ${pct}% of the charter fee for running costs such as fuel, port fees and provisions. Expenses are documented at the end of the charter; any balance is refunded or settled.`
      : `APA, yakıt, liman ücretleri ve kumanya gibi tur masrafları için kiralama bedelinin %${pct}'${pctSuffix(pct)} kadar alınan ön ödemedir. Tur sonunda harcamalar belgelenir; artan iade edilir, eksik tamamlanır.`;
