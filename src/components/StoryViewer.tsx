"use client";

import { useEffect, useState } from "react";
import type { IgItem } from "@/lib/instagram";

// Story kartları: dokununca tam ekran, ileri/geri ve kapat.
export function StoryViewer({ items, user }: { items: IgItem[]; user: string }) {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : Math.min(items.length - 1, i + 1)));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : Math.max(0, i - 1)));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, items.length]);
  const cur = open === null ? null : items[open];
  return (
    <>
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0">
        {items.map((s, i) => (
          <button key={s.id} type="button" onClick={() => setOpen(i)} aria-label={`Story ${i + 1}`} className="group shrink-0 rounded-[1.4rem] bg-gradient-to-tr from-[#f9a03f] via-[#e8453c] to-[#c13584] p-[3px]">
            <span className="block h-44 w-28 overflow-hidden rounded-[1.2rem] bg-navy ring-2 ring-white sm:h-52 sm:w-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.thumb} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </span>
          </button>
        ))}
      </div>
      {cur && open !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-3" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <div className="relative h-full max-h-[88vh] w-full max-w-sm overflow-hidden rounded-3xl bg-black" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
              {items.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= open ? "bg-white" : "bg-white/35"}`} />)}
            </div>
            {cur.type === "VIDEO" ? (
              <video key={cur.id} src={cur.url} autoPlay playsInline controls className="h-full w-full object-contain" onEnded={() => setOpen(open < items.length - 1 ? open + 1 : null)} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={cur.id} src={cur.url} alt="" className="h-full w-full object-contain" />
            )}
            <button type="button" aria-label="Önceki" onClick={() => setOpen(Math.max(0, open - 1))} className="absolute inset-y-14 left-0 w-1/4" />
            <button type="button" aria-label="Sonraki" onClick={() => setOpen(open < items.length - 1 ? open + 1 : null)} className="absolute inset-y-14 right-0 w-1/4" />
            <button type="button" aria-label="Kapat" onClick={() => setOpen(null)} className="absolute right-3 top-8 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-2xl text-white">×</button>
            <a href={`https://www.instagram.com/${user}/`} target="_blank" rel="noopener noreferrer" className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 text-center text-sm font-medium text-white">@{user} · Instagram&apos;da aç</a>
          </div>
        </div>
      )}
    </>
  );
}
