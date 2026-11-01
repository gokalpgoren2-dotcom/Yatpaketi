"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Yana kaydırmalı liste: kenarlarda okla yön gösterir, uçlara gelince ilgili ok kaybolur.
export function Scroller({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: false, right: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setPos({ left: el.scrollLeft > 8, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);
  const go = (d: 1 | -1) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const btn = "absolute top-[38%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-lg ring-1 ring-navy/10 transition hover:bg-turquoise hover:text-white";
  return (
    <div className="relative">
      <div ref={ref} onScroll={update} className={className}>{children}</div>
      {pos.left && (
        <button type="button" aria-label="Geri" onClick={() => go(-1)} className={`${btn} left-1 lg:-left-5`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      )}
      {pos.right && (
        <button type="button" aria-label="İleri" onClick={() => go(1)} className={`${btn} right-1 lg:-right-5`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
    </div>
  );
}
