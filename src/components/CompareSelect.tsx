"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Photo } from "@/components/Photo";
import { Placeholder } from "@/components/Placeholder";
import { href, type Lang } from "@/lib/i18n";

export type PickBoat = { slug: string; name: string; type: string; port: string; length: number; guests: number; image: string | null; hue: number };

const SEARCH = "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4";
function Ic({ d, size = 18, className = "" }: { d: string; size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}><path d={d} /></svg>;
}

function Thumb({ b, className }: { b: PickBoat; className: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden bg-mist ${className}`}>
      {b.image ? <Photo src={b.image} alt="" sizes="160px" className="object-cover" /> : <Placeholder hue={b.hue} label={false} className="h-full w-full" />}
    </span>
  );
}

const meta = (b: PickBoat, en: boolean, ru = false) => [b.type, b.length > 0 ? `${b.length} ${ru ? "м" : "m"}` : "", b.guests ? (ru ? `${b.guests} гостей` : en ? `${b.guests} guests` : `${b.guests} kişi`) : ""].filter(Boolean).join(" · ");

// Tek bir yat seçme alanı: aranabilir, fotoğraflı liste. Telefonda alttan açılan panel.
function Picker({ label, boats, value, exclude, onPick, en, ru }: { label: string; boats: PickBoat[]; value: string; exclude: string; onPick: (s: string) => void; en: boolean; ru?: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const cur = boats.find((b) => b.slug === value);
  const norm = (s: string) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "");
  const list = boats.filter((b) => b.slug !== exclude && (!q || norm(`${b.name} ${b.type} ${b.port}`).includes(norm(q))));

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent | TouchEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    document.addEventListener("keydown", esc);
    if (window.matchMedia("(min-width: 640px)").matches) search.current?.focus();
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("touchstart", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { setOpen((o) => !o); setQ(""); }}
        className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition ${open ? "border-turquoise bg-white ring-2 ring-turquoise/25" : cur ? "border-navy/10 bg-white hover:border-turquoise/60" : "border-dashed border-navy/20 bg-mist hover:border-turquoise/60"}`}
      >
        {cur ? (
          <Thumb b={cur} className="h-16 w-20 rounded-xl sm:h-20 sm:w-28" />
        ) : (
          <span className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-white text-turquoise-dark ring-1 ring-navy/10 sm:h-20 sm:w-28">
            <Ic d="M12 5v14M5 12h14" size={26} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-navy/45">{label}</span>
          <span className="font-display mt-0.5 block truncate text-lg font-semibold text-navy">{cur ? cur.name : ru ? "Выберите яхту" : en ? "Choose a yacht" : "Yat seçin"}</span>
          {cur && <span className="block truncate text-xs text-navy/55">{meta(cur, en, ru)}</span>}
        </span>
        <Ic d="M6 9l6 6 6-6" className={`mr-1 shrink-0 text-navy/40 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-[2px] sm:hidden" aria-hidden onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-3xl bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl sm:absolute sm:inset-x-0 sm:bottom-auto sm:top-[calc(100%+0.5rem)] sm:max-h-[26rem] sm:rounded-2xl sm:ring-1 sm:ring-navy/10">
            <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-navy/15 sm:hidden" aria-hidden />
            <div className="shrink-0 p-3">
              <div className="relative">
                <Ic d={SEARCH} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" />
                <input
                  ref={search}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={ru ? "Поиск по названию, типу или порту" : en ? "Search by name, type or port" : "Yat adı, tipi ya da liman ara"}
                  aria-label={ru ? "Поиск яхт" : en ? "Search yachts" : "Yat ara"}
                  className="w-full rounded-xl border border-navy/10 bg-mist py-3 pl-10 pr-3 text-base text-navy outline-none focus:border-turquoise focus:bg-white focus:ring-2 focus:ring-turquoise/25 sm:text-sm"
                />
              </div>
            </div>
            <div role="listbox" aria-label={label} className="min-h-0 flex-1 overflow-y-auto px-2 pb-1">
              {list.length === 0 && <p className="px-3 py-6 text-center text-sm text-navy/50">{ru ? "Яхта не найдена." : en ? "No yacht found." : "Yat bulunamadı."}</p>}
              {list.map((b) => {
                const sel = b.slug === value;
                return (
                  <button
                    key={b.slug}
                    type="button"
                    role="option"
                    aria-selected={sel}
                    onClick={() => { onPick(b.slug); setOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${sel ? "bg-navy text-white" : "text-navy hover:bg-mist"}`}
                  >
                    <Thumb b={b} className="h-12 w-16 rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{b.name}</span>
                      <span className={`block truncate text-xs ${sel ? "text-white/60" : "text-navy/50"}`}>{[meta(b, en, ru), b.port].filter(Boolean).join(" · ")}</span>
                    </span>
                    {sel && <Ic d="M5 12.5l4.5 4.5L19 7.5" className="mr-1 text-turquoise" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function CompareSelect({ boats, a, b, lang }: { boats: PickBoat[]; a: string; b: string; lang: Lang }) {
  const router = useRouter();
  const en = lang !== "tr";
  const ru = lang === "ru";
  const [x, setX] = useState(a);
  const [y, setY] = useState(b);
  useEffect(() => { setX(a); setY(b); }, [a, b]);
  const ready = Boolean(x && y && x !== y);
  const same = x === a && y === b;
  const go = () => {
    if (!ready) return;
    router.push(`${href(lang, "/tekne-karsilastir")}?a=${encodeURIComponent(x)}&b=${encodeURIComponent(y)}#sonuc`);
  };
  return (
    <div>
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <Picker label={ru ? "Первая яхта" : en ? "First yacht" : "Birinci yat"} boats={boats} value={x} exclude={y} onPick={setX} en={en} ru={ru} />
        <div className="relative flex items-center justify-center md:px-1">
          <span className="absolute inset-x-0 top-1/2 h-px bg-navy/10 md:hidden" aria-hidden />
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-navy text-xs font-bold uppercase tracking-widest text-turquoise shadow-lg shadow-navy/20 ring-4 ring-white">vs</span>
        </div>
        <Picker label={ru ? "Вторая яхта" : en ? "Second yacht" : "İkinci yat"} boats={boats} value={y} exclude={x} onPick={setY} en={en} ru={ru} />
      </div>
      <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-navy/55">
          {ready ? (same ? (ru ? "Сравнение показано ниже." : en ? "The comparison is shown below." : "Karşılaştırma aşağıda.") : (ru ? "Готово. Нажмите «Сравнить», чтобы увидеть результат." : en ? "Ready. Tap compare to see the result." : "Hazır. Sonucu görmek için Karşılaştır'a dokunun.")) : ru ? "Выберите две яхты для сравнения." : en ? "Choose two yachts to compare." : "Karşılaştırmak için iki yat seçin."}
        </p>
        <button
          type="button"
          onClick={go}
          disabled={!ready}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-turquoise px-8 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-turquoise/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-navy/10 disabled:text-navy/40 disabled:shadow-none"
        >
          <Ic d={SEARCH} />
          {ru ? "Сравнить" : en ? "Compare" : "Karşılaştır"}
        </button>
      </div>
    </div>
  );
}
