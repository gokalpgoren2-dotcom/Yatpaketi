"use client";

import { useEffect, useState } from "react";

// Bölge haritası: tıklayınca tam ekran açılır. Telefonda iki parmakla yakınlaştırılabilir; Esc, dışarı dokunma ya da × ile kapanır.
export function MapZoom(props: { src: string; alt: string; title: string; label: string; open: string; close: string }) {
  return <Zoom {...props} />;
}

// Sayfanın en üstündeki harita: başlık üzerinde, tıklayınca tam ekran açılır.
export function MapHero({ src, alt, open, close, children }: { src: string; alt: string; open: string; close: string; children: React.ReactNode }) {
  return <Zoom src={src} alt={alt} title="" label="" open={open} close={close} hero>{children}</Zoom>;
}

function Zoom({ src, alt, title, label, open: openLabel, close, hero = false, children }: { src: string; alt: string; title: string; label: string; open: string; close: string; hero?: boolean; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);
  const badge = (
    <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-navy shadow-lg">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M11 8v6M8 11h6" /></svg>
      {openLabel}
    </span>
  );
  return (
    <>
      {hero ? (
        <section className="relative isolate overflow-hidden bg-[#05204a]">
          <button type="button" onClick={() => setOpen(true)} aria-label={openLabel} className="group block w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="block h-[24rem] w-full object-cover transition duration-700 group-hover:scale-[1.02] lg:h-[32rem]" />
            <span className="absolute right-4 top-24 lg:top-28">{badge}</span>
          </button>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-9 text-white lg:px-8 lg:pb-14 [&_a]:pointer-events-auto">{children}</div>
        </section>
      ) : (
      <button type="button" onClick={() => setOpen(true)} aria-label={openLabel}
        className="group relative block w-full overflow-hidden rounded-3xl bg-navy shadow-xl shadow-navy/15 transition hover:-translate-y-0.5 hover:shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block h-auto w-full transition duration-500 group-hover:scale-[1.02]" loading="lazy" />
        <span className="absolute bottom-3 right-3">{badge}</span>
      </button>
      )}
      {open && (
        <div role="dialog" aria-modal="true" aria-label={alt} onClick={() => setOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/95 p-3 backdrop-blur-sm lg:p-10">
          <button type="button" onClick={() => setOpen(false)} aria-label={close} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-navy shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl" style={{ touchAction: "pinch-zoom" }} />
        </div>
      )}
    </>
  );
}
