"use client";

import { useCallback, useEffect, useState } from "react";
import type { IgItem } from "@/lib/instagram";

type L = "tr" | "en" | "ru";

// "3 sa", "2 g" gibi kısa süre etiketi.
function ago(time: string, lang: L) {
  const m = Math.max(1, Math.round((Date.now() - new Date(time).getTime()) / 60000));
  const u = lang === "ru" ? ["мин", "ч", "д", "нед"] : lang === "en" ? ["m", "h", "d", "w"] : ["dk", "sa", "g", "hf"];
  if (m < 60) return `${m} ${u[0]}`;
  if (m < 1440) return `${Math.round(m / 60)} ${u[1]}`;
  if (m < 10080) return `${Math.round(m / 1440)} ${u[2]}`;
  return `${Math.round(m / 10080)} ${u[3]}`;
}

// Yuvarlak story daireleri; dokununca tam ekran oynatıcı (kendiliğinden ilerler, sağ/sol dokunuşla geçilir).
// mode "story": yayındaki story'ler (Instagram halkası). mode "post": story yokken son paylaşımlar (marka halkası).
export function StoryViewer({ items, user, lang = "tr", mode = "story" }: { items: IgItem[]; user: string; lang?: L; mode?: "story" | "post" }) {
  const [open, setOpen] = useState<number | null>(null);
  const [vp, setVp] = useState(0); // video ilerlemesi 0..1
  const next = useCallback(() => setOpen((i) => (i === null ? i : i < items.length - 1 ? i + 1 : null)), [items.length]);
  const prev = useCallback(() => setOpen((i) => (i === null ? i : Math.max(0, i - 1))), []);
  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = before; };
  }, [isOpen, next, prev]);
  useEffect(() => setVp(0), [open]);

  const cur = open === null ? null : items[open];
  const ring = mode === "story" ? "bg-gradient-to-tr from-[#f9a03f] via-[#e8453c] to-[#c13584]" : "bg-gradient-to-tr from-turquoise to-navy";
  const openTxt = lang === "ru" ? "Открыть в Instagram" : lang === "en" ? "Open on Instagram" : "Instagram'da aç";
  return (
    <>
      {items.map((s, i) => (
        <button key={s.id} type="button" onClick={() => setOpen(i)} aria-label={`${mode === "story" ? "Story" : "Instagram"} ${i + 1}`} className="group flex shrink-0 snap-start flex-col items-center gap-1.5">
          <span className={`relative rounded-full p-[2.5px] transition duration-300 group-hover:scale-[1.04] group-active:scale-95 ${ring}`}>
            <span className="block h-[72px] w-[72px] overflow-hidden rounded-full bg-navy ring-[3px] ring-white sm:h-[84px] sm:w-[84px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.thumb} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
            </span>
            {s.type === "VIDEO" && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-navy shadow ring-1 ring-navy/10" aria-hidden>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>
              </span>
            )}
          </span>
          <span suppressHydrationWarning className="text-[11px] font-medium text-navy/60">{ago(s.time, lang)}</span>
        </button>
      ))}

      {cur && open !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 sm:p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label="Instagram">
          <div className="relative h-full w-full overflow-hidden bg-black sm:max-h-[90vh] sm:max-w-[420px] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            {/* Arkada bulanık kopya: dikey olmayan görsellerde siyah boşluk kalmaz */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.thumb} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-2xl" />
            {cur.type === "VIDEO" ? (
              <video key={cur.id} src={cur.url} poster={cur.thumb} autoPlay playsInline className="relative h-full w-full object-contain" onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration) setVp(v.currentTime / v.duration); }} onEnded={next} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={cur.id} src={cur.url} alt="" className="relative h-full w-full object-contain" />
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/65 to-transparent px-3 pb-10 pt-[calc(10px+env(safe-area-inset-top,0px))]">
              <div className="flex gap-1">
                {items.map((_, i) => (
                  <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                    {i < open && <span className="block h-full w-full bg-white" />}
                    {i === open && (cur.type === "VIDEO" ? (
                      <span className="block h-full w-full origin-left bg-white" style={{ transform: `scaleX(${vp})` }} />
                    ) : (
                      <span key={cur.id} className="block h-full w-full origin-left bg-white" style={{ animation: "yp-story 6s linear forwards" }} onAnimationEnd={next} />
                    ))}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="" className="w-[78%] object-contain" />
                </span>
                <span className="text-sm font-semibold text-white">{user}</span>
                <span suppressHydrationWarning className="text-xs text-white/70">{ago(cur.time, lang)}</span>
              </div>
            </div>

            <button type="button" aria-label={lang === "tr" ? "Önceki" : "Previous"} onClick={prev} className="absolute inset-y-0 left-0 z-[5] w-1/3" />
            <button type="button" aria-label={lang === "tr" ? "Sonraki" : "Next"} onClick={next} className="absolute inset-y-0 right-0 z-[5] w-2/3" />
            <button type="button" aria-label={lang === "tr" ? "Kapat" : "Close"} onClick={() => setOpen(null)} className="absolute right-2 top-[calc(22px+env(safe-area-inset-top,0px))] z-20 flex h-10 w-10 items-center justify-center rounded-full text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] pt-14 text-center">
              {mode === "post" && cur.caption && <p className="mb-3 line-clamp-3 text-left text-sm leading-snug text-white/90">{cur.caption}</p>}
              <a href={mode === "post" ? cur.link : `https://www.instagram.com/${user}/`} target="_blank" rel="noopener noreferrer" className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25">
                {openTxt}
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
