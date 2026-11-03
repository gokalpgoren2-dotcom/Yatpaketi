"use client";

import { useState } from "react";
import { ReservationForm } from "./ReservationForm";
import { DateRangePicker } from "./DateRangePicker";
import { recordWhatsapp } from "@/app/tekneler/[slug]/talep";
import { href as pathFor, t, type Lang } from "@/lib/i18n";
import { money, monthName, off, quote, type Monthly } from "@/lib/pricing";

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

export type Pricing = { showPrice: boolean; priceDaily: number | null; monthly?: Monthly; currency: string; percent?: number };
type Props = { boatSlug: string; boatName: string; maxGuests: number; whatsapp: string; lang?: Lang; pricing?: Pricing };

// Yat sayfasındaki talep alanı: ana yol WhatsApp (hazır mesajla), ikinci yol form.
export function RequestPanel({ boatSlug, boatName, maxGuests, whatsapp, lang = "tr", pricing }: Props) {
  const L = t(lang);
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString(L.locale, { day: "numeric", month: "long", year: "numeric" });
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guests, setGuests] = useState(Math.min(2, maxGuests));
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const en = lang === "en";
  const q = pricing && start && end ? quote(pricing, start, end) : null;
  const pct = pricing?.percent ?? 0;
  const disc = (v: number) => off(v, pct);
  const totalNow = q && q.ok ? q.parts.reduce((t, p) => t + disc(p.daily) * p.nights, 0) : 0;
  const priceBox = q && pricing ? (
    q.ok ? (
      <div className={`rounded-2xl p-4 ring-1 ${pct ? "bg-[#fff1ee] ring-[#e8453c]/20" : "bg-turquoise/10 ring-turquoise/25"}`}>
        <ul className="space-y-1 text-sm text-navy/75">
          {q.parts.map((p, i) => (
            <li key={i} className="flex justify-between gap-3"><span>{monthName(p.month, lang)} · {p.nights} {en ? (p.nights === 1 ? "night" : "nights") : "gece"} × {money(disc(p.daily), pricing.currency, lang)}</span><span className="tabular-nums">{money(disc(p.daily) * p.nights, pricing.currency, lang)}</span></li>
          ))}
        </ul>
        <p className="mt-2 flex items-baseline justify-between gap-3 border-t border-turquoise/25 pt-2 text-navy">
          <span className="text-sm font-semibold">{en ? `Total · ${q.nights} nights` : `Toplam · ${q.nights} gece`}</span>
          <span className={`text-xl font-bold tabular-nums ${pct ? "text-[#c0332b]" : ""}`}>{money(totalNow, pricing.currency, lang)}</span>
        </p>
        {pct > 0 && <p className="mt-1 flex items-center justify-between gap-3 text-xs"><span className="rounded-full bg-[#e8453c] px-2 py-0.5 font-bold text-white">−%{pct} {en ? "discount" : "indirim"}</span><span className="text-navy/45 line-through tabular-nums">{money(q.total, pricing.currency, lang)}</span></p>}
        <p className="mt-1 text-xs text-navy/55">{en ? "Check-out day is not charged. Provisions and extras are not included." : "Çıkış günü ücrete dahil değildir. Kumanya ve ekstralar dahil değildir."}</p>
      </div>
    ) : (
      <p className="rounded-2xl bg-mist p-4 text-sm text-navy/70 ring-1 ring-navy/5">
        {en ? `No price is listed for ${q.missing.map((m) => monthName(m, lang)).join(", ")}. Message us for a quote.` : `${q.missing.map((m) => monthName(m, lang)).join(", ")} için fiyat girilmemiş. Fiyat için bize yazın.`}
      </p>
    )
  ) : null;

  if (!whatsapp) return <ReservationForm boatSlug={boatSlug} boatName={boatName} maxGuests={maxGuests} lang={lang} />;

  function message() {
    const url = `${window.location.origin}${pathFor(lang, `/tekneler/${boatSlug}`)}`;
    const lines = [
      L.waGreeting(boatName),
      "",
      `${L.waDate}: ${fmt(start)} – ${fmt(end)}`,
      `${L.waGuests}: ${guests}`,
    ];
    if (name.trim()) lines.push(`${L.waName}: ${name.trim()}`);
    if (q && q.ok && pricing) lines.push(en ? `Estimated price: ${money(totalNow, pricing.currency, lang)} (${q.nights} nights${pct ? `, ${pct}% discount applied` : ""})` : `Tahmini tutar: ${money(totalNow, pricing.currency, lang)} (${q.nights} gece${pct ? `, %${pct} indirimli` : ""})`);
    lines.push("", `${L.waBoat}: ${url}`);
    return lines.join("\n");
  }

  function go(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!start || !end) {
      e.preventDefault();
      setError(L.pickDates);
    } else if (end < start) {
      e.preventDefault();
      setError(L.endBefore);
    } else {
      setError("");
      void recordWhatsapp({ boat: boatSlug, name, start, end, guests }).catch(() => {}); // panele kayıt; WhatsApp açılışını etkilemez
    }
  }

  const href = start && end ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message())}` : "#";

  return (
    <div className="space-y-4">
      <DateRangePicker lang={lang} start={start} end={end} onChange={(a, b) => { setStart(a); setEnd(b); setError(""); }} />
      {priceBox}

      <div className="flex items-center justify-between rounded-xl border border-navy/15 px-4 py-2.5">
        <span className="text-sm font-medium text-navy">{L.guestCount}</span>
        <span className="flex items-center gap-3">
          <button type="button" aria-label={L.lessGuests} disabled={guests <= 1} onClick={() => setGuests((g) => Math.max(1, g - 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-xl font-semibold text-navy disabled:opacity-40">−</button>
          <span className="w-6 text-center text-lg font-semibold tabular-nums text-navy" aria-live="polite">{guests}</span>
          <button type="button" aria-label={L.moreGuests} disabled={guests >= maxGuests} onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-xl font-semibold text-navy disabled:opacity-40">+</button>
        </span>
      </div>

      <div><label className={lab} htmlFor="q-name">{L.yourNameOpt}</label>
        <input id="q-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" className={input} /></div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{error}</p>}

      <a href={href} onClick={go} target="_blank" rel="noopener"
         className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#25D366]/30 transition hover:brightness-95 active:scale-[0.99]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.5z" /></svg>
        {L.sendWa}
      </a>
      <p className="text-center text-xs leading-relaxed text-navy/55">{L.waHelp}</p>

      <details className="group rounded-xl border border-navy/10">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-navy">
          {L.noWa}
          <span aria-hidden className="text-navy/50 transition group-open:rotate-180">⌄</span>
        </summary>
        <div className="border-t border-navy/10 p-4">
          <ReservationForm boatSlug={boatSlug} boatName={boatName} maxGuests={maxGuests} lang={lang} />
        </div>
      </details>
    </div>
  );
}
