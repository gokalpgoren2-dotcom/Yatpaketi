"use client";

import Link from "next/link";
import { Photo } from "./Photo";
import { Placeholder } from "./Placeholder";
import { FAV_MAX, clearFavorites, removeFavorite, useFavorites } from "@/lib/favorites";
import { priceLabel, type Boat } from "@/lib/data";
import { offerLabel } from "@/lib/campaigns";
import { RatingLine } from "./Reviews";
import { href, type Lang } from "@/lib/i18n";
import { useState } from "react";
import { buildPoints, samePair, type Curated } from "@/lib/compare";
import { CompareInsights } from "./CompareInsights";

const T = {
  tr: {
    empty: "Henüz favori tekneniz yok.", emptyText: "Tekne kartlarındaki kalbe dokunarak beğendiklerinizi buraya ekleyin, sonra yan yana karşılaştırın.", browse: "Tekneleri incele",
    count: (n: number) => `${n} tekne karşılaştırılıyor`, clear: "Listeyi temizle", remove: "Çıkar", open: "Tekneyi gör",
    rows: { type: "Tip", port: "Çıkış limanı", guests: "Misafir", cabins: "Kabin", length: "Boy", year: "Yıl", crew: "Mürettebat", captain: "Kaptan", price: "Fiyat", ac: "Klima", jacuzzi: "Jakuzi", offer: "Kampanya", rating: "Puan" },
    yes: "Var", no: "Yok", included: "Dahil", notIncluded: "Dahil değil", askPrice: "Fiyat sorunuz", people: "kişi",
    ask: "Tek mesajla WhatsApp'tan sor", askNote: "Seçtiğiniz tekneler hazır bir mesaj olarak WhatsApp'ta açılır; tarihlerinizi ekleyip gönderirsiniz.",
    msg: (list: string) => `Merhaba, aşağıdaki tekneler hakkında bilgi ve müsaitlik almak istiyorum:\n\n${list}\n\nTarihlerim: `,
    mail: "E-posta ile sor",
  },
  en: {
    empty: "You haven't saved any yachts yet.", emptyText: "Tap the heart on a yacht card to save it here, then compare your picks side by side.", browse: "Browse yachts",
    count: (n: number) => `Comparing ${n} yacht${n === 1 ? "" : "s"}`, clear: "Clear list", remove: "Remove", open: "View yacht",
    rows: { type: "Type", port: "Departure port", guests: "Guests", cabins: "Cabins", length: "Length", year: "Year", crew: "Crew", captain: "Captain", price: "Price", ac: "A/C", jacuzzi: "Jacuzzi", offer: "Offer", rating: "Rating" },
    yes: "Yes", no: "No", included: "Included", notIncluded: "Not included", askPrice: "Ask for price", people: "people",
    ask: "Ask us on WhatsApp in one message", askNote: "Your yachts open as a ready-made message in WhatsApp; just add your dates and send.",
    msg: (list: string) => `Hello, I'd like information and availability for these yachts:\n\n${list}\n\nMy dates: `,
    mail: "Ask by email",
  },
};

