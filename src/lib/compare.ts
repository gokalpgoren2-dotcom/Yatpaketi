import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./supabase/config";
import type { Boat } from "./data";
import type { Lang } from "./i18n";

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

// ---- Otomatik değerlendirme: tekne bilgilerinden üretilir ----
export type Side = "a" | "b" | null;
export type Row = { label: string; a: string; b: string; win: Side };
export type Point = { title: string; text: string; win: Side };

const eff = (b: Boat) => Math.max(b.year ?? 0, b.refit ?? 0);
const norm = (s: string) => s.trim().toLocaleLowerCase("tr");
const only = (x: string[], y: string[]) => { const set = new Set(y.map(norm)); return x.filter((i) => !set.has(norm(i))); };
const join = (l: string[], en: boolean) => (l.length <= 1 ? l.join("") : l.slice(0, -1).join(", ") + (en ? " and " : " ve ") + l[l.length - 1]);
const pick = (n: Side, a: string, b: string) => (n === "a" ? a : n === "b" ? b : "");
const higher = (x: number, y: number, minGap = 0): Side => (x - y > minGap ? "a" : y - x > minGap ? "b" : null);
const lower = (x: number, y: number): Side => (x < y ? "a" : y < x ? "b" : null);
const perWeek = (b: Boat) => (b.showPrice && b.priceWeekly ? b.priceWeekly : null);

export function compareRows(a: Boat, b: Boat, lang: Lang, priceText: (x: Boat) => string | null, askPrice: string): Row[] {
  const en = lang === "en";
  const yn = (v: boolean) => (v ? (en ? "Yes" : "Var") : (en ? "No" : "Yok"));
  const has = (x: Boat, re: RegExp) => x.equipment.some((e) => re.test(e));
  const num = (x: number) => (x > 0 ? String(x) : "–");
  const pa = perWeek(a), pb = perWeek(b);
  const priceWin: Side = pa && pb && a.currency === b.currency ? lower(pa, pb) : null;
  const yearTxt = (x: Boat) => (x.year ? `${x.year}${x.refit ? ` · refit ${x.refit}` : ""}` : "–");
  return [
    { label: en ? "Type" : "Tip", a: a.type || "–", b: b.type || "–", win: null },
    { label: en ? "Departure port" : "Çıkış limanı", a: a.port || "–", b: b.port || "–", win: null },
    { label: en ? "Length" : "Boy", a: a.length > 0 ? `${a.length} m` : "–", b: b.length > 0 ? `${b.length} m` : "–", win: higher(a.length, b.length) },
    { label: en ? "Beam" : "Genişlik", a: a.width > 0 ? `${a.width} m` : "–", b: b.width > 0 ? `${b.width} m` : "–", win: higher(a.width, b.width) },
    { label: en ? "Year / refit" : "Yıl / refit", a: yearTxt(a), b: yearTxt(b), win: eff(a) && eff(b) ? higher(eff(a), eff(b)) : null },
    { label: en ? "Cabins" : "Kabin", a: num(a.cabins), b: num(b.cabins), win: higher(a.cabins, b.cabins) },
    { label: en ? "Guests" : "Misafir", a: String(a.guests), b: String(b.guests), win: higher(a.guests, b.guests) },
    { label: en ? "Crew" : "Mürettebat", a: num(a.crew), b: num(b.crew), win: null },
    { label: en ? "Captain" : "Kaptan", a: a.captained ? (en ? "Included" : "Dahil") : (en ? "Not included" : "Dahil değil"), b: b.captained ? (en ? "Included" : "Dahil") : (en ? "Not included" : "Dahil değil"), win: null },
    { label: en ? "A/C" : "Klima", a: yn(has(a, /klima|air.?cond/i)), b: yn(has(b, /klima|air.?cond/i)), win: has(a, /klima|air.?cond/i) === has(b, /klima|air.?cond/i) ? null : has(a, /klima|air.?cond/i) ? "a" : "b" },
    { label: en ? "Jacuzzi" : "Jakuzi", a: yn(has(a, /jakuzi|jacuzzi/i)), b: yn(has(b, /jakuzi|jacuzzi/i)), win: has(a, /jakuzi|jacuzzi/i) === has(b, /jakuzi|jacuzzi/i) ? null : has(a, /jakuzi|jacuzzi/i) ? "a" : "b" },
    { label: en ? "Water sports" : "Su sporları", a: a.waterSports.length ? `${a.waterSports.length} ${en ? "items" : "çeşit"}` : "–", b: b.waterSports.length ? `${b.waterSports.length} ${en ? "items" : "çeşit"}` : "–", win: higher(a.waterSports.length, b.waterSports.length) },
    { label: en ? "Price" : "Fiyat", a: priceText(a) ?? askPrice, b: priceText(b) ?? askPrice, win: priceWin },
  ];
}

