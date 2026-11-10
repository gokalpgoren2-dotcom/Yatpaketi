"use client";

import { useEffect, useState } from "react";
import { MAKET } from "@/lib/maket";
import type { Lang } from "@/lib/i18n";

// Yat sayfasında "Yatı keşfedin" bölümü: 360° dış görünüm ve odalara dokunularak incelenen plan.
// Görüntüleyici ağırdır; yalnızca "Keşfet"e basılınca yüklenir. Telefonda tam ekran açılır.
export function BoatExplore({ slug, name, lang }: { slug: string; name: string; lang: Lang }) {
  const m = MAKET[slug];
  const [open, setOpen] = useState<null | "inline" | "full">(null);
  const ru = lang === "ru", en = lang !== "tr";
  const T = {
    eb: ru ? "360° и план яхты" : en ? "360° & deck plan" : "360° ve kabin planı",
    h: ru ? "Осмотрите яхту" : en ? "Explore the yacht" : "Yatı keşfedin",
    p: ru
      ? "Поверните яхту на 360°, откройте палубы и нажмите на любую каюту, чтобы увидеть кровать, удобства и фото."
      : en
        ? "Turn the yacht 360°, open each deck and tap any cabin to see its bed, amenities and photo."
        : "Yatı 360° çevirin, katları açın; bir kabine dokunarak yatağını, donanımını ve fotoğrafını görün.",
    btn: ru ? "Открыть" : en ? "Explore" : "Keşfet",
    chips: ru ? ["360° вид", "Палубный план", `${m?.cabins ?? ""} кают`] : en ? ["360° view", "Deck plan", `${m?.cabins ?? ""} cabins`] : ["360° görünüm", "Güverte planı", `${m?.cabins ?? ""} kabin`],
    close: ru ? "Закрыть" : en ? "Close" : "Kapat",
  };

  useEffect(() => {
    if (open !== "full") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  if (!m) return null;
  const src = m.src;
  const start = () => setOpen(window.matchMedia("(min-width: 768px)").matches ? "inline" : "full");

  return (
    <section id="kesfet" className="mt-6 scroll-mt-28">
      {open === "inline" ? (
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-navy/10" style={{ height: "min(78vh, 680px)" }}>
          <iframe src={src} title={`${name} 360°`} className="h-full w-full border-0" allow="fullscreen" />
          <div className="absolute right-3 top-3 flex gap-2">
            <button type="button" onClick={() => setOpen("full")} className="rounded-full bg-navy/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-navy">
              {ru ? "Во весь экран" : en ? "Full screen" : "Tam ekran"}
            </button>
            <button type="button" onClick={() => setOpen(null)} className="rounded-full bg-navy/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-navy">{T.close}</button>
          </div>
        </div>
      ) : (
        /* Kompakt şerit: küçük önizleme, kısa açıklama ve düğme */
        <button type="button" onClick={start} className="group flex w-full items-center gap-3 rounded-2xl bg-white p-2.5 text-left shadow-sm ring-1 ring-navy/10 transition hover:shadow-md hover:ring-turquoise/40 sm:gap-4 sm:p-3">
          <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-32" style={{ background: m.bg }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.cover} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full scale-125 object-cover blur-md" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.cover} alt={`${name} 360°`} loading="lazy" className="relative h-full w-full object-contain transition duration-500 group-hover:scale-105" />
            <span className="absolute bottom-1 left-1 rounded-full bg-navy/85 px-1.5 py-0.5 text-[10px] font-bold text-white">360°</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-turquoise">{T.eb}</span>
            <span className="font-display block text-base font-semibold leading-tight text-navy sm:text-lg">{T.h}</span>
            <span className="mt-0.5 block truncate text-xs text-navy/55 sm:text-sm">{T.chips.join(" · ")}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-turquoise px-3 py-2 text-sm font-bold text-white transition group-hover:bg-turquoise-dark sm:px-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 12a9 4 0 1 0 18 0 9 4 0 1 0-18 0" /><path d="M12 3v18" /></svg>
            <span className="hidden sm:inline">{T.btn}</span>
          </span>
        </button>
      )}

      {open === "full" && (
        <div className="fixed inset-0 z-[90] bg-[#0e2a47]" role="dialog" aria-modal="true" aria-label={`${name} 360°`}>
          <iframe src={src} title={`${name} 360°`} className="h-full w-full border-0" />
          <button type="button" onClick={() => setOpen(null)} className="absolute right-3 top-[calc(12px+env(safe-area-inset-top,0px))] flex h-10 items-center gap-1.5 rounded-full bg-navy/85 px-4 text-sm font-semibold text-white backdrop-blur">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
            {T.close}
          </button>
        </div>
      )}
    </section>
  );
}
