"use client";

import { useState } from "react";
import { ReservationForm } from "./ReservationForm";
import { DateRangePicker } from "./DateRangePicker";
import { recordWhatsapp } from "@/app/tekneler/[slug]/talep";
import { href, t, type Lang } from "@/lib/i18n";

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

type Props = { boatSlug: string; boatName: string; maxGuests: number; whatsapp: string; lang?: Lang };

// Tekne sayfasındaki talep alanı: ana yol WhatsApp (hazır mesajla), ikinci yol form.
export function RequestPanel({ boatSlug, boatName, maxGuests, whatsapp, lang = "tr" }: Props) {
  const L = t(lang);
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString(L.locale, { day: "numeric", month: "long", year: "numeric" });
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guests, setGuests] = useState(Math.min(2, maxGuests));
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (!whatsapp) return <ReservationForm boatSlug={boatSlug} boatName={boatName} maxGuests={maxGuests} lang={lang} />;

  function message() {
    const url = `${window.location.origin}${href(lang, `/tekneler/${boatSlug}`)}`;
    const lines = [
      L.waGreeting(boatName),
      "",
      `${L.waDate}: ${fmt(start)} – ${fmt(end)}`,
      `${L.waGuests}: ${guests}`,
    ];
    if (name.trim()) lines.push(`${L.waName}: ${name.trim()}`);
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
