import { minDaily } from "./pricing";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./supabase/config";
import type { Boat } from "./data";
import type { Lang } from "./i18n";
import { localizeEquipment, localizeToy, parseEquipment } from "./boatOptions";

// ---- Ekibin yazdığı karşılaştırma yorumları (Admin > Karşılaştırmalar; site_texts "comparisons") ----
export type Curated = { id: string; a: string; b: string; note: string; noteEn: string; featured: boolean };

export async function getCurated(): Promise<Curated[]> {
  if (!supabaseConfigured()) return [];
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await db.from("site_texts").select("data").eq("key", "comparisons").maybeSingle();
    const items: Curated[] = Array.isArray(data?.data?.items) ? data!.data.items : [];
    return items.filter((c) => c && c.a && c.b && c.a !== c.b);
  } catch {
    return [];
  }
}
export const samePair = (c: { a: string; b: string }, x: string, y: string) => (c.a === x && c.b === y) || (c.a === y && c.b === x);

// ---- Otomatik değerlendirme: yat bilgilerinden üretilir ----
export type Side = "a" | "b" | null;
export type Row = { label: string; a: string; b: string; win: Side };
export type Point = { title: string; text: string; win: Side };


// ---- Klima / jeneratör gibi "var ama ne kadar" olan donanımlar ----
export type EqInfo = { has: boolean; detail: string; hours: number | null; extra: boolean };
export function eqInfo(b: Boat, re: RegExp, lang: Lang = "tr"): EqInfo {
  const raw = b.equipment.find((e) => re.test(parseEquipment(e).name));
  if (!raw) return { has: false, detail: "", hours: null, extra: false };
  const detail = parseEquipment(localizeEquipment(raw, lang)).detail;
  const d = parseEquipment(raw).detail.toLocaleLowerCase("tr");
  const extra = /ekstra ücretli|extra charge/.test(d) && !/fazlası/.test(d);
  let hours: number | null = null;
  if (extra) hours = 0;
  else if (/24\s*saat|7\s*\/\s*24|tam gün|all day/.test(d)) hours = 24;
  else { const m = d.match(/(\d{1,2})\s*saat/); if (m) hours = Number(m[1]); }
  return { has: true, detail, hours, extra };
}
export function eqCell(i: EqInfo, lang: Lang): string {
  const en = lang !== "tr";
  const ru = lang === "ru";
  if (!i.has) return ru ? "Нет" : en ? "No" : "Yok";
  return i.detail ? i.detail : (ru ? "Есть" : en ? "Yes" : "Var");
}
// Daha iyi olan taraf: saat biliniyorsa saate, değilse var/yok'a göre.
export function eqWin(a: EqInfo, b: EqInfo): Side {
  if (a.has !== b.has) return a.has ? "a" : "b";
  if (a.has && a.hours !== null && b.hours !== null && a.hours !== b.hours) return a.hours > b.hours ? "a" : "b";
  return null;
}

const eff = (b: Boat) => Math.max(b.year ?? 0, b.refit ?? 0);
const norm = (s: string) => s.trim().toLocaleLowerCase("tr");
const only = (x: string[], y: string[]) => { const set = new Set(y.map(norm)); return x.filter((i) => !set.has(norm(i))); };
const join = (l: string[], en: boolean, ru = false) => (l.length <= 1 ? l.join("") : l.slice(0, -1).join(", ") + (ru ? " и " : en ? " and " : " ve ") + l[l.length - 1]);
const pick = (n: Side, a: string, b: string) => (n === "a" ? a : n === "b" ? b : "");
const higher = (x: number, y: number, minGap = 0): Side => (x - y > minGap ? "a" : y - x > minGap ? "b" : null);
const lower = (x: number, y: number): Side => (x < y ? "a" : y < x ? "b" : null);
const perWeek = (b: Boat) => minDaily(b); // en düşük günlük fiyat

