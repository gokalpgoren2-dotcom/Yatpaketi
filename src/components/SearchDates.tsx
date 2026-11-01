"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { t, type Lang } from "@/lib/i18n";
import { todayIso } from "./DateRangePicker";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

type Props = {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  lang?: Lang;
  labelClass: string;
  fieldClass: string;
  icon: React.ReactNode;
};

// Booking tarzı tarih seçici: alana dokununca ekranın ortasında açılır, iki ay yan yana gösterilir (telefonda tek ay).
export function SearchDates({ start, end, onChange, lang = "tr", labelClass, fieldClass, icon }: Props) {
  const L = t(lang);
  const today = todayIso();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState("");
  const base = start || today;
  const [view, setView] = useState({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 });

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const short = (s: string) => new Date(s + "T00:00:00").toLocaleDateString(L.locale, { day: "numeric", month: "short" });
  const long = (s: string) => new Date(s + "T00:00:00").toLocaleDateString(L.locale, { day: "numeric", month: "long", year: "numeric" });
  const nights = start && end ? Math.round((Date.parse(end) - Date.parse(start)) / 86400000) : 0;
  const summary = start && end ? `${short(start)} – ${short(end)}` : start ? `${short(start)} – ${L.pickEnd}` : L.pickBoth;

  const canPrev = view.y > Number(today.slice(0, 4)) || view.m > Number(today.slice(5, 7)) - 1;
  function shift(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }

  function pick(day: string) {
    if (!start || end || day <= start) {
      onChange(day, "");
      setHover("");
    } else {
      onChange(start, day);
      setOpen(false);
    }
  }

  function month(offset: number, className: string) {
    const d = new Date(view.y, view.m + offset, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    const count = new Date(y, m + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
    const preview = start && !end && hover > start ? hover : "";
    return (
      <div className={className}>
        <p className="mb-3 text-center text-base font-semibold text-navy">{L.months[m]} {y}</p>
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-navy/45">
          {L.days.map((x) => <span key={x} className="py-1">{x}</span>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((n, i) => {
            if (n === null) return <span key={"e" + i} />;
            const day = iso(y, m, n);
            const off = day < today;
            const isStart = day === start;
            const isEnd = day === end || day === preview;
            const lastOfRange = end || preview;
            const inRange = Boolean(start && lastOfRange && day > start && day < lastOfRange);
            const band = (isStart && Boolean(lastOfRange) && lastOfRange > start) || inRange || (isEnd && day > start);
            return (
              <div key={day} className={`relative flex h-11 items-center justify-center ${inRange ? "bg-turquoise/15" : ""} ${isStart && lastOfRange ? "rounded-l-full bg-turquoise/15" : ""} ${isEnd && day > start ? "rounded-r-full bg-turquoise/15" : ""}`} data-band={band ? "1" : undefined}>
                <button
                  type="button"
                  disabled={off}
                  onClick={() => pick(day)}
                  onMouseEnter={() => setHover(day)}
                  aria-label={long(day)}
                  aria-pressed={isStart || day === end}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm tabular-nums transition ${
                    isStart || day === end
                      ? "bg-turquoise font-semibold text-white"
                      : off
                        ? "cursor-not-allowed text-navy/25 line-through"
                        : day === today
                          ? "font-semibold text-turquoise-dark ring-1 ring-turquoise/50 hover:bg-mist"
                          : "text-navy hover:bg-mist"
                  }`}
                >
                  {n}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const modal = open && (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label={L.date} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:p-7">
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className={`rounded-2xl border-2 px-4 py-2.5 ${!start || end ? "border-navy/10" : "border-navy/10"} ${!start ? "border-turquoise" : ""}`}>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-navy/50">{L.checkIn}</span>
            <span className={`text-base font-semibold ${start ? "text-navy" : "text-navy/40"}`}>{start ? long(start) : "—"}</span>
          </div>
          <div className={`rounded-2xl border-2 px-4 py-2.5 ${start && !end ? "border-turquoise" : "border-navy/10"}`}>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-navy/50">{L.checkOut}</span>
            <span className={`text-base font-semibold ${end ? "text-navy" : "text-navy/40"}`}>{end ? long(end) : "—"}</span>
          </div>
        </div>

        <div className="relative" onMouseLeave={() => setHover("")}>
          <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label={L.prevMonth} className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-xl text-navy hover:bg-mist disabled:opacity-25">‹</button>
          <button type="button" onClick={() => shift(1)} aria-label={L.nextMonth} className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-xl text-navy hover:bg-mist">›</button>
          <div className="grid gap-8 px-1 md:grid-cols-2">
            {month(0, "")}
            {month(1, "hidden md:block")}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-navy/10 pt-4">
          <button type="button" onClick={() => { onChange("", ""); setHover(""); }} className="text-sm font-semibold text-turquoise-dark disabled:opacity-30" disabled={!start}>{L.clear}</button>
          <span className="text-sm text-navy/60">{nights > 0 ? `${nights} ${lang === "en" ? (nights === 1 ? "night" : "nights") : "gece"}` : start && !end ? L.tapEnd : L.tapStart}</span>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-turquoise px-6 py-2.5 text-sm font-semibold text-white hover:bg-turquoise-dark">{L.applyDates}</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className="block w-full min-w-0 text-left">
        <span className={labelClass}>{icon}{L.date}</span>
        <span className={`${fieldClass} block ${start ? "" : "text-navy/50"}`}>{summary}</span>
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
