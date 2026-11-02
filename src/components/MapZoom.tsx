"use client";

import { useEffect, useState } from "react";

// Bölge haritası: tıklayınca tam ekran açılır. Telefonda iki parmakla yakınlaştırılabilir; Esc, dışarı dokunma ya da × ile kapanır.
export function MapZoom({ src, alt, title, label, open: openLabel, close }: { src: string; alt: string; title: string; label: string; open: string; close: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={openLabel}
        className="group block w-full overflow-hidden rounded-3xl bg-navy p-3 text-left shadow-xl shadow-navy/15 transition hover:-translate-y-0.5 hover:shadow-2xl lg:p-4">
        <div className="px-3 pb-3 pt-2 lg:px-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-turquoise">{label}</p>
          <p className="font-display mt-1 text-xl font-semibold text-white">{title}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="block h-auto w-full transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-navy shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M11 8v6M8 11h6" /></svg>
            {openLabel}
          </span>
        </div>
      </button>
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
