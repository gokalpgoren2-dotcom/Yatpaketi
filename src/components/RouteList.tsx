"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteChart } from "./RouteChart";
import { ROUTE_UI, type CardData } from "@/lib/routes";
import type { Lang } from "@/lib/i18n";

export function RouteCard({ r, lang }: { r: CardData; lang: Lang }) {
  const U = ROUTE_UI[lang];
  return (
    <Link href={r.href} className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-navy/15">
      <div className="relative aspect-[600/340] overflow-hidden">
        <div className="h-full w-full transition duration-700 group-hover:scale-[1.04]">
          <RouteChart id={`c-${r.slug}`} stops={r.chart} loop={r.loop} compact label={U.chartLabel} />
        </div>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {r.days > 0 && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-navy shadow">{U.days(r.days)}</span>}
          {r.greek && <span className="rounded-full bg-turquoise px-2.5 py-1 text-[11px] font-bold text-navy shadow">{U.greek}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-turquoise-dark">
          {r.from} <span aria-hidden>{r.loop ? "⟲" : "⟶"}</span> {r.to}
          <span className="font-medium normal-case tracking-normal text-navy/45">· {r.loop ? U.loop : U.oneway}</span>
        </p>
        <h3 className="font-display mt-2 text-xl font-semibold text-navy">{r.title}</h3>
        {r.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy/65">{r.excerpt}</p>}
        <p className="mt-auto pt-4 text-sm font-semibold text-turquoise-dark">{U.route} <span className="inline-block transition group-hover:translate-x-1">→</span></p>
      </div>
    </Link>
  );
}

// Rota listesi: kalkış limanına ve Yunan adalarına göre süzülebilir kartlar.
export function RouteList({ routes, lang }: { routes: CardData[]; lang: Lang }) {
  const U = ROUTE_UI[lang];
  const ports = useMemo(() => Array.from(new Set(routes.map((r) => r.from))), [routes]);
  const hasGreek = routes.some((r) => r.greek);
  const [f, setF] = useState<string>("all");
  const shown = routes.filter((r) => (f === "all" ? true : f === "greek" ? r.greek : f === "loop" ? r.loop : r.from === f));
  const chip = (k: string, label: string, n: number) => (
    <button key={k} type="button" onClick={() => setF(k)} aria-pressed={f === k}
      className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${f === k ? "bg-navy text-white shadow-lg shadow-navy/20" : "bg-white text-navy ring-1 ring-navy/15 hover:ring-turquoise"}`}>
      {label} <span className={f === k ? "text-turquoise" : "text-navy/40"}>{n}</span>
    </button>
  );
  return (
    <>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-wrap lg:px-0" role="group" aria-label={U.filter}>
        {chip("all", U.all, routes.length)}
        {ports.map((p) => chip(p, p, routes.filter((r) => r.from === p).length))}
        {chip("loop", U.loop, routes.filter((r) => r.loop).length)}
        {hasGreek && chip("greek", U.greek, routes.filter((r) => r.greek).length)}
      </div>
      <p className="mt-4 text-sm text-navy/50" aria-live="polite">{U.count(shown.length)}</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {shown.map((r) => <RouteCard key={r.slug} r={r} lang={lang} />)}
      </div>
    </>
  );
}
