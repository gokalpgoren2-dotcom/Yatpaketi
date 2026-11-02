"use client";

import { useEffect, useRef, useState } from "react";
import type { Activity, RouteDay } from "@/lib/routes";

const ICON: Record<Activity, string> = {
  swim: "M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 13l3-5 4 3 2-2M16 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3",
  snorkel: "M3 10h12a3 3 0 0 1 0 6h-2l-2-2-2 2H7a4 4 0 0 1-4-4v-2ZM19 4v8a4 4 0 0 1-4 4",
  walk: "M13 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M10 21l2-6 3 3v3M8 11l3-3 3 2 3 1M12 8l-1 5",
  dinner: "M5 3v8a2 2 0 0 0 2 2v8M9 3v8M7 3v4M17 21V3c-2 1-3 3-3 6v4h3",
  sunset: "M3 18h18M5 21h14M12 3v3M4.2 8.2l2 2M19.8 8.2l-2 2M7 18a5 5 0 0 1 10 0",
  history: "M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10h20L12 3 2 10Z",
  market: "M4 7h16l-1.5 13h-13L4 7ZM9 7a3 3 0 0 1 6 0",
  sail: "M12 3v14M12 3l7 12h-7M12 6 6 15h6M3 19c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0",
  passport: "M6 3h12v18H6zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6M9 17h6",
  beach: "M3 20h18M12 20 7 8M7 8a8 8 0 0 1 12 2L7 8ZM4 14l3-1",
  relax: "M4 15h16M6 15v4M18 15v4M4 15l2-6h12l2 6M9 9V6h6v3",
};

function Ic({ a }: { a: Activity }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICON[a]} />
    </svg>
  );
}

// Gün gün program: kaydırdıkça soldaki rota çizgisi dolar, okunan gün vurgulanır.
export function RouteDays({ days, dayLabel, acts, from, to }: { days: RouteDay[]; dayLabel: string; acts: Record<Activity, string>; from: string; to: string }) {
  const wrap = useRef<HTMLOListElement>(null);
  const [fill, setFill] = useState(0);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;
      setFill(Math.max(0, Math.min(1, (mid - r.top) / r.height)));
      const items = el.querySelectorAll<HTMLElement>("[data-day]");
      let a = 0;
      for (let i = 0; i < items.length; i++) if (items[i].getBoundingClientRect().top < mid) a = i;
      setActive(a);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <ol ref={wrap} className="relative mt-12">
      <span className="absolute bottom-6 left-[1.6rem] top-6 w-[3px] rounded-full bg-navy/10 lg:left-[2.1rem]" aria-hidden />
      <span className="absolute left-[1.6rem] top-6 w-[3px] rounded-full bg-gradient-to-b from-turquoise to-[#0b6a86] transition-[height] duration-300 lg:left-[2.1rem]" style={{ height: `calc((100% - 3rem) * ${fill})` }} aria-hidden />
      {days.map((d, i) => {
        const on = i <= active;
        const first = i === 0, last = i === days.length - 1;
        return (
          <li key={d.n} data-day className="relative pb-6 pl-[4.5rem] last:pb-0 lg:pl-28">
            <span className={`absolute left-0 top-3 flex h-[3.4rem] w-[3.4rem] flex-col items-center justify-center rounded-2xl text-center ring-4 ring-white transition duration-500 lg:h-[4.4rem] lg:w-[4.4rem] ${on ? "bg-navy text-white shadow-lg shadow-navy/25" : "bg-mist text-navy/50"}`}>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-70 lg:text-[10px]">{dayLabel}</span>
              <span className="font-display text-xl font-semibold leading-none lg:text-2xl">{d.n}</span>
            </span>
            <div className={`rounded-3xl bg-white p-5 ring-1 transition duration-500 lg:p-7 ${i === active ? "shadow-xl shadow-navy/10 ring-turquoise/40" : "ring-navy/5"}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-display text-xl font-semibold text-navy lg:text-2xl">{d.title}</h3>
                {(first || last) && (
                  <span className="rounded-full bg-turquoise/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-turquoise-dark">
                    {first ? `⚓ ${from}` : `⚑ ${to}`}
                  </span>
                )}
              </div>
              <p className="mt-2 leading-relaxed text-navy/65">{d.text}</p>
              {d.acts.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {d.acts.map((a) => (
                    <li key={a} className="flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-navy/70"><Ic a={a} />{acts[a]}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
