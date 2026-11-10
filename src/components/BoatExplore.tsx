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
    <section id="kesfet" className="mt-10 scroll-mt-28">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-turquoise">{T.eb}</p>
          <h2 className="font-display mt-1 text-2xl font-medium text-navy lg:text-3xl">{T.h}</h2>
          <p className="mt-1 max-w-2xl text-sm text-navy/60">{T.p}</p>
        </div>
      </div>

      {open === "inline" ? (
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-navy/10" style={{ height: "min(78vh, 680px)" }}>
          <iframe src={src} title={`${name} 360°`} className="h-full w-full border-0" allow="fullscreen" />
          <button type="button" onClick={() => setOpen("full")} className="absolute right-3 top-3 rounded-full bg-navy/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-navy">
            {ru ? "Во весь экран" : en ? "Full screen" : "Tam ekran"}
          </button>
        </div>
      ) : (
        <button type="button" onClick={start} className="group relative block w-full overflow-hidden rounded-3xl text-left ring-1 ring-navy/10" style={{ background: m.bg }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.cover} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-80 blur-2xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.cover} alt={`${name} 360°`} loading="lazy" className="relative mx-auto block aspect-[2/1] w-full max-w-4xl object-contain transition duration-500 group-hover:scale-[1.02]" />
          <span className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 p-4 lg:p-6">
            <span className="flex flex-wrap gap-2">
              {T.chips.map((c) => <span key={c} className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy">{c}</span>)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-turquoise px-5 py-2.5 text-sm font-bold text-white shadow-lg transition group-hover:bg-turquoise-dark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 12a9 4 0 1 0 18 0 9 4 0 1 0-18 0" /><path d="M12 3v18" /></svg>
              {T.btn}
            </span>
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
