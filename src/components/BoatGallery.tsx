"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "./Photo";

// Yat sayfası fotoğrafları: büyük fotoğrafta oklar ve kaydırma, küçük resimlerle geçiş,
// dokununca tam ekran görünüm. Başka sayfaya gitmez.
export function BoatGallery({ images, name, badge, lang = "tr" }: { images: string[]; name: string; badge?: React.ReactNode; lang?: "tr" | "en" }) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const n = images.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);
  const touch = useRef<number | null>(null);
  const thumbs = useRef<HTMLUListElement>(null);
  const en = lang === "en";

  useEffect(() => {
    const el = thumbs.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [i]);

  useEffect(() => {
    if (!full) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => { touch.current = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touch.current == null) return;
      const dx = e.changedTouches[0].clientX - touch.current;
      touch.current = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    },
  };
  const arrow = "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-navy shadow-lg transition hover:bg-white";

  return (
    <div className="mt-8 space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-mist lg:aspect-[16/8]" {...swipe}>
        <button type="button" onClick={() => setFull(true)} className="absolute inset-0 block h-full w-full cursor-zoom-in" aria-label={en ? "Open full screen" : "Tam ekran aç"}>
          {images.map((src, k) => (
            <span key={src} className={`absolute inset-0 transition-opacity duration-300 ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}>
              {Math.abs(k - i) <= 1 || k === 0 ? <Photo src={src} alt={`${name} ${k + 1}`} priority={k === 0} sizes="(min-width:1280px) 1200px, 100vw" className="object-cover" /> : null}
            </span>
          ))}
        </button>
        {badge}
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className={`${arrow} left-3`} aria-label={en ? "Previous photo" : "Önceki fotoğraf"}>‹</button>
            <button type="button" onClick={() => go(1)} className={`${arrow} right-3`} aria-label={en ? "Next photo" : "Sonraki fotoğraf"}>›</button>
            <span className="absolute bottom-3 right-3 rounded-full bg-navy/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{i + 1} / {n}</span>
          </>
        )}
      </div>

      {n > 1 && (
        <ul ref={thumbs} className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((src, k) => (
            <li key={src} className="shrink-0">
              <button type="button" onClick={() => setI(k)} aria-label={`${en ? "Photo" : "Fotoğraf"} ${k + 1}`} aria-current={k === i}
                className={`relative block h-16 w-24 overflow-hidden rounded-xl bg-mist ring-2 transition sm:h-20 sm:w-28 ${k === i ? "ring-turquoise" : "ring-transparent opacity-70 hover:opacity-100"}`}>
                <Photo src={src} alt="" sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {full && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label={name}>
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm text-white/70">{i + 1} / {n}</span>
            <button type="button" onClick={() => setFull(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl" aria-label={en ? "Close" : "Kapat"}>×</button>
          </div>
          <div className="relative flex-1" {...swipe}>
            <Photo src={images[i]} alt={`${name} ${i + 1}`} sizes="100vw" className="object-contain" />
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className={`${arrow} left-3`} aria-label={en ? "Previous photo" : "Önceki fotoğraf"}>‹</button>
                <button type="button" onClick={() => go(1)} className={`${arrow} right-3`} aria-label={en ? "Next photo" : "Sonraki fotoğraf"}>›</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
