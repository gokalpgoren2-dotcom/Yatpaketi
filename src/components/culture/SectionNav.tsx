"use client";

import { useEffect, useState } from "react";

// Sayfa içi bölüm menüsü: üstte yapışık durur, okunan bölümü vurgular.
export function SectionNav({ items }: { items: string[][] }) {
  const [act, setAct] = useState("");
  useEffect(() => {
    const obs = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setAct(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    items.forEach(([, id]) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [items]);
  return (
    <nav className="sticky top-16 z-30 border-b border-navy/5 bg-white/85 backdrop-blur-md lg:top-20" aria-label="Bölümler">
      <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 lg:px-8">
        {items.map(([label, id]) => (
          <a key={id} href={`#${id}`} aria-current={act === id ? "true" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${act === id ? "bg-navy text-white shadow-md shadow-navy/20" : "text-navy/70 hover:bg-mist hover:text-navy"}`}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