export function compareRows(a: Boat, b: Boat, lang: Lang, priceText: (x: Boat) => string | null, askPrice: string): Row[] {
  const en = lang !== "tr";
  const ru = lang === "ru";
  const yn = (v: boolean) => (v ? (ru ? "Есть" : en ? "Yes" : "Var") : (ru ? "Нет" : en ? "No" : "Yok"));
  const has = (x: Boat, re: RegExp) => x.equipment.some((e) => re.test(e));
  const num = (x: number) => (x > 0 ? String(x) : "–");
  const acA = eqInfo(a, /^klima$|air.?cond/i, lang), acB = eqInfo(b, /^klima$|air.?cond/i, lang);
  const gnA = eqInfo(a, /jenerat|generator/i, lang), gnB = eqInfo(b, /jenerat|generator/i, lang);
  const pa = perWeek(a), pb = perWeek(b);
  const priceWin: Side = pa && pb && a.currency === b.currency ? lower(pa, pb) : null;
  const yearTxt = (x: Boat) => (x.year ? `${x.year}${x.refit ? ` · refit ${x.refit}` : ""}` : "–");
  return [
    { label: ru ? "Тип" : en ? "Type" : "Tip", a: a.type || "–", b: b.type || "–", win: null },
    { label: ru ? "Порт отправления" : en ? "Departure port" : "Çıkış limanı", a: a.port || "–", b: b.port || "–", win: null },
    { label: ru ? "Длина" : en ? "Length" : "Boy", a: a.length > 0 ? `${a.length} m` : "–", b: b.length > 0 ? `${b.length} m` : "–", win: higher(a.length, b.length) },
    { label: ru ? "Ширина" : en ? "Beam" : "Genişlik", a: a.width > 0 ? `${a.width} m` : "–", b: b.width > 0 ? `${b.width} m` : "–", win: higher(a.width, b.width) },
    { label: ru ? "Год / ремонт" : en ? "Year / refit" : "Yıl / refit", a: yearTxt(a), b: yearTxt(b), win: eff(a) && eff(b) ? higher(eff(a), eff(b)) : null },
    { label: ru ? "Каюты" : en ? "Cabins" : "Kabin", a: num(a.cabins), b: num(b.cabins), win: higher(a.cabins, b.cabins) },
    { label: ru ? "Гости" : en ? "Guests" : "Misafir", a: String(a.guests), b: String(b.guests), win: higher(a.guests, b.guests) },
    { label: ru ? "Экипаж" : en ? "Crew" : "Mürettebat", a: num(a.crew), b: num(b.crew), win: null },
    { label: ru ? "Капитан" : en ? "Captain" : "Kaptan", a: a.captained ? (ru ? "Включено" : en ? "Included" : "Dahil") : (ru ? "Не включено" : en ? "Not included" : "Dahil değil"), b: b.captained ? (ru ? "Включено" : en ? "Included" : "Dahil") : (ru ? "Не включено" : en ? "Not included" : "Dahil değil"), win: null },
    { label: ru ? "Кондиционер" : en ? "A/C" : "Klima", a: eqCell(acA, lang), b: eqCell(acB, lang), win: eqWin(acA, acB) },
    { label: ru ? "Генератор" : en ? "Generator" : "Jeneratör", a: eqCell(gnA, lang), b: eqCell(gnB, lang), win: eqWin(gnA, gnB) },
    { label: ru ? "Джакузи" : en ? "Jacuzzi" : "Jakuzi", a: yn(has(a, /jakuzi|jacuzzi/i)), b: yn(has(b, /jakuzi|jacuzzi/i)), win: has(a, /jakuzi|jacuzzi/i) === has(b, /jakuzi|jacuzzi/i) ? null : has(a, /jakuzi|jacuzzi/i) ? "a" : "b" },
    { label: ru ? "Водные развлечения" : en ? "Water sports" : "Su sporları", a: a.waterSports.length ? `${a.waterSports.length} ${ru ? "позиций" : en ? "items" : "çeşit"}` : "–", b: b.waterSports.length ? `${b.waterSports.length} ${ru ? "позиций" : en ? "items" : "çeşit"}` : "–", win: higher(a.waterSports.length, b.waterSports.length) },
    { label: ru ? "Цена" : en ? "Price" : "Fiyat", a: priceText(a) ?? askPrice, b: priceText(b) ?? askPrice, win: priceWin },
  ];
}