export function buildPoints(a: Boat, b: Boat, lang: Lang): { points: Point[]; summary: string } {
  const en = lang === "en";
  const pts: Point[] = [];
  const A = a.name, B = b.name;
  const nm = (w: Side) => (w === "a" ? A : B);

  // Boyut
  const lw = higher(a.length, b.length, 0.99);
  if (a.length > 0 && b.length > 0) {
    pts.push(lw
      ? { title: en ? "Size" : "Boyut", win: lw, text: en
          ? `${nm(lw)} is ${Math.abs(a.length - b.length).toFixed(0)} m longer (${a.length} m vs ${b.length} m), which usually means roomier decks and living areas.`
          : `${nm(lw)}, ${Math.abs(a.length - b.length).toFixed(0)} m daha uzun (${a.length} m ve ${b.length} m); bu genellikle daha geniş güverte ve yaşam alanı demek.` }
      : { title: en ? "Size" : "Boyut", win: null, text: en ? `Both yachts are about the same size (${a.length} m and ${b.length} m).` : `İki tekne de benzer boyda (${a.length} m ve ${b.length} m).` });
  }

  // Yenilik
  if (eff(a) && eff(b)) {
    const w = higher(eff(a), eff(b));
    const old = w === "a" ? b : a, neu = w === "a" ? a : b;
    const refitNote = (x: Boat) => (x.refit && x.year && x.refit > x.year ? (en ? ` (built ${x.year}, refitted ${x.refit})` : ` (${x.year} yapım, ${x.refit} refit)`) : x.year ? (en ? ` (${x.year})` : ` (${x.year})`) : "");
    pts.push(w
      ? { title: en ? "Age and refit" : "Yaş ve yenileme", win: w, text: en
          ? `${neu.name} is the more recent one${refitNote(neu)}, while ${old.name}${refitNote(old)} is older. A refit brings interiors and systems up to date, so check what was renewed.`
          : `${neu.name} daha yeni${refitNote(neu)}; ${old.name}${refitNote(old)} daha eski. Refit, iç mekân ve sistemleri yeniler; neyin yenilendiğine bakmakta fayda var.` }
      : { title: en ? "Age and refit" : "Yaş ve yenileme", win: null, text: en ? "Both yachts are equally recent." : "İki tekne de aynı yenilikte." });
  }

  // Kabin ve kapasite
  if (a.cabins > 0 && b.cabins > 0) {
    const w = higher(a.cabins, b.cabins);
    pts.push(w
      ? { title: en ? "Cabins and capacity" : "Kabin ve kapasite", win: w, text: en
          ? `${nm(w)} has ${Math.abs(a.cabins - b.cabins)} more cabin${Math.abs(a.cabins - b.cabins) > 1 ? "s" : ""} (${a.cabins} vs ${b.cabins}); it sleeps ${a.guests} guests against ${b.guests}.`
          : `${nm(w)} ${Math.abs(a.cabins - b.cabins)} kabin daha fazla (${a.cabins} ve ${b.cabins}); ${A} ${a.guests}, ${B} ${b.guests} misafir ağırlıyor.` }
      : { title: en ? "Cabins and capacity" : "Kabin ve kapasite", win: null, text: en ? `Both have ${a.cabins} cabins (${a.guests} and ${b.guests} guests).` : `İkisinde de ${a.cabins} kabin var (${a.guests} ve ${b.guests} misafir).` });
  }

  // Mürettebat
  if (a.crew !== b.crew || a.captained !== b.captained) {
    pts.push({ title: en ? "Crew" : "Mürettebat", win: null, text: en
      ? `${A}: ${a.crew > 0 ? `${a.crew} crew` : "no crew listed"}${a.captained ? ", captain included" : ""}. ${B}: ${b.crew > 0 ? `${b.crew} crew` : "no crew listed"}${b.captained ? ", captain included" : ""}.`
      : `${A}: ${a.crew > 0 ? `${a.crew} personel` : "personel bilgisi yok"}${a.captained ? ", kaptan dahil" : ""}. ${B}: ${b.crew > 0 ? `${b.crew} personel` : "personel bilgisi yok"}${b.captained ? ", kaptan dahil" : ""}.` });
  }

  // Su sporları
  const wa = only(a.waterSports, b.waterSports), wb = only(b.waterSports, a.waterSports);
  if (a.waterSports.length || b.waterSports.length) {
    const w = higher(a.waterSports.length, b.waterSports.length);
    const parts: string[] = [];
    if (wa.length) parts.push(en ? `only ${A} offers ${join(wa.slice(0, 6), true)}` : `yalnızca ${A}’da ${join(wa.slice(0, 6), false)} var`);
    if (wb.length) parts.push(en ? `only ${B} offers ${join(wb.slice(0, 6), true)}` : `yalnızca ${B}’da ${join(wb.slice(0, 6), false)} var`);
    pts.push({ title: en ? "Water sports" : "Su sporları", win: w, text: parts.length
      ? (en ? `${parts.join("; ")}. ${w ? `${nm(w)} has the wider selection (${a.waterSports.length} vs ${b.waterSports.length}).` : ""}` : `${parts.join("; ")}. ${w ? `Çeşit olarak ${nm(w)} önde (${a.waterSports.length} ve ${b.waterSports.length}).` : ""}`).trim()
      : (en ? "Both offer the same water sports equipment." : "İkisinde de aynı su sporu ekipmanı var.") });
  }

  // Donanım
  const ea = only(a.equipment, b.equipment), eb = only(b.equipment, a.equipment);
  if (ea.length || eb.length) {
    const parts: string[] = [];
    if (ea.length) parts.push(en ? `${A} also has ${join(ea.slice(0, 5), true)}` : `${A}’da ayrıca ${join(ea.slice(0, 5), false)} var`);
    if (eb.length) parts.push(en ? `${B} also has ${join(eb.slice(0, 5), true)}` : `${B}’da ayrıca ${join(eb.slice(0, 5), false)} var`);
    pts.push({ title: en ? "Equipment" : "Donanım", win: higher(ea.length, eb.length), text: parts.join(en ? "; " : "; ") + "." });
  }

  // Fiyat
  const pa = perWeek(a), pb = perWeek(b);
  if (pa && pb && a.currency === b.currency) {
    const w = lower(pa, pb);
    const per = (x: Boat, p: number) => Math.round(p / Math.max(1, x.guests));
    const fmt = (n: number) => n.toLocaleString(en ? "en-GB" : "tr-TR");
    pts.push({ title: en ? "Price" : "Fiyat", win: w, text: en
      ? `${A} starts at ${fmt(pa)} ${a.currency}/week and ${B} at ${fmt(pb)} ${b.currency}/week. Per guest that is about ${fmt(per(a, pa))} vs ${fmt(per(b, pb))} ${a.currency}.`
      : `${A} haftalık ${fmt(pa)} ${a.currency}’dan, ${B} ${fmt(pb)} ${b.currency}’dan başlıyor. Kişi başı yaklaşık ${fmt(per(a, pa))} ve ${fmt(per(b, pb))} ${a.currency}.` });
  }

  // Puan
  if (a.rating && b.rating) {
    const w = higher(a.rating.avg, b.rating.avg, 0.2);
    pts.push({ title: en ? "Guest reviews" : "Misafir yorumları", win: w, text: en
      ? `${A}: ${a.rating.avg.toFixed(1)}/5 (${a.rating.count} reviews). ${B}: ${b.rating.avg.toFixed(1)}/5 (${b.rating.count} reviews).`
      : `${A}: ${a.rating.avg.toFixed(1)}/5 (${a.rating.count} yorum). ${B}: ${b.rating.avg.toFixed(1)}/5 (${b.rating.count} yorum).` });
  }

  // Kısaca
  const wins = { a: pts.filter((p) => p.win === "a").map((p) => p.title.toLocaleLowerCase(en ? "en" : "tr")), b: pts.filter((p) => p.win === "b").map((p) => p.title.toLocaleLowerCase(en ? "en" : "tr")) };
  const lead = (x: string[]) => join(x.slice(0, 4), en);
  const summary = wins.a.length || wins.b.length
    ? (en
        ? [wins.a.length ? `${A} leads on ${lead(wins.a)}.` : "", wins.b.length ? `${B} leads on ${lead(wins.b)}.` : "", "The better choice depends on your group size, budget and the kind of voyage you want."].filter(Boolean).join(" ")
        : [wins.a.length ? `${A}; ${lead(wins.a)} konusunda önde.` : "", wins.b.length ? `${B}; ${lead(wins.b)} konusunda önde.` : "", "Hangisinin daha iyi olduğu, grubunuzun büyüklüğüne, bütçenize ve nasıl bir yolculuk istediğinize göre değişir."].filter(Boolean).join(" "))
    : (en ? "These two yachts are very close; the choice comes down to routes, dates and personal taste." : "Bu iki tekne birbirine çok yakın; seçim rota, tarih ve kişisel zevke kalıyor.");
  void pick;
  return { points: pts, summary };
}
