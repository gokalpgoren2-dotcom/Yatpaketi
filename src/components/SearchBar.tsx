"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Destination } from "@/lib/data";
import type { Category } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";
import { SearchDates } from "./SearchDates";
import { SearchPicker } from "./SearchPicker";
import { BoatIcon } from "./BoatIcon";

const Pin = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;

const field = "w-full cursor-pointer truncate bg-transparent text-base font-medium text-navy outline-none";

const label = "mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-turquoise-dark";

export function SearchBar({ destinations, categories = [], lang = "tr" }: { destinations: Destination[]; categories?: Category[]; lang?: Lang }) {
  const L = t(lang);
  const router = useRouter();
  const [dest, setDest] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (dest) q.set("destinasyon", dest);
    if (type) q.set("tip", type);
    if (from) q.set("giris", from);
    if (from && to) q.set("cikis", to);
    const qs = q.toString();
    router.push(qs ? `${href(lang, "/tekneler")}?${qs}` : href(lang, "/tekneler"));
  }

  return (
    <form
      onSubmit={submit}
      aria-label={L.searchAria}
      className="mx-auto grid w-full max-w-4xl gap-2 rounded-3xl bg-white/95 p-2.5 text-left shadow-2xl shadow-navy/40 ring-1 ring-white/70 backdrop-blur sm:grid-cols-[1fr_1fr_1fr_auto] sm:gap-0 sm:rounded-full sm:p-2 sm:pl-3 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-1 lg:rounded-3xl lg:p-2.5"
    >
      <div className="min-w-0 rounded-2xl px-4 py-2.5 transition hover:bg-mist sm:rounded-full lg:rounded-2xl">
        <SearchPicker
          id="dest" labelClass={label} value={dest} onChange={setDest} title={L.location}
          label={<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>{L.location}</>}
          options={[{ value: "", label: L.all, icon: <BoatIcon name="compass" className="h-[18px] w-[18px]" /> }, ...destinations.map((d) => ({ value: d.slug, label: d.name, sub: d.blurb, icon: <Pin /> }))]}
        />
      </div>
      <div className="min-w-0 rounded-2xl px-4 py-2.5 transition hover:bg-mist sm:rounded-full sm:border-l sm:border-navy/10 lg:rounded-2xl lg:border-l-0 lg:bg-mist/60">
        <SearchPicker
          id="tip" labelClass={label} value={type} onChange={setType} title={L.boatType}
          label={<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v13M12 5l6 9h-6M12 7l-5 7h5M4 18c3 3 13 3 16 0" /></svg>{L.boatType}</>}
          options={[{ value: "", label: L.all, icon: <BoatIcon name="all" className="h-[18px] w-[18px]" /> }, ...categories.map((c) => ({ value: c.name, label: c.name, icon: <BoatIcon name={c.slug} className="h-[18px] w-[18px]" /> }))]}
        />
      </div>
      <div className="min-w-0 rounded-2xl px-4 py-2.5 transition hover:bg-mist sm:rounded-full sm:border-l sm:border-navy/10 lg:rounded-2xl lg:border-l-0 lg:bg-mist/60">
        <SearchDates lang={lang} start={from} end={to} onChange={(a, b) => { setFrom(a); setTo(b); }} labelClass={label} fieldClass={field} icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>} />
      </div>
      <button type="submit" aria-label={L.searchBoats} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-turquoise px-7 font-semibold text-white shadow-lg shadow-turquoise/30 transition hover:bg-turquoise-dark sm:ml-2 sm:self-center sm:rounded-full lg:ml-0 lg:self-stretch lg:rounded-2xl">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <span>{L.searchBoats}</span>
      </button>
    </form>
  );
}