export function buildPoints(a: Boat, b: Boat, lang: Lang): { points: Point[]; summary: string } {
  const en = lang !== "tr";
  const ru = lang === "ru";
  const pts: Point[] = [];
  const LT = (l: string[]) => l.map((x) => localizeToy(x, lang));
  const LE = (l: string[]) => l.map((x) => localizeEquipment(x, lang));
  const A = a.name, B = b.name;
  const nm = (w: Side) => (w === "a" ? A : B);

  // Boyut
  const lw = higher(a.length, b.length, 0.99);
  if (a.length > 0 && b.length > 0) {
    pts.push(lw
      ? { title: ru ? "Размер" : en ? "Size" : "Boyut", win: lw, text: ru
          ? `${nm(lw)} длиннее на ${Math.abs(a.length - b.length).toFixed(0)} м (${a.length} м и ${b.length} м), что обычно означает более просторные палубы и жилые зоны.`
          : en
          ? `${nm(lw)} is ${Math.abs(a.length - b.length).toFixed(0)} m longer (${a.length} m vs ${b.length} m), which usually means roomier decks and living areas.`
          : `${nm(lw)}, ${Math.abs(a.length - b.length).toFixed(0)} m daha uzun (${a.length} m ve ${b.length} m); bu genellikle daha geniş güverte ve yaşam alanı demek.` }
      : { title: ru ? "Размер" : en ? "Size" : "Boyut", win: null, text: ru ? `Обе яхты примерно одного размера (${a.length} м и ${b.length} м).` : en ? `Both yachts are about the same size (${a.length} m and ${b.length} m).` : `İki yat de benzer boyda (${a.length} m ve ${b.length} m).` });
  }

  // Yenilik
  if (eff(a) && eff(b)) {
    const w = higher(eff(a), eff(b));
    const old = w === "a" ? b : a, neu = w === "a" ? a : b;
    const refitNote = (x: Boat) => (x.refit && x.year && x.refit > x.year ? (ru ? ` (постройка ${x.year}, ремонт ${x.refit})` : en ? ` (built ${x.year}, refitted ${x.refit})` : ` (${x.year} yapım, ${x.refit} refit)`) : x.year ? (en ? ` (${x.year})` : ` (${x.year})`) : "");
    pts.push(w
      ? { title: ru ? "Возраст и ремонт" : en ? "Age and refit" : "Yaş ve yenileme", win: w, text: ru
          ? `${neu.name} новее${refitNote(neu)}, а ${old.name}${refitNote(old)} старше. Ремонт обновляет интерьеры и системы, поэтому стоит уточнить, что именно было обновлено.`
          : en
          ? `${neu.name} is the more recent one${refitNote(neu)}, while ${old.name}${refitNote(old)} is older. A refit brings interiors and systems up to date, so check what was renewed.`
          : `${neu.name} daha yeni${refitNote(neu)}; ${old.name}${refitNote(old)} daha eski. Refit, iç mekân ve sistemleri yeniler; neyin yenilendiğine bakmakta fayda var.` }
      : { title: ru ? "Возраст и ремонт" : en ? "Age and refit" : "Yaş ve yenileme", win: null, text: ru ? "Обе яхты одинаково новые." : en ? "Both yachts are equally recent." : "İki yat de aynı yenilikte." });
  }

  // Kabin ve kapasite
  if (a.cabins > 0 && b.cabins > 0) {
    const w = higher(a.cabins, b.cabins);
    pts.push(w
      ? { title: ru ? "Каюты и вместимость" : en ? "Cabins and capacity" : "Kabin ve kapasite", win: w, text: ru
          ? `У ${nm(w)} на ${Math.abs(a.cabins - b.cabins)} кают(ы) больше (${a.cabins} и ${b.cabins}); вместимость — ${a.guests} и ${b.guests} гостей.`
          : en
          ? `${nm(w)} has ${Math.abs(a.cabins - b.cabins)} more cabin${Math.abs(a.cabins - b.cabins) > 1 ? "s" : ""} (${a.cabins} vs ${b.cabins}); it sleeps ${a.guests} guests against ${b.guests}.`
          : `${nm(w)} ${Math.abs(a.cabins - b.cabins)} kabin daha fazla (${a.cabins} ve ${b.cabins}); ${A} ${a.guests}, ${B} ${b.guests} misafir ağırlıyor.` }
      : { title: ru ? "Каюты и вместимость" : en ? "Cabins and capacity" : "Kabin ve kapasite", win: null, text: ru ? `На обеих по ${a.cabins} кают (${a.guests} и ${b.guests} гостей).` : en ? `Both have ${a.cabins} cabins (${a.guests} and ${b.guests} guests).` : `İkisinde de ${a.cabins} kabin var (${a.guests} ve ${b.guests} misafir).` });
  }

  // Mürettebat
  if (a.crew !== b.crew || a.captained !== b.captained) {
    pts.push({ title: ru ? "Экипаж" : en ? "Crew" : "Mürettebat", win: null, text: ru
      ? `${A}: ${a.crew > 0 ? `экипаж ${a.crew} чел.` : "данных об экипаже нет"}${a.captained ? ", капитан включён" : ""}. ${B}: ${b.crew > 0 ? `экипаж ${b.crew} чел.` : "данных об экипаже нет"}${b.captained ? ", капитан включён" : ""}.`
      : en
      ? `${A}: ${a.crew > 0 ? `${a.crew} crew` : "no crew listed"}${a.captained ? ", captain included" : ""}. ${B}: ${b.crew > 0 ? `${b.crew} crew` : "no crew listed"}${b.captained ? ", captain included" : ""}.`
      : `${A}: ${a.crew > 0 ? `${a.crew} personel` : "personel bilgisi yok"}${a.captained ? ", kaptan dahil" : ""}. ${B}: ${b.crew > 0 ? `${b.crew} personel` : "personel bilgisi yok"}${b.captained ? ", kaptan dahil" : ""}.` });
  }

  // Klima ve jeneratör
  for (const [key, re, trN, enN, ruN] of [["ac", /^klima$|air.?cond/i, "Klima", "Air conditioning", "Кондиционер"], ["gen", /jenerat|generator/i, "Jeneratör", "Generator", "Генератор"]] as const) {
    void key;
    const x = eqInfo(a, re, lang), y = eqInfo(b, re, lang);
    if (!x.has && !y.has) continue;
    const w = eqWin(x, y);
    const d = (i: EqInfo) => (i.has ? (i.detail || (ru ? "есть" : en ? "available" : "var")) : (ru ? "нет" : en ? "not available" : "yok"));
    pts.push({ title: ru ? ruN : en ? enN : trN, win: w, text: ru
      ? `${A}: ${d(x)}. ${B}: ${d(y)}.${w ? ` У ${nm(w)} условия лучше. Летом важны часы работы, поэтому проверьте, что входит в цену.` : ""}`
      : en
      ? `${A}: ${d(x)}. ${B}: ${d(y)}.${w ? ` ${nm(w)} has the better arrangement. Hours matter in summer, so check what is included in the price.` : ""}`
      : `${A}: ${d(x)}. ${B}: ${d(y)}.${w ? ` ${nm(w)} bu konuda daha avantajlı. Yazın çalışma saati önemlidir; fiyata neyin dahil olduğuna bakın.` : ""}` });
  }

  // Su sporları
  const wa = only(a.waterSports, b.waterSports), wb = only(b.waterSports, a.waterSports);
  if (a.waterSports.length || b.waterSports.length) {
    const w = higher(a.waterSports.length, b.waterSports.length);
    const parts: string[] = [];
    if (wa.length) parts.push(ru ? `только у ${A} есть ${join(LT(wa.slice(0, 6)), true, true)}` : en ? `only ${A} offers ${join(LT(wa.slice(0, 6)), true)}` : `yalnızca ${A}’da ${join(LT(wa.slice(0, 6)), false)} var`);
    if (wb.length) parts.push(ru ? `только у ${B} есть ${join(LT(wb.slice(0, 6)), true, true)}` : en ? `only ${B} offers ${join(LT(wb.slice(0, 6)), true)}` : `yalnızca ${B}’da ${join(LT(wb.slice(0, 6)), false)} var`);
    pts.push({ title: ru ? "Водные развлечения" : en ? "Water sports" : "Su sporları", win: w, text: parts.length
      ? (ru ? `${parts.join("; ")}. ${w ? `У ${nm(w)} выбор шире (${a.waterSports.length} и ${b.waterSports.length}).` : ""}` : en ? `${parts.join("; ")}. ${w ? `${nm(w)} has the wider selection (${a.waterSports.length} vs ${b.waterSports.length}).` : ""}` : `${parts.join("; ")}. ${w ? `Çeşit olarak ${nm(w)} önde (${a.waterSports.length} ve ${b.waterSports.length}).` : ""}`).trim()
      : (ru ? "На обеих яхтах одинаковое снаряжение для водных развлечений." : en ? "Both offer the same water sports equipment." : "İkisinde de aynı su sporu ekipmanı var.") });
  }

  // Donanım
  const clean = (l: string[]) => l.map((e) => parseEquipment(e).name);
  const ea = only(clean(a.equipment), clean(b.equipment)), eb = only(clean(b.equipment), clean(a.equipment));
  if (ea.length || eb.length) {
    const parts: string[] = [];
    if (ea.length) parts.push(ru ? `у ${A} также есть ${join(LE(ea.slice(0, 5)), true, true)}` : en ? `${A} also has ${join(LE(ea.slice(0, 5)), true)}` : `${A}’da ayrıca ${join(LE(ea.slice(0, 5)), false)} var`);
    if (eb.length) parts.push(ru ? `у ${B} также есть ${join(LE(eb.slice(0, 5)), true, true)}` : en ? `${B} also has ${join(LE(eb.slice(0, 5)), true)}` : `${B}’da ayrıca ${join(LE(eb.slice(0, 5)), false)} var`);
    pts.push({ title: ru ? "Оборудование" : en ? "Equipment" : "Donanım", win: higher(ea.length, eb.length), text: parts.join(ru ? "; " : en ? "; " : "; ") + "." });
  }

  // Fiyat
  const pa = perWeek(a), pb = perWeek(b);
  if (pa && pb && a.currency === b.currency) {
    const w = lower(pa, pb);
    const per = (x: Boat, p: number) => Math.round(p / Math.max(1, x.guests));
    const fmt = (n: number) => n.toLocaleString(ru ? "ru-RU" : en ? "en-GB" : "tr-TR");
    pts.push({ title: ru ? "Цена" : en ? "Price" : "Fiyat", win: w, text: ru
      ? `${A}: от ${fmt(pa)} ${a.currency}/день, ${B}: от ${fmt(pb)} ${b.currency}/день. На гостя в день это примерно ${fmt(per(a, pa))} и ${fmt(per(b, pb))} ${a.currency}.`
      : en
      ? `${A} starts at ${fmt(pa)} ${a.currency}/day and ${B} at ${fmt(pb)} ${b.currency}/day. Per guest per day that is about ${fmt(per(a, pa))} vs ${fmt(per(b, pb))} ${a.currency}.`
      : `${A} günlük ${fmt(pa)} ${a.currency}’dan, ${B} ${fmt(pb)} ${b.currency}’dan başlıyor. Kişi başı günlük yaklaşık ${fmt(per(a, pa))} ve ${fmt(per(b, pb))} ${a.currency}.` });
  }

  // Puan
  if (a.rating && b.rating) {
    const w = higher(a.rating.avg, b.rating.avg, 0.2);
    pts.push({ title: ru ? "Отзывы гостей" : en ? "Guest reviews" : "Misafir yorumları", win: w, text: ru
      ? `${A}: ${a.rating.avg.toFixed(1)}/5 (отзывов: ${a.rating.count}). ${B}: ${b.rating.avg.toFixed(1)}/5 (отзывов: ${b.rating.count}).`
      : en
      ? `${A}: ${a.rating.avg.toFixed(1)}/5 (${a.rating.count} reviews). ${B}: ${b.rating.avg.toFixed(1)}/5 (${b.rating.count} reviews).`
      : `${A}: ${a.rating.avg.toFixed(1)}/5 (${a.rating.count} yorum). ${B}: ${b.rating.avg.toFixed(1)}/5 (${b.rating.count} yorum).` });
  }

  // Kısaca
  const wins = { a: pts.filter((p) => p.win === "a").map((p) => p.title.toLocaleLowerCase(ru ? "ru" : en ? "en" : "tr")), b: pts.filter((p) => p.win === "b").map((p) => p.title.toLocaleLowerCase(ru ? "ru" : en ? "en" : "tr")) };
  const lead = (x: string[]) => join(x.slice(0, 4), en, ru);
  const summary = wins.a.length || wins.b.length
    ? (ru
        ? [wins.a.length ? `${A} впереди по пунктам: ${lead(wins.a)}.` : "", wins.b.length ? `${B} впереди по пунктам: ${lead(wins.b)}.` : "", "Лучший выбор зависит от размера компании, бюджета и того, какое путешествие вы хотите."].filter(Boolean).join(" ")
        : en
        ? [wins.a.length ? `${A} leads on ${lead(wins.a)}.` : "", wins.b.length ? `${B} leads on ${lead(wins.b)}.` : "", "The better choice depends on your group size, budget and the kind of voyage you want."].filter(Boolean).join(" ")
        : [wins.a.length ? `${A}; ${lead(wins.a)} konusunda önde.` : "", wins.b.length ? `${B}; ${lead(wins.b)} konusunda önde.` : "", "Hangisinin daha iyi olduğu, grubunuzun büyüklüğüne, bütçenize ve nasıl bir yolculuk istediğinize göre değişir."].filter(Boolean).join(" "))
    : (ru ? "Эти две яхты очень похожи; выбор зависит от маршрута, дат и личного вкуса." : en ? "These two yachts are very close; the choice comes down to routes, dates and personal taste." : "Bu iki yat birbirine çok yakın; seçim rota, tarih ve kişisel zevke kalıyor.");
  void pick;
  return { points: pts, summary };
}