export function FavoritesClient({ boats, whatsapp, email, lang, curated }: { boats: Boat[]; whatsapp: string; email: string; lang: Lang; curated: Curated[] }) {
  const L = T[lang];
  const favs = useFavorites();
  const list = favs.map((s) => boats.find((b) => b.slug === s)).filter((b): b is Boat => Boolean(b));
  const has = (b: Boat, re: RegExp) => b.equipment.some((e) => re.test(e));
  const [pick, setPick] = useState<{ a: string; b: string }>({ a: "", b: "" });

  if (list.length === 0) return (
    <div className="rounded-3xl bg-mist p-10 text-center">
      <p className="font-display text-2xl font-bold text-navy">{L.empty}</p>
      <p className="mx-auto mt-2 max-w-md text-navy/70">{L.emptyText}</p>
      <Link href={href(lang, "/tekneler")} className="mt-6 inline-block rounded-full bg-turquoise px-6 py-3 text-sm font-semibold text-white">{L.browse}</Link>
    </div>
  );

  const rows: [string, (b: Boat) => React.ReactNode][] = [
    [L.rows.price, (b) => priceLabel(b, lang) ?? L.askPrice],
    [L.rows.offer, (b) => (b.offer ? <b className="text-[#c0332b]">{offerLabel(b.offer, lang)}</b> : "–")],
    [L.rows.rating, (b) => (b.rating ? <RatingLine rating={b.rating} lang={lang} /> : "–")],
    [L.rows.type, (b) => b.type || "–"],
    [L.rows.port, (b) => b.port || "–"],
    [L.rows.guests, (b) => `${b.guests} ${L.people}`],
    [L.rows.cabins, (b) => (b.cabins > 0 ? b.cabins : "–")],
    [L.rows.length, (b) => (b.length > 0 ? `${b.length} m` : "–")],
    [L.rows.year, (b) => (b.year ? `${b.year}${b.refit ? ` (refit ${b.refit})` : ""}` : "–")],
    [L.rows.crew, (b) => (b.crew > 0 ? b.crew : "–")],
    [L.rows.captain, (b) => (b.captained ? L.included : L.notIncluded)],
    [L.rows.ac, (b) => (has(b, /klima|air.?cond/i) ? L.yes : L.no)],
    [L.rows.jacuzzi, (b) => (has(b, /jakuzi|jacuzzi/i) ? L.yes : L.no)],
  ];

  const origin = typeof window !== "undefined" ? window.location.origin : "https://yatpaketi.com";
  const text = L.msg(list.map((b, i) => `${i + 1}) ${b.name}${b.port ? ` (${b.port})` : ""} – ${origin}${href(lang, `/tekneler/${b.slug}`)}`).join("\n"));
  const cta = "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-semibold transition";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-navy/65">{L.count(list.length)} · max {FAV_MAX}</p>
        <button type="button" onClick={clearFavorites} className="text-sm font-semibold text-red-700 hover:underline">{L.clear}</button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-3xl bg-white ring-1 ring-navy/10">
        <table className="w-full min-w-max border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-28 bg-white p-3 sm:w-36" />
              {list.map((b) => (
                <th key={b.slug} className="w-56 min-w-[13rem] p-3 align-top font-normal">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist">
                    {b.image ? <Photo src={b.image} alt={b.name} sizes="224px" className="object-cover" /> : <Placeholder hue={b.hue} className="h-full w-full" />}
                  </div>
                  <p className="font-display mt-3 text-lg font-bold text-navy">{b.name}</p>
                  <div className="mt-2 flex gap-2">
                    <Link href={href(lang, `/tekneler/${b.slug}`)} className="rounded-full bg-turquoise px-3 py-1.5 text-xs font-semibold text-white">{L.open}</Link>
                    <button type="button" onClick={() => removeFavorite(b.slug)} className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy">{L.remove}</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, cell]) => (
              <tr key={label} className="border-t border-navy/10">
                <th scope="row" className="sticky left-0 z-10 bg-white p-3 text-xs font-semibold uppercase tracking-wide text-navy/55">{label}</th>
                {list.map((b) => <td key={b.slug} className="p-3 font-medium text-navy">{cell(b)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {list.length >= 2 && (() => {
        const slugs = list.map((x) => x.slug);
        const sa = slugs.includes(pick.a) ? pick.a : slugs[0];
        const sb = slugs.includes(pick.b) && pick.b !== sa ? pick.b : slugs.find((x) => x !== sa)!;
        const A = list.find((x) => x.slug === sa)!, B = list.find((x) => x.slug === sb)!;
        const { points, summary } = buildPoints(A, B, lang);
        const c = curated.find((x) => samePair(x, sa, sb));
        const note = c ? ((lang === "en" ? c.noteEn?.trim() : "") || c.note) : "";
        const sel = "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-base font-semibold text-navy outline-none focus:border-turquoise";
        return (
          <section className="mt-10" aria-label={lang === "en" ? "Detailed comparison" : "Yorumlu karşılaştırma"}>
            <h2 className="font-display text-2xl font-bold text-navy lg:text-3xl">{lang === "en" ? "Detailed comparison" : "Yorumlu karşılaştırma"}</h2>
            <p className="mt-1 text-sm text-navy/65">{lang === "en" ? "Pick any two of your saved yachts to see how they compare." : "Favorilerinizden iki tekne seçin, nasıl ayrıştıklarını görün."}</p>
            <div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <select value={sa} onChange={(e) => setPick({ a: e.target.value, b: sb })} className={sel} aria-label={lang === "en" ? "First yacht" : "Birinci tekne"}>
                {list.filter((x) => x.slug !== sb).map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
              </select>
              <span className="text-center text-sm font-bold uppercase tracking-widest text-turquoise-dark">{lang === "en" ? "vs" : "karşı"}</span>
              <select value={sb} onChange={(e) => setPick({ a: sa, b: e.target.value })} className={sel} aria-label={lang === "en" ? "Second yacht" : "İkinci tekne"}>
                {list.filter((x) => x.slug !== sa).map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
              </select>
            </div>
            <div className="mt-6"><CompareInsights A={A} B={B} note={note} points={points} summary={summary} lang={lang} /></div>
          </section>
        );
      })()}

      <div className="mt-8 rounded-3xl bg-navy p-6 text-white lg:p-8">
        <h2 className="font-display text-2xl font-bold">{L.ask}</h2>
        <p className="mt-2 max-w-xl text-white/75">{L.askNote}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={`${cta} bg-[#25D366] text-white hover:brightness-95`}>WhatsApp</a>}
          {email && <a href={`mailto:${email}?subject=${encodeURIComponent(lang === "en" ? "Yacht enquiry" : "Tekne bilgi talebi")}&body=${encodeURIComponent(text)}`} className={`${cta} border border-white/30 text-white hover:bg-white/10`}>{L.mail}</a>}
        </div>
      </div>
    </div>
  );
}
