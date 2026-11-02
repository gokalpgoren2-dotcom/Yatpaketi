"use client";

import { useEffect, useRef, useState } from "react";

// Kiralama süreci: kaydırdıkça dolan rota çizgisi, çizgi üzerinde ilerleyen yelkenli ve üstte "Adım x / y" çubuğu.
// Adım kartları sunucuda çizilir; bu bileşen yalnızca [data-step] öğelerini izler.
export function ProcessTrack({ titles, stepLabel, children }: { titles: string[]; stepLabel: string; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.5;
      setP(Math.max(0, Math.min(1, (mid - r.top) / r.height)));
      setInView(r.top < window.innerHeight * 0.35 && r.bottom > window.innerHeight * 0.6);
      const items = el.querySelectorAll<HTMLElement>("[data-step]");
      let a = 0;
      for (let i = 0; i < items.length; i++) if (items[i].getBoundingClientRect().top < mid) a = i;
      setActive(a);
      items.forEach((it, i) => it.toggleAttribute("data-on", i <= a));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, []);
  const n = titles.length;
  return (
    <div ref={box} className="relative">
      {/* üst ilerleme çubuğu */}
      <div className={`pointer-events-none sticky top-[4.75rem] z-30 flex justify-center transition duration-300 lg:top-24 ${inView ? "opacity-100" : "-translate-y-2 opacity-0"}`} aria-hidden={!inView}>
        <div className="mx-5 flex w-full max-w-md items-center gap-3 rounded-full bg-navy/95 py-2 pl-2 pr-5 text-white shadow-xl shadow-navy/25 backdrop-blur">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-turquoise text-sm font-bold text-navy">{active + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{titles[active]}</p>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-turquoise transition-[width] duration-300" style={{ width: `${((active + 1) / n) * 100}%` }} /></div>
          </div>
          <span className="shrink-0 text-xs text-white/60">{stepLabel} {active + 1}/{n}</span>
        </div>
      </div>

      {/* rota çizgisi */}
      <div className="absolute bottom-0 left-[1.65rem] top-0 w-1 lg:left-1/2 lg:-translate-x-1/2" aria-hidden>
        <div className="absolute inset-0 rounded-full" style={{ backgroundImage: "linear-gradient(to bottom, rgba(6,38,75,0.14) 50%, transparent 50%)", backgroundSize: "4px 14px" }} />
        <div className="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-turquoise to-[#0b6a86]" style={{ height: `${p * 100}%` }} />
        <div className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-[top] duration-150" style={{ top: `${p * 100}%` }}>
          <span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-turquoise/25 blur-md" />
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg shadow-navy/20 ring-2 ring-turquoise">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden style={{ animation: "sail-sway 3s ease-in-out infinite", transformOrigin: "50% 80%" }}>
              <path d="M12 3v13l7-1L12 3Z" fill="#1bb4c4" />
              <path d="M11 6v9H6l5-9Z" fill="#06264b" />
              <path d="M4 17h16l-2 3H6l-2-3Z" fill="#06264b" />
            </svg>
          </span>
        </div>
      </div>
      <div className="-mt-12">{children}</div>
    </div>
  );
}
