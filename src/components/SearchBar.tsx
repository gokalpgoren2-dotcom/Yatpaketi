"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Destination } from "@/lib/data";
import { href, t, type Lang } from "@/lib/i18n";

export function SearchBar({ destinations, lang = "tr" }: { destinations: Destination[]; lang?: Lang }) {
  const L = t(lang);
  const router = useRouter();
  const [dest, setDest] = useState("");
  const [from, setFrom] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (dest) q.set("destinasyon", dest);
    if (from) q.set("giris", from);
    const qs = q.toString();
    router.push(qs ? `${href(lang, "/tekneler")}?${qs}` : href(lang, "/tekneler"));
  }

  return (
    <form
      onSubmit={submit}
      aria-label={L.searchAria}
      className="mx-auto flex w-full max-w-2xl items-stretch rounded-full bg-white p-1.5 pl-5 shadow-2xl shadow-navy/30 ring-1 ring-white/60"
    >
      <div className="min-w-0 flex-1 py-1.5">
        <label htmlFor="dest" className="block text-[11px] font-semibold uppercase tracking-wide text-navy/50">{L.location}</label>
        <select id="dest" value={dest} onChange={(e) => setDest(e.target.value)} className="w-full truncate bg-transparent text-base font-medium text-navy outline-none">
          <option value="">{L.all}</option>
          {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
      </div>
      <div className="my-2 w-px bg-navy/15" />
      <div className="min-w-0 flex-1 py-1.5 pl-4">
        <label htmlFor="from" className="block text-[11px] font-semibold uppercase tracking-wide text-navy/50">{L.date}</label>
        <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-transparent text-base font-medium text-navy outline-none" />
      </div>
      <button type="submit" aria-label={L.searchBoats} className="ml-2 flex h-14 w-14 shrink-0 items-center justify-center self-center rounded-full bg-turquoise text-white transition hover:bg-turquoise-dark">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      </button>
    </form>
  );
}
