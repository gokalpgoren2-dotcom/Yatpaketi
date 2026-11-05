"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "./Photo";

// Yat sayfası fotoğrafları: büyük fotoğrafta oklar ve kaydırma, küçük resimlerle geçiş,
// dokununca tam ekran görünüm. Başka sayfaya gitmez.
export function BoatGallery({ images, name, badge, lang = "tr" }: { images: string[]; name: string; badge?: React.ReactNode; lang?: "tr" | "en" | "ru" }) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const n = images.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);
  const track = useRef<HTMLDivElement>(null);
  // Şeridi istenen fotoğrafa kaydırır (oklar, küçük resimler, dokunma)
  const show = (k: number) => {
    const t = (k + n) % n;
    setI(t);
    const el = track.current;
    if (el) el.scrollTo({ left: t * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const k = Math.round(el.scrollLeft / el.clientWidth);
    if (k !== i && k >= 0 && k < n) setI(k);
  };
  const touch = useRef<number | null>(null);
  const thumbs = useRef<HTMLUListElement>(null);
  const en = lang !== "tr";
  const ru = lang === "ru";

  useEffect(() => {
    const el = thumbs.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [i]);

  // Tam ekrandan dönünce şerit aynı fotoğrafta olsun
  useEffect(() => {
    if (full) return;
    const el = track.current;
    if (el && Math.round(el.scrollLeft / el.clientWidth) !== i) el.scrollTo({ left: i * el.clientWidth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

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
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-mist lg:aspect-[16/8]">
        {/* Parmakla kaydırılan şerit; fotoğrafa dokununca tam ekran açılır */}
        <div ref={track} onScroll={onScroll} className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth">
          {images.map((src, k) => (
            <button key={src} type="button" onClick={() => setFull(true)} className="relative h-full w-full shrink-0 cursor-zoom-in snap-center" aria-label={`${ru ? "Фото" : en ? "Photo" : "Fotoğraf"} ${k + 1}`}>
              {Math.abs(k - i) <= 2 || k === 0 ? <Photo src={src} alt={`${name} ${k + 1}`} priority={k === 0} sizes="(min-width:1280px) 1200px, 100vw" className="object-cover" /> : null}
            </button>
          ))}
        </div>
        {badge}
        <button type="button" onClick={() => setFull(true)} className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy shadow-lg" aria-label={ru ? "Открыть на весь экран" : en ? "Open full screen" : "Tam ekran aç"}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
        </button>
        {n > 1 && (
          <>
            <button type="button" onClick={() => show(i - 1)} className={`${arrow} left-3`} aria-label={ru ? "Предыдущее фото" : en ? "Previous photo" : "Önceki fotoğraf"}>‹</button>
            <button type="button" onClick={() => show(i + 1)} className={`${arrow} right-3`} aria-label={ru ? "Следующее фото" : en ? "Next photo" : "Sonraki fotoğraf"}>›</button>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-navy/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{i + 1} / {n}</span>
          </>
        )}
      </div>

      {n > 1 && (
        <ul ref={thumbs} className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((src, k) => (
            <li key={src} className="shrink-0">
              <button type="button" onClick={() => show(k)} aria-label={`${ru ? "Фото" : en ? "Photo" : "Fotoğraf"} ${k + 1}`} aria-current={k === i}
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
            <span className="text-sm text-white/70">{i + 1} / {n} · {ru ? "Листайте или нажимайте слева/справа" : en ? "Swipe or tap left/right" : "Kaydırın ya da sağa/sola dokunun"}</span>
            <button type="button" onClick={() => setFull(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl" aria-label={ru ? "Закрыть" : en ? "Close" : "Kapat"}>×</button>
          </div>
          <div className="relative flex-1" {...swipe} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); if ((e.target as HTMLElement).closest("button")) return; go(e.clientX - r.left < r.width / 2 ? -1 : 1); }}>
            <Photo src={images[i]} alt={`${name} ${i + 1}`} sizes="100vw" className="object-contain" />
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className={`${arrow} left-3`} aria-label={ru ? "Предыдущее фото" : en ? "Previous photo" : "Önceki fotoğraf"}>‹</button>
                <button type="button" onClick={() => go(1)} className={`${arrow} right-3`} aria-label={ru ? "Следующее фото" : en ? "Next photo" : "Sonraki fotoğraf"}>›</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
