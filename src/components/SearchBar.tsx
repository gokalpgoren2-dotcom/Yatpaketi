"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Destination } from "@/lib/data";
import type { Category } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";

const field = "w-full cursor-pointer truncate bg-transparent text-base font-medium text-navy outline-none";
const label = "mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-turquoise-dark";

export function SearchBar({ destinations, categories = [], lang = "tr" }: { destinations: Destination[]; categories?: Category[]; lang?: Lang }) {
  const L = t(lang);
  const router = useRouter();
  const [dest, setDest] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (dest) q.set("destinasyon", dest);
    if (type) q.set("tip", type);
    if (from) q.set("giris", from);
    const qs = q.toString();
    router.push(qs ? `${href(lang, "/tekneler")}?${qs}` : href(lang, "/tekneler"));
  }

  return (
    <form
      onSubmit={submit}
      aria-label={L.searchAria}
      className="mx-auto grid w-full max-w-4xl gap-2 rounded-3xl bg-white/95 p-2.5 text-left shadow-2xl shadow-navy/40 ring-1 ring-white/70 backdrop-blur sm:grid-cols-[1fr_1fr_1fr_auto] sm:gap-0 sm:rounded-full sm:p-2 sm:pl-3"
    >
      <div className="min-w-0 rounded-2xl px-4 py-2.5 transition hover:bg-mist sm:rounded-full">
        <label htmlFor="dest" className={label}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
          {L.location}
        </label>
        <select id="dest" value={dest} onChange={(e) => setDest(e.target.value)} className={field}>
          <option value="">{L.all}</option>
          {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
      </div>
      <div className="min-w-0 rounded-2xl px-4 py-2.5 transition hover:bg-mist sm:rounded-full sm:border-l sm:border-navy/10">
        <label htmlFor="tip" className={label}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v13M12 5l6 9h-6M12 7l-5 7h5M4 18c3 3 13 3 16 0" /></svg>
          {L.boatType}
        </label>
        <select id="tip" value={type} onChange={(e) => setType(e.target.value)} className={field}>
          <option value="">{L.all}</option>
          {categories.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div className="min-w-0 rounded-2xl px-4 py-2.5 transition hover:bg-mist sm:rounded-full sm:border-l sm:border-navy/10">
        <label htmlFor="from" className={label}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>
          {L.date}
        </label>
        <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={field} />
      </div>
      <button type="submit" aria-label={L.searchBoats} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-turquoise px-7 font-semibold text-white shadow-lg shadow-turquoise/30 transition hover:bg-turquoise-dark sm:ml-2 sm:self-center sm:rounded-full">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <span>{L.searchBoats}</span>
      </button>
    </form>
  );
}
