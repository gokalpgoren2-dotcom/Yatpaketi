"use client";

import { useEffect, useRef, useState } from "react";

// Telefonun kendi seçim penceresi yerine sitenin tasarımına uygun açılır liste.
// Masaüstünde alanın altında açılır kutu, telefonda alttan açılan panel olarak görünür.
// Seçilen değer gizli bir alanla forma gider; autoSubmit ise seçince form hemen gönderilir.
export type Opt = { value: string; label: string; note?: string };

export function FancySelect({
  name, options, defaultValue = "", title, icon, form, autoSubmit = false, compact = false, id,
}: {
  name: string; options: Opt[]; defaultValue?: string; title: string; icon?: React.ReactNode; form?: string; autoSubmit?: boolean; compact?: boolean; id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent | TouchEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("touchstart", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  const pick = (v: string) => {
    setValue(v);
    setOpen(false);
    if (input.current) input.current.value = v;
    if (autoSubmit) input.current?.form?.requestSubmit();
  };

  const chev = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`shrink-0 text-navy/40 transition ${open ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>;

  return (
    <div ref={box} className="relative">
      <input ref={input} type="hidden" name={name} value={value} form={form} readOnly />
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={compact
          ? "flex items-center gap-2 rounded-full border border-navy/10 bg-white py-2 pl-4 pr-3 text-sm font-semibold text-navy transition hover:border-turquoise/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-turquoise/30"
          : `flex w-full items-center gap-2.5 rounded-xl border bg-mist px-3.5 py-3 text-left text-sm font-medium text-navy transition hover:border-turquoise/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-turquoise/30 ${open ? "border-turquoise bg-white ring-2 ring-turquoise/25" : "border-navy/10"}`}
      >
        {icon && <span className="shrink-0 text-turquoise-dark">{icon}</span>}
        <span className="min-w-0 flex-1 truncate">{current?.label}</span>
        {chev}
      </button>

      {open && (
        <>
          {/* telefonda arka plan karartması */}
          <div className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-[2px] sm:hidden" aria-hidden onClick={() => setOpen(false)} />
          <div
            role="listbox"
            aria-label={title}
            className={`fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-3xl bg-white p-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-[calc(100%+0.5rem)] sm:max-h-80 sm:rounded-2xl sm:p-2 sm:ring-1 sm:ring-navy/10 ${compact ? "sm:right-0 sm:w-60" : "sm:left-0 sm:w-full sm:min-w-[16rem]"}`}
          >
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-navy/15 sm:hidden" aria-hidden />
            <p className="px-3 pb-2 pt-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-navy/45 sm:hidden">{title}</p>
            {options.map((o) => {
              const sel = o.value === value;
              return (
                <button
                  key={o.value || "_"}
                  type="button"
                  role="option"
                  aria-selected={sel}
                  onClick={() => pick(o.value)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition sm:py-2.5 ${sel ? "bg-navy text-white" : "text-navy hover:bg-mist"}`}
                >
                  <span className="flex-1 font-medium">{o.label}</span>
                  {o.note && <span className={`text-xs ${sel ? "text-white/60" : "text-navy/40"}`}>{o.note}</span>}
                  {sel && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-turquoise"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
